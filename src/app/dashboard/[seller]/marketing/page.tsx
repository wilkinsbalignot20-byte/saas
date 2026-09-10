 // src/app/dashboard/[seller]/marketing/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Tag, Plus, Ticket, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface VoucherItem {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  min_spend: number;
  is_active: boolean;
}

export default function SellerMarketingPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchMarketingData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        // 1. DYNAMIC SESSION LOCK: Kilalanin ang kasalukuyang active merchant gamit ang secure SSR parameters
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 2. TENANT EXTRACTION: Hanapin ang saktong store_id ng merchant mula sa stores schema
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        // 3. REAL DATA AGGREGATION: Hahatakin ang mga totoong coupon codes mula sa bagong vouchers table
        const { data, error } = await supabase
          .from('vouchers')
          .select('id, code, discount_type, discount_value, min_spend, is_active')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVouchers(data || []);

      } catch (err: any) {
        console.error('Error extracting marketing analytical channels:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketingData();
  }, [router]);
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ink/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Marketing Campaigns</h1>
          <p className="text-sm text-ink/50 mt-1">Manage platform vouchers, discounts, and flash sales matrix node configurations.</p>
        </div>
        <button 
          onClick={() => router.push('/seller/marketing/voucher')}
          className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Voucher Code</span>
        </button>
      </header>

      {/* ERROR HANDLER LOG DISPLAY */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-xl">
          <AlertCircle size={15} />
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* QUICK INFO ACCENT */}
      <div className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm max-w-2xl flex items-start gap-3 text-xs text-ink/60 leading-relaxed">
        <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl shrink-0">
          <Sparkles size={14} />
        </div>
        <div>
          <p className="font-semibold text-ink mb-0.5">Campaign Automation Tip</p>
          Active vouchers are dynamically displayed directly on your public storefront `[storeSlug]` checkout pages to decrease cart abandonment and incentivize higher consumer conversions.
        </div>
      </div>

      {/* VOUCHER GRIDS CONTROL PANEL */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 flex items-center gap-1.5">
          <Ticket size={13} />
          <span>Active & Historical Coupons</span>
        </h3>

        {loading ? (
          <div className="flex items-center gap-2 text-sm font-medium text-ink/40 py-4 animate-pulse">
            <RefreshCw size={16} className="animate-spin text-ink/30" />
            <span>Fetching promotional channels data...</span>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="bg-white border border-ink/10 rounded-2xl p-12 text-center text-sm text-ink/40 shadow-sm max-w-2xl mx-auto space-y-2">
            <p className="font-semibold text-ink">Walang nahanap na mga vouchers</p>
            <p className="max-w-xs mx-auto leading-relaxed text-xs text-ink/50">
              I-click ang "Create Voucher Code" button sa itaas para mag-bake ng iyong unang discount coupon para sa iyong kustomer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            {vouchers.map((voucher) => (
              <div 
                key={voucher.id} 
                className={`bg-white border p-5 rounded-2xl shadow-sm flex justify-between items-start relative overflow-hidden transition-all ${
                  voucher.is_active ? 'border-ink/10' : 'border-ink/5 opacity-50 bg-gray-50/50'
                }`}
              >
                {/* Coupon Details */}
                <div className="space-y-3 z-10">
                  <span className="font-mono text-xs font-bold text-ink bg-gray-100 border border-ink/10 px-2.5 py-1.5 rounded-lg inline-block tracking-wide uppercase select-all">
                    {voucher.code}
                  </span>
                  <div>
                    <p className="font-display font-bold text-lg text-ink">
                      {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `₱${Number(voucher.discount_value).toLocaleString()}`} OFF
                    </p>
                    <p className="text-[10px] text-ink/40 font-mono mt-1">
                      Min. Spend: ₱{Number(voucher.min_spend).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide shrink-0 select-none ${
                  voucher.is_active 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-rose-50 text-rose-700'
                }`}>
                  {voucher.is_active ? 'active' : 'inactive'}
                </span>

                {/* Aesthetic Coupon Ticket Dot Cuts */}
                <div className="absolute top-1/2 -left-2 w-4 h-4 bg-paper rounded-full border-r border-ink/5 -translate-y-1/2 select-none" />
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-paper rounded-full border-l border-ink/5 -translate-y-1/2 select-none" />
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
