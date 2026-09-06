 'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

// Mock Returns Data base sa return.ts blueprints mo
const MOCK_RETURNS = [
  { id: 'RET-881-A2', orderId: 'ORD-2026-X99', customer: 'Juan Dela Cruz', reason: 'Wrong Size / Fit Issues', status: 'pending' },
  { id: 'RET-442-B9', orderId: 'ORD-2026-Y88', customer: 'Maria Clara', reason: 'Damaged Item upon arrival', status: 'approved' },
];

export default function SellerReturnsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [returnsList, setReturnsList] = useState(MOCK_RETURNS);

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected') => {
    setReturnsList(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

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
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Return & Refund Claims</h1>
          <p className="text-sm text-ink/50">Manage disputes, broken items, and replacement requests filed by your storefront buyers.</p>
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

      {/* 📊 RETURNS MANAGEMENT DATA SHEET */}
      {returnsList.length === 0 ? (
        <div className="bg-white border border-ink/10 rounded-2xl p-12 text-center text-sm text-ink/40 shadow-sm max-w-xl mx-auto space-y-2">
          <p className="font-semibold text-ink">No dispute logs found</p>
          <p className="max-w-md mx-auto leading-relaxed text-xs text-ink/50">
            Your customer returns channel is clean and operational. No replacement or refund claims pending.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-ink/50 font-semibold border-b border-ink/5 uppercase tracking-wider">
                  <th className="py-4 px-6">Return ID</th>
                  <th className="py-4 px-6">Customer & Order</th>
                  <th className="py-4 px-6">Reason for Return</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 text-xs">
                {returnsList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Return ID */}
                    <td className="py-4 px-6 font-mono font-bold text-ink/70">
                      #{item.id}
                    </td>
                    
                    {/* Customer Info */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-ink text-sm">{item.customer}</p>
                      <p className="text-ink/40 font-mono text-[10px] mt-0.5">Order ID: #{item.orderId}</p>
                    </td>
                    
                    {/* Return Reason */}
                    <td className="py-4 px-6 text-ink/70 font-medium">
                      <div className="flex items-center gap-1.5 text-[var(--color-coral)]">
                        <AlertCircle size={14} strokeWidth={2} />
                        <span>{item.reason}</span>
                      </div>
                    </td>
                    
                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[10px] tracking-wide uppercase ${
                        item.status === 'approved' ? 'bg-[var(--color-teal-light)] text-[var(--color-teal)]' :
                        item.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    
                    {/* Active Form Controls — Tailwind v4 optimised buttons */}
                    <td className="py-4 px-6 text-right">
                      {item.status === 'pending' ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStatusChange(item.id, 'approved')}
                            className="inline-flex items-center gap-1 bg-ink text-paper font-semibold px-3 py-1.5 rounded-xl text-[11px] hover:opacity-90 transition shadow-sm cursor-pointer"
                          >
                            <CheckCircle2 size={12} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'rejected')}
                            className="inline-flex items-center gap-1 border border-ink/10 text-ink font-semibold px-3 py-1.5 rounded-xl text-[11px] hover:bg-ink/5 transition shadow-sm cursor-pointer"
                          >
                            <XCircle size={12} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-ink/40 italic pr-2 flex items-center justify-end gap-1 font-medium">
                          <ShieldCheck size={13} className="text-[var(--color-teal)]" /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
