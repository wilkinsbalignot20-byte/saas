 // src/app/seller/insights/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { BarChart3, TrendingUp, ShoppingBag, Award, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface TopProduct {
  name: string;
  price: number;
  stock: number;
}

export default function SellerInsightsMainPage() {
  const router = useRouter();
  
  // High-Performance Data Analysis Analytical States
  const [totalSalesVolume, setTotalSalesVolume] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchGlobalShopAnalytics = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 1. IDENTITY BLOCK SECURITY ENFORCEMENT: Kunin ang store id na pag-aari ng active user account
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        const activeStoreId = storeData.id;

        // 2. TRANSACTION LOGS LEDGER AGGREGATIONS:
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('total_amount, status')
          .eq('store_id', activeStoreId);

        if (ordersError) throw ordersError;

        if (orders) {
          // Awtomatikong lilikha ng sum volume mula sa mga transaksyong settled completed
          const sumSales = orders
            .filter(o => o.status === 'completed')
            .reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
          
          setTotalSalesVolume(sumSales);
          setOrdersCount(orders.length);
        }

        // 3. PRODUCT INTENT HIGHLIGHT TRACKER: Hahatakin ang hanggang 3 aitems ng merchant para sa top list reference
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('name, price, stock')
          .eq('store_id', activeStoreId)
          .order('stock', { ascending: true }) // Sample ranking optimization criteria metric
          .limit(3);

        if (!productsError && productsData) {
          setTopProducts(productsData);
        }

      } catch (err: any) {
        console.error('Error compiling analytical intelligence node channels:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalShopAnalytics();
  }, [router]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Compiling business intelligence dashboard feeds...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER BAR HUB */}
      <header className="border-b border-ink/5 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink flex items-center gap-2">
            <BarChart3 className="text-teal" size={24} />
            <span>Store Performance Insights</span>
          </h1>
          <p className="text-sm text-ink/50 mt-1">Review aggregated gross metric sales trends, order volumes, and catalog catalog analytics items.</p>
        </div>

        {/* REDIRECTION CONNECTOR MODULE LINK TRIGGER */}
        <Link 
          href="/seller/insights/conversion" 
          className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 transition cursor-pointer shrink-0 select-none"
        >
          <span>View Conversion Funnel</span>
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* RE-ROUTED ERROR NOTIFIER BLOCK */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-xl">
          <AlertCircle size={15} />
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* CORE OPERATIONAL ANALYSIS CARD MATRIX GRIDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        
        {/* TOTAL SHOPPING SETTLED VOLUME COUNTER */}
        <div className="bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide flex items-center gap-1.5 select-none">
            <TrendingUp size={12} className="text-emerald-600" />
            <span>Total Gross Analytics Sales</span>
          </span>
          <div className="text-3xl font-bold font-display tracking-tight text-ink flex items-baseline gap-1 pt-1">
            <span className="text-sm font-sans font-normal text-ink/40">₱</span>
            <span>{totalSalesVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <p className="text-[11px] text-ink/40 pt-2 leading-relaxed select-none">Accumulated revenue generated exclusively from successfully settled and completed database order invoices.</p>
        </div>

        {/* TOTAL INTENT VOLUME INTERFACE CHECKER */}
        <div className="bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide flex items-center gap-1.5 select-none">
            <ShoppingBag size={12} className="text-ink/40" />
            <span>Gross Order Traffic Count</span>
          </span>
          <div className="text-3xl font-bold font-display tracking-tight text-ink flex items-baseline gap-1 pt-1">
            <span>{ordersCount}</span>
            <span className="text-xs text-ink/40 font-normal font-sans ml-1">inbound logs</span>
          </div>
          <p className="text-[11px] text-ink/40 pt-2 leading-relaxed select-none">Total raw order invoice instances recorded inside your storefront logs cluster matching your unique tenant identifier.</p>
        </div>

      </div>

      {/* TOP PERFORMING CATALOG PRODUCTS DISPLAY WIDGET ROW SHEET */}
      <div className="max-w-2xl border border-ink/10 rounded-2xl bg-white shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-ink/5 pb-3">
          <Award size={16} className="text-teal" />
          <h3 className="font-semibold text-sm text-ink">Top Live Catalog Items Preview</h3>
        </div>

        {topProducts.length === 0 ? (
          <div className="text-center py-6 text-xs text-ink/40 select-none">
            Walang sapat na mga aitems na nahanap sa imbentaryo upang mag-kalkula ng ranking data tables.
          </div>
        ) : (
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-ink/40 font-bold uppercase tracking-wider text-[10px] border-b border-ink/5 bg-gray-50/50">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-right">Base Price</th>
                  <th className="py-3 px-4 text-center">Current Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 font-medium">
                {topProducts.map((prod, index) => (
                  <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-ink">{prod.name}</td>
                    <td className="py-3 px-4 text-right font-mono text-ink/70">
                      ₱{Number(prod.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] tracking-wide uppercase ${prod.stock > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                        {prod.stock} units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </main>
  );
}
