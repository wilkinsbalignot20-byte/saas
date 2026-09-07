 // src/app/seller/orders/returns/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';

interface ReturnItem {
  id: string;
  order_id: string;
  customer_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function SellerReturnsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [returnsList, setReturnsList] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. DATA CORE STREAM SYNC: Kukuha ng totoong dispute logs base sa store_id ng merchant
  useEffect(() => {
    const fetchReturnsData = async () => {
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

        // Hahatakin ang mga records mula sa bagong returns table
        const { data, error } = await supabase
          .from('returns')
          .select('id, order_id, customer_name, reason, status')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReturnsList(data || []);

      } catch (err: any) {
        console.error('Error fetching dispute channel records:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReturnsData();
  }, [router]);

  // 2. LIVE TRANSACTION ACTIONS: Magpapadala ng .update() call sa database pagka-click ng desisyon
  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('returns')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // I-update ang UI view table rows
      setReturnsList(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err: any) {
      alert(`❌ Error sa pag-save ng desisyon: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 HEADER SECTION WITH DYNAMIC TABS */}
      <div className="flex flex-col gap-5 border-b border-ink/5 pb-5">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/seller/orders')} 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname === '/seller/orders' ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>📋 All Orders</span>
          </button>
          <button 
            onClick={() => router.push('/seller/orders/returns')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname.includes('/returns') ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>🔄 Customer Returns</span>
          </button>
          <button 
            onClick={() => router.push('/seller/orders/logistics')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              pathname === '/seller/orders/logistics' ? 'bg-white text-ink shadow-sm font-bold' : 'text-ink/60 hover:text-ink'
            }`}
          >
            <span>🚚 Logistics</span>
          </button>
        </div>
      </div>

      {/* ERROR HANDLER DISPLAY BLOCK */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* 📊 RETURNS MANAGEMENT DATA SHEET */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <div className="text-sm font-medium text-ink/50">Loading customer dispute parameters...</div>
        </div>
      ) : returnsList.length === 0 ? (
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
                  <th className="py-4 px-6">Customer Name</th>
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
                      <span className="truncate max-w-[100px] block">#{item.id}</span>
                    </td>
                    
                    {/* Customer Info */}
                    <td className="py-4 px-6">
                      <p className="font-semibold text-ink text-sm">{item.customer_name}</p>
                      <p className="text-ink/40 font-mono text-[10px] mt-0.5 truncate max-w-[120px]">Order: #{item.order_id}</p>
                    </td>
                    
                    {/* Return Reason */}
                    <td className="py-4 px-6 text-coral font-medium">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={14} strokeWidth={2} />
                        <span>{item.reason}</span>
                      </div>
                    </td>
                    
                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[10px] tracking-wide uppercase ${
                        item.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        item.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
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
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleStatusChange(item.id, 'approved')}
                            className="inline-flex items-center gap-1 bg-ink text-paper font-semibold px-3 py-1.5 rounded-xl text-[11px] hover:opacity-90 transition shadow-sm cursor-pointer disabled:opacity-40"
                          >
                            <CheckCircle2 size={12} />
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleStatusChange(item.id, 'rejected')}
                            className="inline-flex items-center gap-1 border border-ink/10 text-ink font-semibold px-3 py-1.5 rounded-xl text-[11px] hover:bg-ink/5 transition shadow-sm cursor-pointer disabled:opacity-40"
                          >
                            <XCircle size={12} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-700 italic pr-2 flex items-center justify-end gap-1 font-medium select-none">
                          <ShieldCheck size={13} className="text-emerald-600" /> Resolved
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
