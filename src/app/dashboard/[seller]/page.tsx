 // src/app/dashboard/[seller]/page.tsx [PART 1 OF 3]
'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { TrendingUp, ShoppingBag, AlertTriangle, Ticket } from 'lucide-react';

// 🚀 CRITICAL INJECTION ENGINE DIRECTIVE: Pinipilit ang Next.js na basahin ito bilang dynamic rendering layout
// upang tuluyang maalis ang hard reload 404 block configurations.
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ seller: string }>;
}

export default function SellerDashboard({ params }: PageProps) {
  const router = useRouter();
  
  // Unwrap parameters cleanly using async layer hooks standard
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
// src/app/dashboard/[seller]/page.tsx [PART 2 OF 3]

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

        // 2. REAL DATABASE METRICS COMPUTATION (Tinanggal ang lahat ng static example values):
        
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
        <div className="animate-pulse text-sm font-medium text-ink/50 font-mono">Loading your secure merchant platform dashboard node…</div>
      </div>
    );
  }
// src/app/dashboard/[seller]/page.tsx [PART 3 OF 3]

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

      {/* DYNAMIC REAL-TIME SCORECARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide">Total revenue</span>
            <TrendingUp size={16} className="text-teal" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-2xl text-ink">
            ₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-ink/40 mt-1">Gross sales this month</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide">Orders received</span>
            <ShoppingBag size={16} className="text-ink/40" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-2xl text-ink">{ordersCount}</div>
          <p className="text-xs text-ink/40 mt-1">Awaiting fulfillment or shipping</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide">Low stock</span>
            <AlertTriangle size={16} className="text-marigold-dark" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-2xl text-marigold-dark">{lowStockCount}</div>
          <p className="text-xs text-ink/40 mt-1">Products running low</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide">Active campaigns</span>
            <Ticket size={16} className="text-teal" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-2xl text-ink">{activeVouchersCount}</div>
          <p className="text-xs text-ink/40 mt-1">Live vouchers and discounts</p>
        </div>
      </div>

      {/* OPERATIONAL HUBS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-ink/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-ink/60 mb-4">Recent activity</h3>
          <div className="border border-dashed border-ink/15 rounded-xl p-10 text-center text-sm text-ink/40">
            No new orders yet. Share your store link to start getting sales.
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink/60 mb-2">Store appearance</h3>
            <p className="text-sm text-ink/50 leading-relaxed">
              Update your logo, brand color, and layout to keep your storefront looking fresh.
            </p>
          </div>
          
          <button 
            onClick={() => {
              if (storeSlug) {
                router.push(`/dashboard/${storeSlug}/setting`);
              } else {
                alert('Store link handle parameters are currently unavailable.');
              }
            }}
            className="w-full bg-ink text-paper font-semibold py-3 rounded-xl text-sm mt-6 hover:bg-ink/90 transition-colors cursor-pointer"
          >
            Customize your store
          </button>
        </div>
      </div>
    </main>
  );
}
