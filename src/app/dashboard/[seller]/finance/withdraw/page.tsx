 // src/app/dashboard/[seller]/finance/withdraw/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../../../../lib/supabase';
import { ArrowLeft, CreditCard, Receipt, FileText, Wallet, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function SellerWithdrawPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Interactive Form States
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('gcash');
  
  // Context Analytics States
  const [storeId, setStoreId] = useState<string | null>(null);
  const [maxWithdrawable, setMaxWithdrawable] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchWithdrawableLimit = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        setStoreId(storeData.id);

        // Kukuha ng sum of completed orders upang magsilbing dynamic check validation matrix boundary
        const { data: sales, error: salesError } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('store_id', storeData.id)
          .eq('status', 'completed');

        if (salesError) throw salesError;

        const sum = (sales || []).reduce((acc, curr) => acc + Number(current => current.total_amount || 0), 0);
        setMaxWithdrawable(sum);

      } catch (err: any) {
        console.error('Error fetching dynamic cash thresholds:', err.message);
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawableLimit();
  }, [router]);

  // Asynchronous Disbursal Request: Magpapadala ng ledger insert record line model sa database row sheet
  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !storeId || isSubmitting) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const requestAmount = parseFloat(amount);

      // STRICT VALIDATION GUARDS (Tinanggal ang bulag na alerts)
      if (isNaN(requestAmount) || requestAmount <= 0) {
        throw new Error('Mangyaring maglagay ng wastong halaga ng payout.');
      }
      if (requestAmount > maxWithdrawable) {
        throw new Error(`Sobra ang request! Ang iyong withdrawable limit ay ₱${maxWithdrawable.toLocaleString('en-US', { minimumFractionDigits: 2 })} lamang.`);
      }

      const { error } = await supabase
        .from('payouts')
        .insert([
          {
            store_id: storeId,
            amount: requestAmount,
            gateway_method: method,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      setMessage('🎉 Ang iyong disbursal settlement request ay matagumpay na naisumite para sa verification verification review!');
      setAmount('');
      
      setTimeout(() => {
        router.push('/seller/finance');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating ledger payout instance:', err.message);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Hahatak ng limit data details...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 HEADER SECTION WITH DYNAMIC FINANCE TABS */}
      <div className="flex flex-col gap-5 border-b border-ink/5 pb-5">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/seller/finance')} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Back to Finance</span>
          </button>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Request Fund Settlement</h1>
          <p className="text-sm text-ink/50">Transfer your digital storefront wallet profits directly to local payment nodes.</p>
        </div>
        
        {/* SUB-FOLDER SEGMENTED CONTROLS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-ink/5 rounded-xl w-max max-w-full text-xs font-semibold">
          <button 
            onClick={() => router.push('/seller/finance')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname === '/seller/finance' ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <Receipt size={14} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => router.push('/seller/finance/withdraw')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname.includes('/withdraw') ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <CreditCard size={14} />
            <span>Withdrawal</span>
          </button>
          <button 
            onClick={() => router.push('/seller/finance/income-statements')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname.includes('/income-statements') ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <FileText size={14} />
            <span>Income Statements</span>
          </button>
        </div>
      </div>

      {/* COMPONENT MESSAGE DISPATCHER BLOCK */}
      {message && (
        <div className={`p-4 rounded-xl text-xs max-w-md font-medium border flex items-center gap-2 ${
          message.startsWith('❌') 
            ? 'bg-rose-50/50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <AlertCircle size={15} />
          <span>{message}</span>
        </div>
      )}

      {/* WITHDRAWAL TRANSACTION FORM BOX */}
      <div className="max-w-md bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-ink/5 pb-3">
          <div className="flex items-center gap-2">
            {/* INAYOS: Diretsong text-teal Tailwind class utility */}
            <Wallet className="text-teal" size={18} />
            <h2 className="font-display font-bold text-base text-ink">Settlement Account Details</h2>
          </div>
          {/* Dynamic Maximum Boundary Cap Alert View */}
          <span className="text-[10px] font-mono font-bold text-ink/40 bg-gray-100 border border-ink/5 px-2 py-0.5 rounded-md">
            Max: ₱{maxWithdrawable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <form onSubmit={handleWithdrawRequest} className="space-y-5">
          {/* Select Gateway */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Select Transfer Gateway</label>
            <div className="relative">
              <select 
                disabled={isSubmitting || maxWithdrawable <= 0}
                value={method} 
                onChange={(e) => setMethod(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink font-medium outline-none focus:border-ink/30 appearance-none cursor-pointer disabled:opacity-40"
              >
                <option value="gcash">📱 GCash Wallet Node</option>
                <option value="maya">💳 Maya Account Node</option>
                <option value="bdo">🏦 BDO Unibank Transfer</option>
              </select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Withdrawal Amount (₱)</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <span className="text-ink/40 font-mono text-xs">₱</span>
              </div>
              <input 
                type="number" 
                required 
                max={maxWithdrawable}
                disabled={isSubmitting || maxWithdrawable <= 0}
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl pl-8 pr-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-40" 
              />
            </div>
          </div>

          {/* Submit Trigger — Tailwind v4 optimised input actions */}
          <button 
            type="submit" 
            disabled={isSubmitting || !amount || maxWithdrawable <= 0}
            className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 transition inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 mt-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Inirerehistro sa ledger...</span>
              </>
            ) : (
              <>
                <span>Submit Disbursal Request</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>
      </div>

    </main>
  );
}
