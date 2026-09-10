 // src/app/dashboard/[seller]/orders/page.tsx (o seller/orders/returns/page.tsx base sa directory tree layout niyan)
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { FileText, Calendar, ShoppingBag, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';

export default function SellerOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        // 1. DYNAMIC SESSION GUARD: Alamin kung sino ang active merchant gamit ang trusted SSR wrapper session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 2. TENANT ID ISOLATION LOCK: Hanapin ang saktong store record row na pag-aari ng active user
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        const activeStoreId = storeData.id;

        // 3. REAL DATABASE QUERY ENGINE: Kukuha ng totoong live entries mula sa public orders sheet logs
        // Tinanggal ang lahat ng hardcoded example or mock validation fallback blocks context layers
        let query = supabase
          .from('orders')
          .select('id, total_amount, status, created_at')
          .eq('store_id', activeStoreId);

        // CONDITIONAL INTERFACE FILTER RULE: Kung ang page na ito ay nakalagay sa /returns directory path,
        // mag-filter lamang ng orders na may operational parameters na cancelled or pending transaction returns
        if (pathname.includes('/returns')) {
          query = query.eq('status', 'cancelled');
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);

      } catch (err: any) {
        console.error('Error loading merchant sales channel orders:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [pathname, router]);
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 HEADER SECTION WITH DYNAMIC TABS */}
      <div className="flex flex-col gap-5 border-b border-ink/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">
            {pathname.includes('/returns') ? 'Customer Returns & Refunds' : 'Orders & Fulfillment'}
          </h1>
          <p className="text-sm text-ink/50 mt-1">
            {pathname.includes('/returns') 
              ? 'Track cancelled transactions, reverse invoices, and review returned item catalog streams.' 
              : 'Track pending transactions, manage logistical status, and view customer purchase invoices.'}
          </p>
        </div>
        
        {/* SUB-FOLDER SEGMENTED CONTROLS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-ink/5 rounded-xl w-max max-w-full text-xs font-semibold">
          <button 
            onClick={() => router.push('/seller/orders')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname === '/seller/orders' ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>📋 All Orders</span>
          </button>
          <button 
            onClick={() => router.push('/seller/orders/returns')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname.includes('/returns') ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>🔄 Customer Returns</span>
          </button>
          <button 
            onClick={() => router.push('/seller/orders/logistics')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname.includes('/logistics') ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>🚚 Logistics</span>
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE PANEL */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-xl">
          <AlertCircle size={15} />
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

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
          <p className="max-w-md mx-auto leading-relaxed text-xs">
            {pathname.includes('/returns') 
              ? 'No cancelled or returned order transactions logs recorded for your shop yet.' 
              : 'No orders received yet. Once customers purchase from your storefront catalog, incoming logs will record here.'}
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
                        <span className="truncate max-w-[120px]">#{order.id}</span>
                      </div>
                    </td>
                    
                    {/* Date */}
                    <td className="py-4 px-6 text-ink/60 font-medium">
                      <span>{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </td>
                    
                    {/* Amount */}
                    <td className="py-4 px-6 font-mono font-bold text-ink text-sm">
                      ₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    
                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[10px] tracking-wide uppercase ${
                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                        order.status === 'cancelled' ? 'bg-rose-50 text-rose-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.status === 'completed' ? 'bg-emerald-500' :
                          order.status === 'pending' ? 'bg-amber-500' :
                          order.status === 'cancelled' ? 'bg-rose-500' :
                          'bg-blue-500'
                        }`} />
                        {order.status}
                      </span>
                    </td>
                    
                    {/* Action Trigger */}
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => router.push(`/seller/orders/${order.id}`)}
                        className="inline-flex items-center gap-1.5 bg-ink text-paper font-semibold px-3 py-2 rounded-xl text-[11px] hover:bg-ink/90 transition-all shadow-sm active:scale-95 group cursor-pointer"
                      >
                        <span>Manage Order</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform pointer-events-none" />
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
