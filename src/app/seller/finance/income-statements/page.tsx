 'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, FileText, Download, Wallet, CreditCard, Receipt } from 'lucide-react';

export default function SellerIncomeStatementPage() {
  const router = useRouter();
  const pathname = usePathname();

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
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Income Statement Summary</h1>
          <p className="text-sm text-ink/50">Platform gross revenue margin breakdowns and automated SaaS commission fee structures ledger.</p>
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

      {/* ACCOUNTING LEDGER SHEET */}
      <div className="max-w-2xl bg-white border border-ink/10 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Ledger Header */}
        <div className="bg-gray-50 border-b border-ink/5 p-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink/40 uppercase tracking-wider font-mono">Statement Period: Current Month</span>
          <button className="inline-flex items-center gap-1.5 border border-ink/10 text-ink font-semibold px-3 py-1.5 rounded-xl text-xs hover:bg-ink/5 transition active:scale-95">
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Ledger Core Matrix */}
        <div className="p-6 space-y-4 font-mono text-xs divide-y divide-ink/5">
          <div className="flex justify-between text-ink/40 pb-2 uppercase text-[10px] font-bold font-sans tracking-wide">
            <span>Financial Metric Description</span> 
            <span>Value Amount</span>
          </div>
          
          <div className="flex justify-between pt-4 text-ink font-medium">
            <span>Gross Store Sales volume:</span> 
            <span className="font-bold text-ink">₱24,500.00</span>
          </div>
          
          <div className="flex justify-between pt-4 text-[var(--color-coral)] font-medium">
            <span>(-) SaaS platform rental fee (2%):</span> 
            <span>-₱490.00</span>
          </div>
          
          <div className="flex justify-between pt-4 text-[var(--color-coral)] font-medium">
            <span>(-) PayMongo gateway handling fee:</span> 
            <span>-₱250.00</span>
          </div>
          
          {/* Final Calculated Net Row */}
          <div className="flex justify-between pt-4 text-ink font-bold bg-gray-50 border border-ink/5 -mx-6 px-6 py-4 mt-2">
            <span className="font-sans text-sm font-bold flex items-center gap-1.5">
              <Wallet size={15} className="text-[var(--color-teal)]" />
              <span>Net Merchant Income:</span>
            </span> 
            <span className="text-[var(--color-teal)] font-black text-sm tracking-tight">₱23,760.00</span>
          </div>
        </div>

      </div>

    </main>
  );
}
