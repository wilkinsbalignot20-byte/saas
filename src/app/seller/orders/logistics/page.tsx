 'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Zap, Bike, ShieldCheck } from 'lucide-react';

export default function SellerLogisticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [couriers, setCouriers] = useState({
    jand: true,
    flash: false,
    lalamove: true
  });

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 HEADER SECTION WITH DYNAMIC TABS */}
      <div className="flex flex-col gap-5 border-b border-ink/5 pb-5">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/seller/orders')} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2"
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

      {/* COURIER CONFIGURATION CARDS CONTAINER */}
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-ink/5 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40">Available Shipping Gateways</h3>
          <span className="inline-flex items-center gap-1 text-[11px] text-teal font-medium">
            <ShieldCheck size={12} /> Live API Webhooks
          </span>
        </div>

        {/* J&T EXPRESS CARD */}
        <div className={`flex justify-between items-center bg-white p-5 rounded-2xl border transition-all shadow-sm ${couriers.jand ? 'border-ink/20 bg-white' : 'border-ink/5 opacity-60'}`}>
          <div className="flex items-start gap-4">
            <div className="bg-red-50 text-red-600 p-3 rounded-xl shrink-0 mt-0.5 font-bold text-xs tracking-tight">
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
              checked={couriers.jand} 
              onChange={(e) => setCouriers({...couriers, jand: e.target.checked})} 
              className="w-4 h-4 rounded border-ink/15 cursor-pointer appearance-none checked:bg-ink relative checked:after:content-['✓'] checked:after:text-paper checked:after:text-[10px] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:font-bold" 
            />
          </div>
        </div>

        {/* FLASH EXPRESS CARD */}
        <div className={`flex justify-between items-center bg-white p-5 rounded-2xl border transition-all shadow-sm ${couriers.flash ? 'border-ink/20 bg-white' : 'border-ink/5 opacity-60'}`}>
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
              checked={couriers.flash} 
              onChange={(e) => setCouriers({...couriers, flash: e.target.checked})} 
              className="w-4 h-4 rounded border-ink/15 cursor-pointer appearance-none checked:bg-ink relative checked:after:content-['✓'] checked:after:text-paper checked:after:text-[10px] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:font-bold" 
            />
          </div>
        </div>

        {/* LALAMOVE CARD */}
        <div className={`flex justify-between items-center bg-white p-5 rounded-2xl border transition-all shadow-sm ${couriers.lalamove ? 'border-ink/20 bg-white' : 'border-ink/5 opacity-60'}`}>
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
              checked={couriers.lalamove} 
              onChange={(e) => setCouriers({...couriers, lalamove: e.target.checked})} 
              className="w-4 h-4 rounded border-ink/15 cursor-pointer appearance-none checked:bg-ink relative checked:after:content-['✓'] checked:after:text-paper checked:after:text-[10px] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:font-bold" 
            />
          </div>
        </div>

      </div>

    </main>
  );
}
