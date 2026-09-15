 // src/app/dashboard/[seller]/order/logistics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { ArrowLeft, Truck, Zap, Bike } from 'lucide-react';

export default function SellerLogisticsPage() {
  const router = useRouter();
  const { seller } = useParams() as { seller: string };
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [couriers, setCouriers] = useState({ jand: false, flash: false, lalamove: false });

  useEffect(() => {
    const initLogistics = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      const { data: store } = await supabase
        .from('stores')
        .select('id, courier_jand, courier_flash, courier_lalamove')
        .eq('owner_id', session.user.id)
        .maybeSingle();

      if (store) {
        setStoreId(store.id);
        setCouriers({ jand: store.courier_jand, flash: store.courier_flash, lalamove: store.courier_lalamove });
      }
      setLoading(false);
    };
    initLogistics();
  }, [router]);

  const toggleCourier = async (key: 'jand' | 'flash' | 'lalamove') => {
    if (!storeId) return;
    const nextValue = !couriers[key];
    setCouriers(prev => ({ ...prev, [key]: nextValue }));

    await supabase.from('stores').update({ [`courier_${key}`]: nextValue }).eq('id', storeId);
  };

  if (loading) return <div className="p-10 text-xs font-mono">Loading matrix...</div>;

  return (
    <main className="p-6 md:p-10 max-w-xl space-y-6 bg-paper text-ink">
      {/* HEADER */}
      <div className="space-y-2">
        <button onClick={() => router.push(`/dashboard/${seller}/order`)} className="flex items-center gap-1 text-xs text-ink/40 font-mono">
          <ArrowLeft size={12} /> Back
        </button>
        <h1 className="text-xl font-bold font-display">Logistics Settings</h1>
      </div>

      {/* COURIER TOGGLE LIST */}
      <div className="border border-ink/10 rounded-xl divide-y divide-ink/5 bg-white shadow-xs">
        {/* J&T */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 text-rose-600 px-2 py-1 rounded font-bold text-xs">J&T</div>
            <div>
              <h3 className="text-xs font-bold">J&T Express</h3>
              <p className="text-[11px] text-ink/40">Standard National COD</p>
            </div>
          </div>
          <input type="checkbox" checked={couriers.jand} onChange={() => toggleCourier('jand')} className="w-4 h-4 accent-ink cursor-pointer" />
        </div>

        {/* FLASH */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 text-amber-600 p-1.5 rounded"><Zap size={14} /></div>
            <div>
              <h3 className="text-xs font-bold">Flash Express</h3>
              <p className="text-[11px] text-ink/40">Economy Standard Package</p>
            </div>
          </div>
          <input type="checkbox" checked={couriers.flash} onChange={() => toggleCourier('flash')} className="w-4 h-4 accent-ink cursor-pointer" />
        </div>

        {/* LALAMOVE */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-orange-50 text-orange-600 p-1.5 rounded"><Bike size={14} /></div>
            <div>
              <h3 className="text-xs font-bold">Lalamove Instant</h3>
              <p className="text-[11px] text-ink/40">Same Day Local Delivery</p>
            </div>
          </div>
          <input type="checkbox" checked={couriers.lalamove} onChange={() => toggleCourier('lalamove')} className="w-4 h-4 accent-ink cursor-pointer" />
        </div>
      </div>
    </main>
  );
}
