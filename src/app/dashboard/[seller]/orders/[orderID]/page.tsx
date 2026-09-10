 // src/app/dashboard/[seller]/orders/[orderId]/page.tsx
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { ArrowLeft, FileText, User, MapPin, ShoppingBag, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const router = useRouter();

  // Computational Core Document States
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchOrderInvoiceDetails = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 1. SECURITY ISOLATION LOCK: Kunin ang store record row ng merchant
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        // 2. TRANSACTION PROFILE QUERY: Hahatakin ang totoong invoice specifications mula sa database
        const { data, error } = await supabase
          .from('orders')
          .select('id, total_amount, status, created_at, customer_name, customer_phone, shipping_address, store_id')
          .eq('id', orderId)
          .eq('store_id', storeData.id) // Sinisiguradong kanya ang order na tinitingnan niya
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          throw new Error('Hindi nahanap o walang pahintulot na basahin ang order invoice na ito.');
        }

        setOrder(data);
        setStatus(data.status);
      } catch (err: any) {
        console.error('Error fetching order components:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInvoiceDetails();
  }, [orderId, router]);

  // 3. SECURE TRANSITION HANDLER: Direktang magpapadala ng real-time state update sa Supabase table data row
  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      setStatus(newStatus);
    } catch (err: any) {
      console.error('Error saving logistics row update:', err.message);
      setErrorMessage(`Hindi na-update ang status: ${err.message}`);
    } compression: {
      setIsUpdating(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Hahatak ng detalye ng order invoice...</span>
        </div>
      </div>
    );
  }

  if (errorMessage && !order) {
    return (
      <main className="flex-1 p-6 md:p-10 bg-paper text-ink font-body space-y-4">
        <button onClick={() => router.push('/seller/orders')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono cursor-pointer">
          <ArrowLeft size={12} />
          <span>Bumalik sa Orders</span>
        </button>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-xl">
          <AlertCircle size={15} />
          <span>⚠️ {errorMessage}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 BREADCRUMB NAVIGATION */}
      <div>
        <button 
          onClick={() => router.push('/seller/orders')} 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
        >
          <ArrowLeft size={12} />
          <span>Bumalik sa Orders</span>
        </button>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Manage Order Fulfillment</h1>
        <p className="text-sm text-ink/50 mt-1">Review active transaction details, client profile addresses, and trigger logistical lifecycle updates.</p>
      </div>

      {/* RE-ROUTED ERROR NOTIFIER */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-xl">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MAIN INVOICE BOARD GRID CARD */}
      <div className="max-w-2xl bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-6">
        
        {/* Document Header Metadata */}
        <div className="flex items-center gap-3 border-b border-ink/5 pb-4">
          <div className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center text-ink/50 shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink font-mono uppercase tracking-wider">Order Invoice Record</h3>
            <p className="text-[11px] font-mono text-ink/40 mt-0.5">UID Profile hash: #{order.id}</p>
          </div>
        </div>

        {/* Dynamic Client Specification Parameters Sheets */}
        <div className="space-y-4 text-xs border-b border-ink/5 pb-6">
          <div className="flex items-start gap-4">
            <User size={15} className="text-ink/30 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide block">Customer Name</span>
              <span className="font-semibold text-ink text-sm block mt-0.5">{order.customer_name || 'Anonymous Buyer'}</span>
              {order.customer_phone && <span className="text-[11px] font-mono text-ink/50 block mt-0.5">Contact: {order.customer_phone}</span>}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin size={15} className="text-ink/30 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide block">Shipping Address Destination</span>
              <p className="font-medium text-ink/70 leading-relaxed mt-0.5 whitespace-pre-wrap">{order.shipping_address || 'No shipping address provided.'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <ShoppingBag size={15} className="text-ink/30 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide block">Total Transaction Gross Amount</span>
              <span className="font-mono font-bold text-base text-ink block mt-0.5">
                ₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* LOGISTICS CONTROLLER OPERATIONAL FOOTER ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-ink/5">
          <div>
            <span className="text-[10px] font-bold text-ink/40 uppercase block tracking-wider">Logistics Life-cycle Status</span>
            <span className={`text-xs font-bold font-mono tracking-wide uppercase inline-flex items-center gap-1.5 mt-1 ${
              status === 'completed' ? 'text-emerald-600' :
              status === 'shipped' ? 'text-blue-600' :
              status === 'cancelled' ? 'text-rose-600' :
              'text-amber-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                status === 'completed' ? 'bg-emerald-500' :
                status === 'shipped' ? 'bg-blue-500' :
                status === 'cancelled' ? 'bg-rose-500' :
                'bg-amber-500'
              }`} />
              {status}
            </span>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {status !== 'completed' && status !== 'cancelled' && (
              <>
                {status !== 'shipped' && (
                  <button 
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus('shipped')}
                    className="flex-1 sm:flex-none bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl text-xs shadow-xs hover:bg-blue-700 active:scale-95 transition disabled:opacity-40 cursor-pointer"
                  >
                    {isUpdating ? 'Updating...' : 'Mark as Shipped 🚚'}
                  </button>
                )}
                <button 
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus('completed')}
                  className="flex-1 sm:flex-none bg-ink text-paper font-semibold py-2 px-4 rounded-xl text-xs shadow-xs hover:bg-ink/90 active:scale-95 transition disabled:opacity-40 cursor-pointer"
                >
                  {isUpdating ? 'Updating...' : 'Complete Order ✓'}
                </button>
              </>
            )}
            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 font-mono select-none pr-2">
                <ShieldCheck size={14} /> Invoice fully fulfilled and settled
              </span>
            )}
          </div>
        </div>

      </div>

    </main>
  );
}
