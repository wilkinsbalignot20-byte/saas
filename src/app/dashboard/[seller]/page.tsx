 'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // 🌐 Gagamitin para sa malinis na storefront redirection tabs
import { TrendingUp, ShoppingBag, AlertTriangle, Ticket, Tag, ExternalLink } from 'lucide-react';

// 🚀 CRITICAL INJECTION ENGINE DIRECTIVE: Pinipilit ang Next.js na basahin ito bawat dynamic client query refresh
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ seller: string }>;
}

export default function SellerDashboard({ params }: PageProps) {
  const router = useRouter();
  
  // Unwrap parameters cleanly using async layer hooks standard Next.js 15
  const resolvedParams = use(params);
  const sellerSlug = resolvedParams.seller;

  const [loading, setLoading] = useState(true);
  const [merchantEmail, setMerchantEmail] = useState('');
  
  // Dynamic Tenant Registration & Storefront Routing States (Original Design States Locked)
  const [storeName, setStoreName] = useState('Store overview');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  // Individual parameters hooks para sa totoong kalkulasyon mula sa database tables
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [activeVouchersCount, setActiveVouchersCount] = useState(0);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        setMerchantEmail(session.user.email || '');

        // 1. QUERY EXTRACTION: Hahanapin ang data gamit ang unzipped sellerSlug metric parameter
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, name, slug, logo_url')
          .eq('slug', sellerSlug)
          .eq('owner_id', session.user.id)
          .maybeSingle();

        // 🟢 HARD SECURITY LOCK BOUNDARY: Kung blangko ang database, forced redirect patungong onboarding form area.
        if (storeError || !storeData) {
          console.error('Store profile not found or layout extraction mismatch.');
          router.push('/onboarding');
          return;
        }

        setStoreName(storeData.name);
        setLogoUrl(storeData.logo_url);
        setStoreSlug(storeData.slug);

        const activeStoreId = storeData.id;

        // 2. REAL DATABASE METRICS COMPUTATION:
        
        // A. Kumuha ng kabuuang halaga ng Total Revenue mula sa successful completed orders
        const { data: revenueData, error: revenueError } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('store_id', activeStoreId)
          .eq('status', 'completed');

        if (!revenueError && revenueData) {
          const sum = revenueData.reduce((acc, current) => acc + Number(current.total_amount || 0), 0);
          setTotalRevenue(sum);
        }

        // B. Kumuha ng bilang ng Active Orders Received na naghihintay ng fulfillment (pending, processing, shipped)
        const { count: pendingOrders, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', activeStoreId)
          .in('status', ['pending', 'processing', 'shipped']);

        if (!ordersError && pendingOrders !== null) {
          setOrdersCount(pendingOrders);
        }

        // C. Kumuha ng bilang ng Low Stock Products na ang dami ng stock ay lte 5 items
        const { count: lowStockItems, error: stockError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', activeStoreId)
          .lte('stock', 5);

        if (!stockError && lowStockItems !== null) {
          setLowStockCount(lowStockItems);
        }

      } catch (err) {
        console.error('Error fetching dynamic cloud analytical matrix codes:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sellerSlug) {
      fetchDashboardMetrics();
    }
  }, [sellerSlug, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-paper h-screen">
        <div className="animate-pulse text-sm font-medium text-ink/50 font-mono">
          Loading your secure merchant platform dashboard node…
        </div>
      </div>
    );
  }
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper min-h-screen">
      <header className="flex items-center justify-between border-b border-ink/5 pb-6">
        <div>
          <p className="text-sm text-ink/40 mb-1 font-mono">{merchantEmail}</p>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">
            {storeName}
          </h1>
          <p className="text-sm text-ink/50 mt-1">Here&apos;s how your store is doing today.</p>
        </div>

        {logoUrl && (
          <div className="w-14 h-14 rounded-full border border-ink/10 overflow-hidden shadow-sm flex items-center justify-center bg-white bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${logoUrl})` }}>
            <img 
              src={logoUrl} 
              alt={`${storeName} Logo`} 
              className="sr-only" 
              onError={(e) => (e.currentTarget.style.display = 'none')} 
            />
          </div>
        )}
      </header>

      {/* REVENUE HERO — Ang pinakamahalagang numero sa dashboard metrics mo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-ink text-paper rounded-2xl p-8 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-sm text-paper/50">Total revenue</span>
            <TrendingUp size={18} className="text-teal" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-4xl md:text-5xl tracking-tight mt-4">
            ₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-dashed border-paper/15">
            <p className="text-sm text-paper/40">Gross sales this month, from completed orders</p>
          </div>
        </div>

        {/* Tabular side rows metrics panel configuration */}
        <div className="bg-white border border-ink/10 rounded-2xl divide-y divide-dashed divide-ink/10 flex flex-col">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <ShoppingBag size={16} className="text-ink/40" strokeWidth={1.75} />
              <div>
                <p className="text-sm text-ink/50">Orders received</p>
                <p className="text-[11px] text-ink/35">Awaiting fulfillment or shipping</p>
              </div>
            </div>
            <span className="font-display font-bold text-xl text-ink">{ordersCount}</span>
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-marigold-dark" strokeWidth={1.75} />
              <div>
                <p className="text-sm text-ink/50">Low stock</p>
                <p className="text-[11px] text-ink/35">Products at 5 units or fewer</p>
              </div>
            </div>
            <span className="font-display font-bold text-xl text-marigold-dark">{lowStockCount}</span>
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <Ticket size={16} className="text-teal" strokeWidth={1.75} />
              <div>
                <p className="text-sm text-ink/50">Active campaigns</p>
                <p className="text-[11px] text-ink/35">Live vouchers and discounts</p>
              </div>
            </div>
            <span className="font-display font-bold text-xl text-ink">{activeVouchersCount}</span>
          </div>
        </div>
      </div>

      {/* OPERATIONAL HUBS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-ink/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-ink/60 mb-4">Recent activity</h3>
          <div className="border border-dashed border-ink/15 rounded-xl p-10 flex flex-col items-center text-center gap-3">
            <div className="w-9 h-9 rounded-full bg-ink/5 flex items-center justify-center">
              <Tag size={16} className="text-ink/30" strokeWidth={1.75} />
            </div>
            <p className="text-sm text-ink/40 max-w-xs">
              No new orders yet. Share your store link to start getting sales.
            </p>
          </div>
        </div>

        {/* STORE APPEARANCE CONTROL CONSOLE PANEL */}
        <div className="bg-white border border-ink/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink/60 mb-2">Store appearance</h3>
            <p className="text-sm text-ink/50 leading-relaxed">
              Update your logo, brand color, and layout to keep your storefront looking fresh.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="w-4 h-4 rounded-full bg-paper border border-ink/15" />
              <span className="w-4 h-4 rounded-full bg-ink" />
              <span className="w-4 h-4 rounded-full bg-teal" />
              <span className="w-4 h-4 rounded-full bg-marigold-dark" />
            </div>
          </div>

          {/* 🌐 GINADAGDAG: Ang "Tingnan ang Live Store" button link gateway controller */}
          {storeSlug ? (
            <Link 
              href={`/store/${storeSlug}`}
              target="_blank" // 🚀 BUKAS SA BAGONG TAB: Para makita ni merchant ang live shop nang hindi nawawala sa dashboard console
              className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs mt-6 hover:bg-ink/90 transition-all active:scale-[0.98] text-center inline-flex items-center justify-center gap-2 cursor-pointer select-none shadow-sm uppercase tracking-wide font-sans"
            >
              <span>Tingnan ang Live Store</span>
              <ExternalLink size={13} />
            </Link>
          ) : (
            <button 
              disabled
              className="w-full bg-gray-100 text-gray-400 font-semibold py-3.5 rounded-xl text-xs mt-6 text-center cursor-not-allowed opacity-50 uppercase tracking-wide"
            >
              Locating application store parameters...
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
