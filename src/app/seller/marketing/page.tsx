 'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Ticket, HelpCircle, Sparkles } from 'lucide-react';

export default function SellerMarketingPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🛠️ BYPASS ACTIVATED: Core promotional structural bypass mapping
    const loadBypassedMarketingData = () => {
      const mockPromoVouchers = [
        { id: 'v1', code: 'KAWAN20', type: 'percentage', value: 20, status: 'active', usage: '45/100 claimed' },
        { id: 'v2', code: 'SALAMAT100', type: 'fixed_amount', value: 100, status: 'expired', usage: '100/100 claimed' }
      ];
      setVouchers(mockPromoVouchers);
      setLoading(false);
    };

    loadBypassedMarketingData();
  }, []);

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ink/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Marketing Campaigns</h1>
          <p className="text-sm text-ink/50 mt-1">Manage platform vouchers, discounts, and flash sales matrix node configurations.</p>
        </div>
        <button 
          onClick={() => alert('Creating new promotion configuration entry...')}
          className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Voucher Code</span>
        </button>
      </header>

      {/* QUICK INFO ACCENT */}
      <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm max-w-2xl flex items-start gap-3 text-xs text-ink/60 leading-relaxed">
        <div className="bg-[var(--color-teal-light)] text-[var(--color-teal)] p-2 rounded-xl shrink-0">
          <Sparkles size={14} />
        </div>
        <div>
          <p className="font-semibold text-ink mb-0.5">Campaign Automation Tip</p>
          Active vouchers are dynamically displayed directly on your public storefront `[storeSlug]` checkout pages to decrease cart abandonment and incentivize higher consumer conversions.
        </div>
      </div>

      {/* VOUCHER GRIDS CONTROL PANEL */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-4 flex items-center gap-1.5">
          <Ticket size={13} />
          <span>Active & Historical Coupons</span>
        </h3>

        {loading ? (
          <div className="text-sm font-medium text-ink/40 animate-pulse py-4">Fetching promotional channels data...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            {vouchers.map((voucher) => (
              <div 
                key={voucher.id} 
                className={`bg-white border p-5 rounded-2xl shadow-sm flex justify-between items-start relative overflow-hidden transition-all ${
                  voucher.status === 'active' ? 'border-ink/10' : 'border-ink/5 opacity-60 bg-gray-50/50'
                }`}
              >
                {/* Coupon Details */}
                <div className="space-y-3 z-10">
                  <span className="font-mono text-xs font-bold text-ink bg-gray-100 border border-ink/10 px-2.5 py-1.5 rounded-lg inline-block tracking-wide uppercase">
                    {voucher.code}
                  </span>
                  <div>
                    <p className="font-display font-bold text-lg text-ink">
                      {voucher.type === 'percentage' ? `${voucher.value}%` : `₱${voucher.value}.00`} OFF
                    </p>
                    <p className="text-[11px] text-ink/40 font-mono mt-0.5">
                      {voucher.usage}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide shrink-0 ${
                  voucher.status === 'active' 
                    ? 'bg-[var(--color-teal-light)] text-[var(--color-teal)]' 
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {voucher.status}
                </span>

                {/* Aesthetic Coupon Ticket Dot Cuts */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-paper rounded-full border-r border-ink/5 -translate-y-1/2" />
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-paper rounded-full border-l border-ink/5 -translate-y-1/2" />
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
