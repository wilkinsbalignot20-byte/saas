 'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, CreditCard, Receipt, FileText, Wallet, ArrowRight } from 'lucide-react';

export default function SellerWithdrawPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('gcash');

  const handleWithdrawRequest = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`💰 Payout request of ₱${amount} via ${method.toUpperCase()} submitted for structural verification review!`);
    setAmount('');
    router.push('/seller/finance');
  };

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 HEADER SECTION WITH DYNAMIC FINANCE TABS */}
      <div className="flex flex-col gap-5 border-b border-ink/5 pb-5">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/seller/finance')} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2"
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

      {/* WITHDRAWAL TRANSACTION FORM BOX */}
      <div className="max-w-md bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-ink/5 pb-3">
          <Wallet className="text-[var(--color-teal)]" size={18} />
          <h2 className="font-display font-bold text-base text-ink">Settlement Account Details</h2>
        </div>

        <form onSubmit={handleWithdrawRequest} className="space-y-5">
          {/* Select Gateway */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Select Transfer Gateway</label>
            <div className="relative">
              <select 
                value={method} 
                onChange={(e) => setMethod(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink font-medium outline-none focus:border-ink/30 appearance-none cursor-pointer"
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
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl pl-8 pr-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              />
            </div>
          </div>

          {/* Submit Trigger — Tailwind v4 optimised input actions */}
          <button 
            type="submit" 
            className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 transition inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Submit Disbursal Request</span>
            <ArrowRight size={13} />
          </button>
        </form>
      </div>

    </main>
  );
}
