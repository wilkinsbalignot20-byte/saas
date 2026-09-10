 // src/app/dashboard/[seller]/marketing/voucher/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Ticket, Plus, RefreshCw, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

interface VoucherItem {
  id: string;
  code: string;
  discount_type: 'fixed' | 'percentage';
  discount_value: number;
  min_spend: number;
  is_active: boolean;
}

export default function SellerVouchersPage() {
  const router = useRouter();
  
  // Voucher Creator Form States
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState('');
  const [minSpend, setMinSpend] = useState('');
  
  // Data Aggregation States
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchVouchersData = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // TENANT MATCHING GUARD: Kukuha ng store id na nakatali sa kasalukuyang rehistradong account
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        setStoreId(storeData.id);

        // Hahatakin ang mga records mula sa vouchers database sheet logs niyan
        const { data, error } = await supabase
          .from('vouchers')
          .select('id, code, discount_type, discount_value, min_spend, is_active')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setVouchers(data || []);
      } catch (err: any) {
        console.error('Error loading promotional voucher rows:', err.message);
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchersData();
  }, [router]);

  // Asynchronous Insert Transaction Pipeline para mag-bake ng bagong coupon record model row
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue || !storeId) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const cleanCode = code.toUpperCase().trim().replace(/[^A-Z0-9]+/g, '');
      const valueNum = parseFloat(discountValue);
      const spendNum = parseFloat(minSpend) || 0;

      if (!cleanCode) throw new Error('Mangyaring maglagay ng wastong voucher code identifier.');
      if (isNaN(valueNum) || valueNum <= 0) throw new Error('Mangyaring maglagay ng wastong discount value.');
      if (discountType === 'percentage' && valueNum > 100) throw new Error('Ang percentage discount ay hindi pwedeng lumampas sa 100%.');

      const { data, error } = await supabase
        .from('vouchers')
        .insert([
          {
            store_id: storeId,
            code: cleanCode,
            discount_type: discountType,
            discount_value: valueNum,
            min_spend: spendNum,
            is_active: true
          }
        ])
        .select('id, code, discount_type, discount_value, min_spend, is_active')
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Umiiral na ang voucher code na ito sa iyong tindahan.');
        throw error;
      }

      setVouchers(prev => [data, ...prev]);
      setCode('');
      setDiscountValue('');
      setMinSpend('');
      setMessage('🎉 Voucher code ay matagumpay na na-publish sa iyong store layout channel!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (confirm('Sigurado ka bang gusto mong burahin ang voucher code na ito?')) {
      try {
        const { error } = await supabase.from('vouchers').delete().eq('id', id);
        if (error) throw error;
        setVouchers(prev => prev.filter(item => item.id !== id));
      } catch (err: any) {
        alert(`❌ Error sa pagbura: ${err.message}`);
      }
    }
  };
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 BREADCRUMB & HEADER SECTION */}
      <div className="space-y-1">
        <button 
          onClick={() => router.push('/seller/marketing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
        >
          <ArrowLeft size={12} />
          <span>Bumalik sa Marketing</span>
        </button>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink flex items-center gap-2">
          <Ticket className="text-teal" size={24} />
          <span>Voucher Management Center</span>
        </h1>
        <p className="text-sm text-ink/50 mt-1">Create internal coupon discount parameters and manage live merchant storefront discount entries.</p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE COUPON CREATOR WIZARD FORM */}
        <form onSubmit={handleCreateVoucher} className="bg-white border border-ink/10 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-ink/5 pb-2">
            <Plus size={16} className="text-teal" />
            <h2 className="font-display font-bold text-sm text-ink">Bake New Coupon Code</h2>
          </div>

          {/* Voucher Text Identifier */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Voucher Code</label>
            <input 
              type="text" 
              required 
              placeholder="Halimbawa: DISKWENTO100" 
              value={code} 
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink font-mono font-bold tracking-wide outline-none focus:border-ink/30 transition-colors uppercase" 
            />
          </div>

          {/* Selector Type Segment */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Discount Classification Type</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-ink/5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setDiscountType('fixed')}
                className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${discountType === 'fixed' ? 'bg-white text-ink shadow-xs font-bold border border-ink/5' : 'text-ink/50 hover:text-ink'}`}
              >
                Fixed Amount (₱)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('percentage')}
                className={`py-2 px-3 rounded-lg text-center transition-all cursor-pointer ${discountType === 'percentage' ? 'bg-white text-ink shadow-xs font-bold border border-ink/5' : 'text-ink/50 hover:text-ink'}`}
              >
                Percentage (%)
              </button>
            </div>
          </div>

          {/* Discount Value and Minimum Spend Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">
                {discountType === 'fixed' ? 'Discount Value (₱)' : 'Discount Rate (%)'}
              </label>
              <input 
                type="number" 
                required
                step="0.01"
                placeholder={discountType === 'fixed' ? '0.00' : '0'} 
                value={discountValue} 
                onChange={(e) => setDiscountValue(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 font-mono font-bold" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Min. Spend Requirement (₱)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00 (Optional)" 
                value={minSpend} 
                onChange={(e) => setMinSpend(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 font-mono font-semibold" 
              />
            </div>
          </div>

          {/* Submit Action Trigger */}
          <button 
            type="submit" 
            disabled={isSubmitting || !code.trim() || !discountValue || loading}
            className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition inline-flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={14} />}
            <span>{isSubmitting ? 'Inirerehistro sa system...' : 'Publish Discount Voucher'}</span>
          </button>
        </form>

        {/* RIGHT COLUMN: ACTIVE STORE COUPONS HISTORICAL MONITOR LIST */}
        <section className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 flex items-center gap-1.5 select-none">
            <Ticket size={13} />
            <span>Live Coupons List Terminal</span>
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white border border-ink/10 rounded-2xl shadow-sm">
              <RefreshCw size={20} className="animate-spin text-ink/40" />
              <div className="text-xs font-medium text-ink/50">Hahatak ng vouchers active data feeds...</div>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="bg-white border border-ink/10 rounded-2xl p-12 text-center text-xs text-ink/40 shadow-sm space-y-1">
              <p className="font-semibold text-ink">Walang nakitang rehistradong coupon codes</p>
              <p className="text-ink/50">Gamitin ang panel sa kaliwa upang mag-publish ng iyong unang e-commerce promo voucher item.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vouchers.map((voucher) => (
                <div 
                  key={voucher.id} 
                  className={`bg-white border p-5 rounded-2xl shadow-xs flex justify-between items-start relative overflow-hidden transition-all border-ink/10`}
                >
                  <div className="space-y-3 z-10">
                    <span className="font-mono text-xs font-bold text-ink bg-gray-100 border border-ink/10 px-2.5 py-1 rounded-lg inline-block tracking-wide uppercase select-all">
                      {voucher.code}
                    </span>
                    <div>
                      <p className="font-display font-bold text-lg text-ink">
                        {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `₱${Number(voucher.discount_value).toLocaleString()}`} OFF
                      </p>
                      <p className="text-[10px] text-ink/40 font-mono mt-0.5">
                        Min. Spend: ₱{Number(voucher.min_spend).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between h-full gap-8 z-10">
                    <span className="text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wide select-none bg-emerald-50 text-emerald-700">
                      active
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteVoucher(voucher.id)}
                      className="p-1.5 border border-ink/10 text-coral hover:bg-rose-50/50 rounded-lg transition cursor-pointer"
                      title="Burahin ang Voucher"
                    >
                      <Trash2 size={13} className="pointer-events-none" />
                    </button>
                  </div>

                  {/* Aesthetic Coupon Ticket Dot Cuts */}
                  <div className="absolute top-1/2 -left-2 w-4 h-4 bg-paper rounded-full border-r border-ink/5 -translate-y-1/2 select-none" />
                  <div className="absolute top-1/2 -right-2 w-4 h-4 bg-paper rounded-full border-l border-ink/5 -translate-y-1/2 select-none" />
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
