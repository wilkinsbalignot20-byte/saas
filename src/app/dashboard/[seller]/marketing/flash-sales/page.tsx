 // src/app/dashboard/[seller]/marketing/flash-sales/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Zap, Plus, RefreshCw, AlertCircle, Trash2, Calendar } from 'lucide-react';

interface FlashSaleItem {
  id: string;
  campaign_name: string;
  flash_price: number;
  starts_at: string;
  ends_at: string;
  products: {
    name: string;
    price: number;
  };
}

export default function SellerFlashSalesPage() {
  const router = useRouter();
  const [flashItems, setFlashItems] = useState<FlashSaleItem[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchFlashSalesData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 1. ISOLATION LOCK MATRIX: Kunin ang store id ng merchant
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        setStoreId(storeData.id);

        // 2. INNER JOIN QUERY ENGINE: Hahatakin ang flash rules kasabay ang product profiles name & original price
        const { data, error } = await supabase
          .from('flash_sales')
          .select(`
            id,
            campaign_name,
            flash_price,
            starts_at,
            ends_at,
            products (
              name,
              price
            )
          `)
          .eq('store_id', storeData.id)
          .order('starts_at', { ascending: true });

        if (error) throw error;
        setFlashItems((data as any) || []);

      } catch (err: any) {
        console.error('Error fetching marketing promotions database:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSalesData();
  }, [router]);

  // Async row record mutation execution block para mag-delete/tanggalin ang aitem sa promotion list
  const handleDeleteFlashItem = async (id: string) => {
    if (confirm('Sigurado ka bang gusto mong tanggalin ang produktong ito sa listahan ng Flash Sale?')) {
      try {
        const { error } = await supabase.from('flash_sales').delete().eq('id', id);
        if (error) throw error;
        setFlashItems(prev => prev.filter(item => item.id !== id));
      } catch (err: any) {
        alert(`❌ Error sa pag-delete: ${err.message}`);
      }
    }
  };
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 BREADCRUMB & HEADER HUB BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ink/5 pb-5">
        <div>
          <button 
            onClick={() => router.push('/seller/marketing')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>Bumalik sa Marketing</span>
          </button>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink flex items-center gap-2">
            <Zap className="text-marigold fill-marigold" size={24} />
            <span>Flash Sale Campaigns</span>
          </h1>
          <p className="text-sm text-ink/50 mt-1">Manage time-bound, high-discount limited campaigns to trigger buyer FOMO conversions.</p>
        </div>
        
        <button 
          onClick={() => alert('Creating new flash sale entry framework...')} 
          className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 transition cursor-pointer"
        >
          <Plus size={14} />
          <span>Add Flash Product</span>
        </button>
      </div>

      {/* ERROR HANDLER LOG DISPLAY */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-xl">
          <AlertCircle size={15} />
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* 📊 FLASH SALES CAMPAIGNS DATA SHEET CONTAINER */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <div className="text-sm font-medium text-ink/50">Loading campaign tracking channels...</div>
        </div>
      ) : flashItems.length === 0 ? (
        <div className="bg-white border border-ink/10 rounded-2xl p-12 text-center text-sm text-ink/40 shadow-sm max-w-2xl mx-auto space-y-3">
          <div className="bg-ink/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-ink/40">
            <Zap size={20} />
          </div>
          <p className="font-semibold text-ink">No scheduled flash streams found</p>
          <p className="max-w-xs mx-auto leading-relaxed text-xs text-ink/50">
            Maglagay ng mga diskwentong may takdang oras upang simulan ang pagpapasabog ng benta sa iyong dynamic customer storefront layouts.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-ink/50 font-semibold border-b border-ink/5 uppercase tracking-wider">
                  <th className="py-4 px-6">Campaign Info</th>
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6 text-right">Original Price</th>
                  <th className="py-4 px-6 text-right text-marigold-dark">Flash Price</th>
                  <th className="py-4 px-6 text-center">Active Timeline Schedule</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 text-xs">
                {flashItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* Campaign Name Title */}
                    <td className="py-4 px-6 font-semibold text-ink">
                      {item.campaign_name}
                    </td>
                    
                    {/* Product Joined Details Name */}
                    <td className="py-4 px-6 font-medium text-ink/80 max-w-[180px] truncate">
                      {item.products?.name || 'Unknown Product'}
                    </td>
                    
                    {/* Original Product Base Price */}
                    <td className="py-4 px-6 text-right font-mono text-ink/40 line-through">
                      ₱{Number(item.products?.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Highly Discounted Promo Flash Price */}
                    <td className="py-4 px-6 text-right font-mono font-bold text-marigold-dark text-sm bg-amber-50/30">
                      ₱{Number(item.flash_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    
                    {/* Time-bound Tickers Interval Logs */}
                    <td className="py-4 px-6 text-center text-ink/60 font-mono text-[11px]">
                      <div className="flex flex-col items-center gap-0.5 justify-center">
                        <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                          <Calendar size={10} /> Start: {new Date(item.starts_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                          <Calendar size={10} /> End: {new Date(item.ends_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    
                    {/* Operational Row Eraser Action Submitter */}
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDeleteFlashItem(item.id)}
                        className="p-2 border border-ink/10 text-coral hover:bg-rose-50/50 rounded-xl transition cursor-pointer"
                        title="Tanggalin sa Promo List"
                      >
                        <Trash2 size={13} className="pointer-events-none" />
                      </button>
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
