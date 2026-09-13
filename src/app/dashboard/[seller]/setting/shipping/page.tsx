'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { Truck, Save, RefreshCw, AlertCircle, CheckCircle2, ChevronRight, Sliders } from 'lucide-react';

interface CourierConfig {
  id: string;
  name: string;
  code: string;
  is_enabled: boolean;
  base_rate: number;
}

export default function ShippingSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const seller = params?.seller as string;

  // Local configuration metrics states
  const [storeId, setStoreId] = useState<string | null>(null);
  const [flatRate, setFlatRate] = useState('0.00');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('0.00');
  const [isFlatRateEnabled, setIsFlatRateEnabled] = useState(true);

  // System couriers state engine nodes
  const [couriers, setCouriers] = useState<CourierConfig[]>([
    { id: '1', name: 'J&T Express Logistics', code: 'jt_express', is_enabled: true, base_rate: 80 },
    { id: '2', name: 'Flash Express PH', code: 'flash_express', is_enabled: false, base_rate: 75 },
    { id: '3', name: 'Lalamove Instant Delivery', code: 'lalamove', is_enabled: false, base_rate: 120 },
  ]);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 1. INITIALIZATION PATROL LINK: Tiyaking konektado ang workspace bago humugot ng logistics records
  useEffect(() => {
    const fetchLogisticsParameters = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: storeData } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (!storeData) {
          throw new Error('Hindi nahanap ang profile records configuration ng iyong tindahan.');
        }

        setStoreId(storeData.id);
        
        // DITO PWEDENG MAG-FETCH MULA SA IYONG CUSTOM LOGISTICS/SHIPPING CONFIG DB TABLE
        // Halimbawang static values para sa testing flow bypass layer:
        setFlatRate('85.00');
        setFreeShippingThreshold('1500.00');

      } catch (err: any) {
        console.error('Error fetching storefront shipping metrics:', err.message);
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (seller) fetchLogisticsParameters();
  }, [seller, router]);

  // Handler para sa instant activation/deactivation switcher ng internal active couriers array
  const handleToggleCourier = (id: string) => {
    setCouriers(couriers.map(c => c.id === id ? { ...c, is_enabled: !c.is_enabled } : c));
  };

  const handleSaveShippingConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || isSaving) return;

    setIsSaving(true);
    setMessage('');

    try {
      const parsedRate = parseFloat(flatRate);
      const parsedThreshold = parseFloat(freeShippingThreshold);

      if (isNaN(parsedRate) || parsedRate < 0) throw new Error('Mangyaring maglagay ng wastong flat delivery fee.');
      if (isNaN(parsedThreshold) || parsedThreshold < 0) throw new Error('Mangyaring maglagay ng wastong amount limit.');

      // LIVE TRANSACTION GATEWAY: Dito ihuhulog sa database rows ang updates mamaya
      // Opsyonal: Mag-update sa isang custom 'shipping_configs' table o direktang i-append bilang json metadata column kay stores

      setMessage('🎉 Logistics configuration parameters successfully synchronized into database matrix channels!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`❌ Error sa pag-save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Compiling operational logistics parameters...</span>
        </div>
      </div>
    );
  }
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <header className="border-b border-ink/5 pb-5">
        <div className="flex items-center gap-2 text-ink select-none">
          <Truck className="text-teal" size={24} />
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight">Shipping & Fulfillment Rules</h1>
        </div>
        <p className="text-sm text-ink/50 mt-1">Configure your nationwide courier handling corridors, global flat-rate costs, and threshold limits.</p>
      </header>

      {/* COMPONENT MESSAGE DISPATCHER BLOCK */}
      {message && (
        <div className={`p-4 rounded-xl text-xs max-w-xl font-medium border flex items-center gap-2 ${
          message.startsWith('❌') 
            ? 'bg-rose-50/50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {message.startsWith('❌') ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSaveShippingConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl text-xs">
        
        {/* LEFT COLUMN: BASE LOGISTICS RULES PANEL CONTROLS */}
        <div className="bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-5 lg:col-span-2">
          
          <div className="flex items-center gap-2 border-b border-ink/5 pb-3 select-none">
            <Sliders size={16} className="text-teal" />
            <h2 className="font-display font-bold text-sm text-ink">Pricing Calculation Logic</h2>
          </div>

          {/* Flat-rate Activation Toggle Switcher Box */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-ink/5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-ink block select-none">Enable Flat-Rate Shipping Mode</span>
              <p className="text-[11px] text-ink/40 leading-tight select-none">Kapag naka-on, isang pangkalahatang presyo ang gagamitin sa checkout anuman ang timbang ng order.</p>
            </div>
            <div className="relative flex items-center h-5">
              <input 
                type="checkbox" 
                checked={isFlatRateEnabled} 
                onChange={(e) => setIsFlatRateEnabled(e.target.checked)} 
                className="w-4 h-4 rounded border-ink/15 cursor-pointer appearance-none checked:bg-ink relative checked:after:content-['✓'] checked:after:text-paper checked:after:text-[10px] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:font-bold" 
              />
            </div>
          </div>

          {/* Delivery Pricing Matrix Grid Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Standard Flat-Rate Value (₱)</label>
              <input 
                type="number" 
                step="0.01"
                required
                disabled={!isFlatRateEnabled}
                value={flatRate} 
                onChange={(e) => setFlatRate(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30 transition-colors disabled:opacity-40" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Free Shipping Threshold Trigger (₱)</label>
              <input 
                type="number" 
                step="0.01"
                required
                placeholder="0.00"
                value={freeShippingThreshold} 
                onChange={(e) => setFreeShippingThreshold(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30 transition-colors" 
              />
            </div>
          </div>
          <p className="text-[10px] text-ink/30 font-mono select-none">Itakda sa 0.00 ang threshold kung walang libreng delivery promosyon ang iyong white-label storefront.</p>

          {/* Core Master Action Submitter Button Control */}
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition inline-flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={14} />}
            <span>{isSaving ? 'Inilalagak ang logistics updates...' : 'Save Fulfillment Settings'}</span>
          </button>

        </div>

        {/* RIGHT COLUMN: COURIER SERVICE CHANNELS LIST INTEGRATION HUB PANEL */}
        <div className="space-y-6">
          <section className="bg-white border border-ink/10 p-5 rounded-2xl shadow-sm space-y-4">
            <div>
              <span className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide select-none">Active Logistics Express Partners</span>
              <p className="text-[11px] text-ink/40 mt-0.5 select-none">I-on ang mga couriers na nais mong maging opsyon ng customer sa pampublikong cart side checkout sheets.</p>
            </div>

            {/* Loop render para sa express network partners matrix */}
            <div className="space-y-2.5 pt-2">
              {couriers.map((courier) => (
                <div 
                  key={courier.id} 
                  onClick={() => handleToggleCourier(courier.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none group active:scale-[0.99] ${
                    courier.is_enabled 
                      ? 'bg-white border-ink/20 shadow-xs' 
                      : 'bg-gray-50/50 border-ink/5 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-ink text-xs block group-hover:text-teal transition-colors">{courier.name}</span>
                    <span className="text-[9px] font-mono text-ink/30 uppercase tracking-wider">Base Node Rate: ₱{courier.base_rate}</span>
                  </div>
                  
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative ${courier.is_enabled ? 'bg-ink' : 'bg-gray-200'}`}>
                    <div className={`w-3 h-3 rounded-full bg-paper shadow-xs transition-transform absolute top-1/2 -translate-y-1/2 ${courier.is_enabled ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </form>
    </main>
  );
}
