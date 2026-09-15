 // src/app/dashboard/[seller]/orders/[orderId]/page.tsx
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { generateShippingAirwayBill } from '../../../../../lib/courier'; // Ikinabit ang iyong courier generator
import { ArrowLeft, FileText, User, MapPin, ShoppingBag, ShieldCheck, RefreshCw, AlertCircle, Package } from 'lucide-react';

interface PageProps {
  params: Promise<{ orderid: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderid;
  const router = useRouter();

  // Computational Core Document States
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]); // Bagong state para sa mga biniling items
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Local input parameters para sa custom manual shipping workflow
  const [courierCode, setCourierCode] = useState<'jnt' | 'flash' | 'spx'>('jnt');

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

        // 2. TRANSACTION PROFILE QUERY: Hahatakin kasama ang mga bagong shipping at tracking fields
        const { data, error } = await supabase
          .from('orders')
          .select('id, total_amount, shipping_fee, status, created_at, customer_name, customer_phone, shipping_address, store_id, tracking_number, courier_name')
          .eq('id', orderId)
          .eq('store_id', storeData.id) // Multi-tenant context boundary check
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          throw new Error('Hindi nahanap o walang pahintulot na basahin ang order invoice na ito.');
        }

        setOrder(data);
        setStatus(data.status);

        // 3. ORDER ITEMS RELATIONAL JOIN FETCH: Kunin ang mga biniling produkto
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            price_at_purchase,
            products (
              name,
              image_url
            )
          `)
          .eq('order_id', orderId);

        if (!itemsError && items) {
          setOrderItems(items);
        }

      } catch (err: any) {
        console.error('Error fetching order components:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInvoiceDetails();
  }, [orderId, router]);

  // 4. SECURE TRANSITION & LOGISTICS AUTOMATION TRIGGER HANDLER
  const handleFulfillShipment = async () => {
    if (!order) return;
    setIsUpdating(true);
    setErrorMessage('');

    try {
      // Patakbuhin ang courier matrix engine na ginawa natin sa src/lib/courier.ts
      const shippingResult = await generateShippingAirwayBill({
        orderId: order.id,
        storeId: order.store_id,
        customerName: order.customer_name || 'Anonymous Buyer',
        phoneNumber: order.customer_phone || '',
        deliveryAddress: order.shipping_address || '',
        courierCode: courierCode
      });

      if (!shippingResult.success) {
        throw new Error(shippingResult.error || 'Nabigo ang shipping engine automation.');
      }

      // I-sync ang UI state sa naging bagong status mula sa database automation lock
      setStatus('shipped');
      
      // I-refresh ang order data upang lumabas ang bagong tracking number sa screen
      setOrder((prev: any) => ({
        ...prev,
        status: 'shipped',
        tracking_number: shippingResult.trackingNumber,
        courier_name: shippingResult.provider
      }));

    } catch (err: any) {
      console.error('Error saving logistics row update:', err.message);
      setErrorMessage(`Hindi na-update ang shipment: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. STANDARD COMPLETED TRANSITION FOR FINAL SETTLEMENT
  const handleCompleteOrder = async () => {
    if (!order) return;
    setIsUpdating(true);
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)
        .eq('store_id', order.store_id);

      if (error) throw error;
      setStatus('completed');
    } catch (err: any) {
      setErrorMessage(`Error finalizing order: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-sm font-medium flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw size={24} className="animate-spin text-gray-400" />
          <span>Hahatak ng detalye ng order invoice...</span>
        </div>
      </div>
    );
  }

  if (errorMessage && !order) {
    return (
      <main className="flex-1 p-6 md:p-10 bg-gray-50 text-gray-900 space-y-4">
        <button onClick={() => router.push('/seller/orders')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors font-mono cursor-pointer">
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
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-gray-50 text-gray-900 animate-in fade-in duration-300">
      
      {/* 🧭 BREADCRUMB NAVIGATION */}
      <div>
        <button 
          onClick={() => router.push('/seller/orders')} 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors font-mono mb-2 cursor-pointer"
        >
          <ArrowLeft size={12} />
          <span>Bumalik sa Orders</span>
        </button>
        <h1 className="font-bold text-2xl md:text-3xl tracking-tight">Manage Order Fulfillment</h1>
        <p className="text-sm text-gray-500 mt-1">Review active transaction details, client profile addresses, and trigger logistical lifecycle updates.</p>
      </div>

      {/* RE-ROUTED ERROR NOTIFIER */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-2xl">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MAIN INVOICE BOARD GRID CARD */}
      <div className="max-w-2xl bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
        
        {/* Document Header Metadata */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider">Order Invoice Record</h3>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">UID Profile hash: #{order.id}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Client Specification Parameters Sheets */}
        <div className="space-y-4 text-xs border-b border-gray-100 pb-6">
          <div className="flex items-start gap-4">
            <User size={15} className="text-gray-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Customer Name</span>
              <span className="font-semibold text-sm block mt-0.5">{order.customer_name || 'Anonymous Buyer'}</span>
              {order.customer_phone && <span className="text-[11px] font-mono text-gray-500 block mt-0.5">Contact: {order.customer_phone}</span>}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Shipping Address Destination</span>
              <p className="font-medium text-gray-600 leading-relaxed mt-0.5 whitespace-pre-wrap">{order.shipping_address || 'No shipping address provided.'}</p>
            </div>
          </div>

          {/* LISTAHAN NG MGA PRODUKTONG BINILI (ORDER ITEMS DISPLAY) */}
          <div className="flex items-start gap-4 pt-2 border-t border-gray-50">
            <Package size={15} className="text-gray-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-2">Purchased Items</span>
              {/* ITO ANG KARUGTONG MULA SA PURCHASED ITEMS */}
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      {item.products?.image_url && (
                        <img src={item.products.image_url} alt="" className="w-8 h-8 object-cover rounded bg-white border" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-[12px]">{item.products?.name || 'Unknown Product'}</p>
                        <p className="text-[10px] text-gray-400 font-mono">Qty: {item.quantity} × ₱{Number(item.price_at_purchase).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-700 text-[11px]">
                      ₱{Number(item.quantity * item.price_at_purchase).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SHIPPING FEE AND TOTAL SUMMARY ROW */}
          <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
            <ShoppingBag size={15} className="text-gray-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 flex justify-between items-center bg-gray-50 p-3 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Financial Breakdown</span>
                <span className="text-[11px] text-gray-500 block">Shipping: ₱{Number(order.shipping_fee).toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Total Gross Amount</span>
                <span className="font-mono font-bold text-base text-gray-900 block">
                  ₱{Number(order.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE TRACKING MANIFEST CARD (Lalabas lang kapag shipped na) */}
        {order?.tracking_number && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs space-y-1">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Active Tracking Manifest</span>
            <p className="font-medium text-blue-900">Courier: <span className="font-bold">{order.courier_name}</span></p>
            <p className="font-mono text-blue-800">Tracking Code: <span className="font-bold tracking-widest">{order.tracking_number}</span></p>
          </div>
        )}

        {/* LOGISTICS CONTROLLER OPERATIONAL FOOTER ACTION BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Logistics Life-cycle Status</span>
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

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-end">
            {status !== 'completed' && status !== 'cancelled' && (
              <>
                {status !== 'shipped' && (
                  <div className="flex gap-1 w-full sm:w-auto items-center bg-white p-1 rounded-xl border border-gray-200">
                    {/* Selector para sa gagamiting manual tracking template */}
                    <select 
                      value={courierCode} 
                      onChange={(e) => setCourierCode(e.target.value as any)}
                      className="text-[11px] font-mono bg-transparent border-0 outline-none p-1 text-gray-600 cursor-pointer"
                    >
                      <option value="jnt">J&T Express</option>
                      <option value="flash">Flash Express</option>
                      <option value="spx">Shopee Xpress</option>
                    </select>

                    <button 
                      type="button"
                      disabled={isUpdating}
                      onClick={handleFulfillShipment}
                      className="bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg text-xs hover:bg-blue-700 active:scale-95 transition disabled:opacity-40 cursor-pointer whitespace-nowrap"
                    >
                      {isUpdating ? 'Booking...' : 'Arrange Shipment 🚚'}
                    </button>
                  </div>
                )}
                
                <button 
                  type="button"
                  disabled={isUpdating}
                  onClick={handleCompleteOrder}
                  className="w-full sm:w-auto bg-gray-900 text-white font-semibold py-2 px-4 rounded-xl text-xs hover:bg-gray-800 active:scale-95 transition disabled:opacity-40 cursor-pointer"
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
