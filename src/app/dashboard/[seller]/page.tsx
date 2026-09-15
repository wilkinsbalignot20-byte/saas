 // src/app/dashboard/[seller]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Truck, RefreshCw, ArrowUpRight, ExternalLink, Activity } from 'lucide-react';

export default function SellerMainDashboard() {
  const router = useRouter();
  const { seller } = useParams() as { seller: string };

  // Core Analytical Document States
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    grossSales: 0,
    totalOrders: 0,
    shippedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardAnalytics = async () => {
      try {
        setLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return router.push('/login');

        // 1. TENANT SECURITY LOCK: Verification engine parameter matching
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (!store) return;

        // 2. DATA AGGREGATION ENGINE: Fetch entries directly from ledger logs
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('store_id', store.id);

        if (!ordersError && orders) {
          const gross = orders
            .filter(o => o.status === 'completed' || o.status === 'shipped')
            .reduce((sum, o) => sum + Number(o.total_amount), 0);

          const shipped = orders.filter(o => o.status === 'shipped').length;

          setMetrics({
            grossSales: gross,
            totalOrders: orders.length,
            shippedOrders: shipped,
          });

          const sorted = [...orders]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
          
          setRecentOrders(sorted);
        }
      } catch (err) {
        console.error('Analytics system isolation crash:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink font-body">
        <div className="text-sm flex items-center gap-3 text-ink/40 animate-pulse">
          <RefreshCw size={16} className="animate-spin" />
          <span>Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 bg-paper text-ink font-body overflow-y-auto min-h-screen animate-in fade-in duration-200">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ink/5 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-ink">
            Overview — @{seller}
          </h1>
          <p className="text-sm text-ink/50">
            How your store is performing right now.
          </p>
        </div>
        
        <Link 
          href={`/store/${seller}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-ink/15 text-ink font-medium px-4 py-2.5 rounded-xl text-sm hover:bg-ink/5 active:scale-[0.98] transition-all select-none"
        >
          <span>View storefront</span>
          <ExternalLink size={14} strokeWidth={1.75} />
        </Link>
      </div>

      {/* REVENUE HERO + STAT STRIP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-ink text-paper rounded-2xl p-8 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-sm text-paper/50">Gross sales</span>
            <DollarSign size={18} className="text-teal" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-4xl md:text-5xl tracking-tight mt-4">
            ₱{metrics.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-dashed border-paper/15">
            <p className="text-sm text-paper/40">From completed and shipped orders</p>
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl divide-y divide-dashed divide-ink/10 flex flex-col">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <ShoppingBag size={16} className="text-ink/40" strokeWidth={1.75} />
              <div>
                <p className="text-sm text-ink/50">Total orders</p>
                <p className="text-xs text-ink/35">All orders logged to date</p>
              </div>
            </div>
            <span className="font-display font-bold text-xl text-ink">{metrics.totalOrders}</span>
          </div>

          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-marigold-dark" strokeWidth={1.75} />
              <div>
                <p className="text-sm text-ink/50">Shipped</p>
                <p className="text-xs text-ink/35">Currently in transit</p>
              </div>
            </div>
            <span className="font-display font-bold text-xl text-marigold-dark">{metrics.shippedOrders}</span>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-ink/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-ink/40" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-ink/70">Recent orders</h3>
          </div>
          <button 
            onClick={() => router.push(`/dashboard/${seller}/order`)}
            className="text-sm font-medium text-ink/50 hover:text-ink flex items-center gap-1 transition-colors"
          >
            <span>View all</span> <ArrowUpRight size={13} strokeWidth={1.75} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-sm text-ink/35">
            No orders yet. Share your store link to start getting sales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-paper text-ink/40 text-xs font-medium border-b border-ink/5">
                  <th className="py-3.5 px-6 font-medium">Order</th>
                  <th className="py-3.5 px-6 font-medium">Date</th>
                  <th className="py-3.5 px-6 font-medium">Total</th>
                  <th className="py-3.5 px-6 font-medium">Status</th>
                  <th className="py-3.5 px-6 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 text-ink/80">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-paper/60 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-6 font-mono text-xs text-ink/60">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    
                    {/* Date */}
                    <td className="py-4 px-6 text-ink/50 text-sm">
                      {new Date(order.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    
                    {/* Total */}
                    <td className="py-4 px-6 font-semibold text-ink">
                      ₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    
                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium text-xs ${
                        order.status === 'completed' ? 'bg-teal/10 text-teal' :
                        order.status === 'shipped' ? 'bg-marigold-dark/10 text-marigold-dark' :
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                        'bg-ink/5 text-ink/50'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.status === 'completed' ? 'bg-teal' :
                          order.status === 'shipped' ? 'bg-marigold-dark' :
                          order.status === 'cancelled' ? 'bg-rose-500' :
                          'bg-ink/30'
                        }`} />
                        {order.status}
                      </span>
                    </td>
                    
                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => router.push(`/dashboard/${seller}/order/${order.id}`)}
                        className="inline-flex items-center gap-1 border border-ink/10 hover:bg-ink hover:text-paper hover:border-ink text-ink/60 font-medium px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Manage</span>
                        <ArrowUpRight size={12} strokeWidth={1.75} />
                      </button>
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