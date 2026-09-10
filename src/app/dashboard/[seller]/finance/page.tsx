 // src/app/seller/finance/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { Receipt, CreditCard, FileText, Wallet, ArrowUpRight, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export default function SellerFinancePage() {
  const router = useRouter();
  const pathname = usePathname();

  // Computational Core Finance States
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0); // Pansamantalang 0 muna habang wala pang payouts table
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchFinanceMetrics = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 1. IDENTITY EXTRACTION: Kunin ang store id na pagmamay-ari ng user
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        // 2. REVENUE CALCULATION STREAM: Bilangin ang lahat ng completed sales upang maging withdrawable balance
        const { data: orderSales, error: salesError } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('store_id', storeData.id)
          .eq('status', 'completed');

        if (salesError) throw salesError;

        if (orderSales) {
          const totalGross = orderSales.reduce((acc, current) => acc + Number(current.total_amount || 0), 0);
          setWithdrawableBalance(totalGross);
        }

      } catch (err: any) {
        console.error('Error loading finance analytical nodes:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceMetrics();
  }, [router]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Hahatak ng pananalapi data stream...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 HEADER SECTION WITH DYNAMIC FINANCE TABS */}
      <div className="flex flex-col gap-5 border-b border-ink/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Finance & Wallet Center</h1>
          <p className="text-sm text-ink/50 mt-1">Monitor revenue pipeline streams, request payouts, and check financial summaries.</p>
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

      {/* ERROR HANDLER NOTIFIER */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-xl">
          <AlertCircle size={15} />
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* 📊 ACTIVE BALANCE CONTROLLERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        
        {/* WITHDRAWABLE WALLET */}
        <div className="bg-white border border-ink/10 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide flex items-center gap-1.5 select-none">
              {/* INAYOS: Diretsong text-teal Tailwind class utility */}
              <Wallet size={12} className="text-teal" />
              <span>Withdrawable Balance</span>
            </span>
            <div className="text-3xl font-bold font-display tracking-tight text-ink flex items-baseline gap-1 mt-1">
              <span className="text-sm font-sans font-normal text-ink/40">₱</span>
              {/* INAYOS: Dynamic revenue calculation aggregator link cells */}
              <span>{withdrawableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/seller/finance/withdraw')}
            disabled={withdrawableBalance <= 0}
            className="mt-6 bg-ink text-paper text-xs font-semibold py-3 px-4 rounded-xl w-full transition shadow-sm hover:bg-ink/90 active:scale-95 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <span>Withdraw Funds Now</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* TOTAL SETTLED BALANCES */}
        <div className="bg-white border border-ink/10 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide flex items-center gap-1.5 select-none">
              <CheckCircle2 size={12} className="text-ink/40" />
              <span>Total Withdrawn</span>
            </span>
            <div className="text-3xl font-bold font-display tracking-tight text-ink/70 flex items-baseline gap-1 mt-1">
              <span className="text-sm font-sans font-normal text-ink/30">₱</span>
              <span>{totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <p className="text-[11px] text-ink/40 leading-relaxed mt-6 pt-4 border-t border-ink/5 select-none">
            Successfully transferred and reconciled to your integrated settlement bank gateway nodes.
          </p>
        </div>

      </div>

    </main>
  );
}
