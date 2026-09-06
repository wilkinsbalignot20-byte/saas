 'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Receipt, CreditCard, FileText, Wallet, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function SellerFinancePage() {
  const router = useRouter();
  const pathname = usePathname();

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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              pathname === '/seller/finance' ? 'bg-white text-ink shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <Receipt size={14} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => router.push('/seller/finance/withdraw')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              pathname === '/seller/finance/withdraw' ? 'bg-white text-ink shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <CreditCard size={14} />
            <span>Withdrawal</span>
          </button>
          <button 
            onClick={() => router.push('/seller/finance/income-statements')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              pathname === '/seller/finance/income-statements' ? 'bg-white text-ink shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <FileText size={14} />
            <span>Income Statements</span>
          </button>
        </div>
      </div>

      {/* 📊 ACTIVE BALANCE CONTROLLERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        
        {/* WITHDRAWABLE WALLET */}
        <div className="bg-white border border-ink/10 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide flex items-center gap-1.5">
              <Wallet size={12} className="text-[var(--color-teal)]" />
              <span>Withdrawable Balance</span>
            </span>
            <div className="text-3xl font-bold font-display tracking-tight text-ink flex items-baseline gap-1 mt-1">
              <span className="text-sm font-sans font-normal text-ink/40">₱</span>
              <span>18,450.00</span>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/seller/finance/withdraw')}
            className="mt-6 bg-ink text-paper text-xs font-semibold py-3 px-4 rounded-xl w-full transition shadow-sm hover:bg-ink/90 active:scale-95 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Withdraw Funds Now</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* TOTAL SETTLED BALANCES */}
        <div className="bg-white border border-ink/10 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-ink/40" />
              <span>Total Withdrawn</span>
            </span>
            <div className="text-3xl font-bold font-display tracking-tight text-ink/70 flex items-baseline gap-1 mt-1">
              <span className="text-sm font-sans font-normal text-ink/30">₱</span>
              <span>6,050.00</span>
            </div>
          </div>
          
          <p className="text-[11px] text-ink/40 leading-relaxed mt-6 pt-4 border-t border-ink/5">
            Successfully transferred and reconciled to your integrated settlement bank gateway nodes.
          </p>
        </div>

      </div>

    </main>
  );
}
