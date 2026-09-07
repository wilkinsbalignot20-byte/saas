 // src/app/seller/orders/logistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { ArrowLeft, Zap, Bike, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SellerLogisticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Real-time multi-tenant data stream token state pointers
  const [storeId, setStoreId] = useState<string | null>(null);
  const [couriers, setCouriers] = useState({
    jand: true,
    flash: false,
    lalamove: true
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 1. DATABASE CORE OVERACTION: Hahatakin ang active courier preferences mula sa stores schema
  useEffect(() => {
    const fetchLogisticsSettings = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, courier_jand, courier_flash, courier_lalamove')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        setStoreId(storeData.id);
        setCouriers({
          jand: storeData.courier_jand,
          flash: storeData.courier_flash,
          lalamove: storeData.courier_lalamove
        });

      } catch (err: any) {
        console.error('Error fetching logistics matrix records:', err.message);
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLogisticsSettings();
  }, [router]);

  // 2. STATE INTERACTIVE MUTATION ENGINE: Awtomatikong nag-e-execute ng save call sa bawat click ng checkbox toggle
  const handleToggleCourier = async (courierKey: 'jand' | 'flash' | 'lalamove', newValue: boolean) => {
    if (!storeId) return;

    setIsSaving(true);
    setMessage('');

    // Agarang update sa screen para maging responsive sa mata ng merchant user
    const updatedCouriers = { ...couriers, [courierKey]: newValue };
    setCouriers(updatedCouriers);

    try {
      const dbColumnName = `courier_${courierKey}`;
      
      const { error } = await supabase
        .from('stores')
        .update({ [dbColumnName]: newValue })
        .eq('id', storeId);

      if (error) throw error;
      
      setMessage('🎉 Logistics configuration system successfully synced!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('Error updating delivery settings node:', err.message);
      setMessage(`❌ Error sa pag-save: ${err.message}`);
      // Ibalik sa orihinal na states ang UI layout kapag nagkaroon ng error response loop
      setCouriers(couriers);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 BREADCRUMB & HEADER HUB BAR */}
      <div className="flex flex-col gap-5 border-b border-ink/5 pb-5">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/seller/orders')} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Back to Orders</span>
          </button>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Integrated Courier Logistics</h1>
          <p className="text-sm text-ink/50">Toggle active shipping providers available for your customer dynamic storefront checkout options.</p>
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
          {/* INAYOS: Isang saktong link patungong multi-tenant logistics folder view nang walang illegal structures */}
          <button 
            onClick={() => router.push('/seller/orders/logistics')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname === '/seller/orders/logistics' ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>🚚 Logistics</span>
          </button>
        </div>
      </div>

      {/* COMPONENT MESSAGE DISPATCHER BLOCK */}
      {message && (
        <div className={`p-4 rounded-xl text-xs max-w-xl font-medium border flex items-center gap-2 ${
          message.startsWith('❌') 
            ? 'bg-rose-50/50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {message.startsWith('❌') ? <AlertCircle size={15} /> : <ShieldCheck size={15} />}
          <span>{message}</span>
        </div>
      )}

      {/* COURIER CONFIGURATION CARDS CONTAINER */}
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-ink/5 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40">Available Shipping Gateways</h3>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium font-mono bg-emerald-50 px-2 py-0.5 rounded-full">
            <ShieldCheck size={12} /> {isSaving ? 'Syncing...' : 'Live API Webhooks'}
          </span>
        </div>

        {/* J&T EXPRESS CARD */}
        <div className={`flex justify-between items-center bg-white p-5 rounded-2xl border transition-all shadow-sm ${couriers.jand ? 'border-ink/20' : 'border-ink/5 opacity-40'}`}>
          <div className="flex items-start gap-4">
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl shrink-0 mt-0.5 font-bold text-xs tracking-tight select-none">
              J&T
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
                J&T Express Integration
              </h4>
              <p className="text-xs text-ink/50 mt-0.5 leading-relaxed max-w-md">
                Standard national cash-on-delivery shipping network. Supports automatic airwaybill (AWB) generation via n8n backend runner.
              </p>
            </div>
          </div>
          <div className="relative flex items-center h-5">
            <input 
              type="checkbox" 
              disabled={loading || isSaving}
              checked={couriers.jand} 
              onChange={(e) => handleToggleCourier('jand', e.target.checked)} 
              className="w-4 h-4 rounded border-ink/15 cursor-pointer appearance-none checked:bg-ink relative checked:after:content-['✓'] checked:after:text-paper checked:after:text-[10px] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:font-bold disabled:opacity-50" 
            />
          </div>
        </div>

        {/* FLASH EXPRESS CARD */}
        <div className={`flex justify-between items-center bg-white p-5 rounded-2xl border transition-all shadow-sm ${couriers.flash ? 'border-ink/20' : 'border-ink/5 opacity-40'}`}>
          <div className="flex items-start gap-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl shrink-0 mt-0.5">
              <Zap size={18} strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
                Flash Express Delivery
              </h4>
              <p className="text-xs text-ink/50 mt-0.5 leading-relaxed max-w-md">
                Automated economy standard parcel shipment pipeline. Ideal for bulk lightweight packaging with dynamic pickup requests.
              </p>
            </div>
          </div>
          <div className="relative flex items-center h-5">
            <input 
              type="checkbox" 
              disabled={loading || isSaving}
              checked={couriers.flash} 
              onChange={(e) => handleToggleCourier('flash', e.target.checked)} 
              className="w-4 h-4 rounded border-ink/15 cursor-pointer appearance-none checked:bg-ink relative checked:after:content-['✓'] checked:after:text-paper checked:after:text-[10px] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:font-bold disabled:opacity-50" 
            />
          </div>
        </div>

        {/* LALAMOVE CARD */}
        <div className={`flex justify-between items-center bg-white p-5 rounded-2xl border transition-all shadow-sm ${couriers.lalamove ? 'border-ink/20' : 'border-ink/5 opacity-40'}`}>
          <div className="flex items-start gap-4">
            <div className="bg-orange-50 text-orange-600 p-3 rounded-xl shrink-0 mt-0.5">
              <Bike size={18} strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-ink flex items-center gap-2">
                Lalamove Instant Rider
              </h4>
              <p className="text-xs text-ink/50 mt-0.5 leading-relaxed max-w-md">
                On-demand intra-city same day express local shipping channel. Automatically estimates motorcycle or sedan base rates at customer checkout storefronts.
              </p>
            </div>
          </div>
          <div className="relative flex items-center h-5">
            <input 
              type="checkbox" 
              disabled={loading || isSaving}
              checked={couriers.lalamove} 
              onChange={(e) => handleToggleCourier('lalamove', e.target.checked)} 
              className="w-4 h-4 rounded border-ink/15 cursor-pointer appearance-none checked:bg-ink relative checked:after:content-['✓'] checked:after:text-paper checked:after:text-[10px] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:font-bold disabled:opacity-50" 
            />
          </div>
        </div>

      </div>

    </main>
  );
}
