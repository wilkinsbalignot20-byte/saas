// src/app/admin/billing/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function AdminBillingOverview() {
  const router = useRouter();

  return (
    <div className="flex-1 p-6 md:p-10 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Navigation Headers Options */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-emerald-500 uppercase">Platform Financials</h1>
          <p className="text-xs text-slate-500 mt-1">Global audit ledger recording subscription payouts collected from tenant clusters node channels.</p>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          <button onClick={() => router.push('/admin/stores')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition">🏪 Active Tenants</button>
          <button onClick={() => router.push('/admin/billing')} className="bg-emerald-900/40 border border-emerald-700/50 px-3 py-2 rounded-xl text-emerald-300">💳 Platform Income</button>
        </div>
      </header>

      {/* 📊 SUMMARY CARD FINANCIAL INJECTORS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Total Platform Income</span>
          <span className="text-3xl font-black text-emerald-400 font-mono mt-2 block">₱45,900.00</span>
          <span className="text-[9px] text-slate-600 font-medium mt-1 block">Accumulated gross platform rental margins</span>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Recurring MRR Stream</span>
          <span className="text-3xl font-black text-indigo-400 font-mono mt-2 block">₱12,500/mo</span>
          <span className="text-[9px] text-slate-600 font-medium mt-1 block">Active recurring billing monthly pipeline contracts</span>
        </div>
      </div>

    </div>
  );
}
