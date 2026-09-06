 'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, Calendar, Wallet, ShoppingBag, Eye, RefreshCw, Layers, ArrowRight } from 'lucide-react';

export default function SellerOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. KUKUHA NG MGA ORDERS NG MERCHANT MULA SA SUPABASE
  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('store_id', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d')
          .order('created_at', { ascending: false });

        // 🛠️ MOCK DATA PRACTICE FALLBACK:
        if (error || !data || data.length === 0) {
          setOrders([
            { id: 'ORD-2026-X99', created_at: new Date().toISOString(), total_amount: 450.00, status: 'pending' },
            { id: 'ORD-2026-Y88', created_at: new Date().toISOString(), total_amount: 150.00, status: 'completed' }
          ]);
        } else {
          setOrders(data);
        }
      } catch (err) {
        console.error('Error loading merchant sales channel orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, []);

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 HEADER SECTION WITH DYNAMIC TABS */}
      <div className="flex flex-col gap-5 border-b border-ink/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Orders & Fulfillment</h1>
          <p className="text-sm text-ink/50 mt-1">Track pending transactions, manage logistical status, and view customer purchase invoices.</p>
        </div>
        
        {/* SUB-FOLDER SEGMENTED CONTROLS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-ink/5 rounded-xl w-max max-w-full text-xs font-semibold">
          <button 
            onClick={() => router.push('/seller/orders')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              pathname === '/seller/orders' ? 'bg-white text-ink shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>📋 All Orders</span>
          </button>
          <button 
            onClick={() => router.push('/seller/orders/returns')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              pathname === '/seller/orders/returns' ? 'bg-white text-ink shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>🔄 Customer Returns</span>
          </button>
          <button 
            onClick={() => router.push('/seller/orders/logistics')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              pathname === '/seller/orders/logistics' ? 'bg-white text-ink shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>🚚 Logistics</span>
          </button>
        </div>
      </div>

      {/* 📊 ORDERS DATA LOG LISTING BOARD */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <div className="text-sm font-medium text-ink/50">Loading purchase invoice streams...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-ink/10 rounded-2xl p-12 text-center text-sm text-ink/40 shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="bg-ink/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-ink/40">
            <ShoppingBag size={20} />
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            No orders received yet. Once customers purchase from your storefront catalog, incoming transaction logs will record automatically here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-ink/50 font-semibold border-b border-ink/5 uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Date Created</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Delivery Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 text-xs">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Order ID */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-mono font-bold text-ink/70">
                        <FileText size={14} className="text-ink/30" strokeWidth={1.75} />
                        <span>#{order.id}</span>
                      </div>
                    </td>
                    
                    {/* Date */}
                    <td className="py-4 px-6 text-ink/60 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-ink/30" />
                        <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    
                    {/* Amount */}
                    <td className="py-4 px-6 font-mono font-bold text-ink text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-ink/40 font-sans font-normal text-xs">₱</span>
                        <span>{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                    
                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[10px] tracking-wide uppercase ${
                        order.status === 'completed' 
                          ? 'bg-teal/10 text-teal' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'completed' ? 'bg-teal' : 'bg-amber-500'}`} />
                        {order.status}
                      </span>
                    </td>
                    
                    {/* Action Trigger */}
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => router.push(`/seller/orders/${order.id}`)}
                        className="inline-flex items-center gap-1.5 bg-ink text-paper font-semibold px-3 py-2 rounded-xl text-[11px] hover:bg-ink/90 transition-all shadow-sm active:scale-95 group"
                      >
                        <span>Manage Order</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
