 // src/app/dashboard/[seller]/insights/conversion/page.tsx
'use client';

// src/app/seller/insights/conversion/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // 🎯 TAMA: Ito lang ang nag-iisang Link component na kailangan
import { useRouter } from 'next/navigation'; 
import { supabase } from '../../../../../lib/supabase';
import { ArrowRight, TrendingUp, HelpCircle, Sparkles, Tag, ArrowDownCircle, RefreshCw, AlertCircle } from 'lucide-react';


interface FunnelStep {
  step: string;
  count: string;
  percentage: number;
  dropoff: string | null;
  description: string;
}

export default function ConversionFunnelPage() {
  const router = useRouter();
  
  // Real Analytical Computational Core States
  const [conversionRate, setConversionRate] = useState(0);
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchConversionAnalytics = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // 1. TENANT MATRIX EXTRACTION: Kunin ang store id ng merchant
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        const activeStoreId = storeData.id;

        // 2. EXPERT SAAS AGGREGATION SYSTEM (4-Stage Core Funnel Counters):
        
        // A. Kunin ang kabuuang bilang ng active items/SKUs ng merchant (Catalog Baseline)
        const { count: totalSKUs, error: skuError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', activeStoreId);

        // B. Kunin ang lahat ng naitalang orders kahit anong status (Total Checkout Initiations)
        const { count: totalCheckouts, error: totalOrdersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', activeStoreId);

        // C. Kunin ang active orders sa operational fulfillment flow (Fulfillment Processing)
        const { count: processingOrders, error: pendingOrdersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', activeStoreId)
          .in('status', ['pending', 'processing', 'shipped']);

        // D. Kunin ang mga transaksyong naging successful paid/COD cash (Completed Purchases)
        const { count: paidOrders, error: completedOrdersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', activeStoreId)
          .eq('status', 'completed');

        if (skuError || totalOrdersError || pendingOrdersError || completedOrdersError) {
          throw new Error('May naganap na isyu sa pagkalkula ng iyong store conversion summaries.');
        }

        const catalogCount = totalSKUs || 0;
        const checkoutCount = totalCheckouts || 0;
        const logisticsCount = processingOrders || 0;
        const finalPaidCount = paidOrders || 0;

        // 3. INDUSTRY STANDARD CONVERSION MATHEMATICS:
        const rate = checkoutCount > 0 ? (finalPaidCount / checkoutCount) * 100 : 0;
        setConversionRate(rate);

        // 4. EXPERT FUNNEL DESTRUCTURING DATA CONTRACT:
        const compiledSteps: FunnelStep[] = [
          {
            step: 'Catalog Explorations',
            count: catalogCount.toString(),
            percentage: catalogCount > 0 ? 100 : 0,
            dropoff: catalogCount > 0 && checkoutCount > 0 ? `${Math.max(0, (100 - (checkoutCount / catalogCount) * 100)).toFixed(1)}%` : '0%',
            description: 'Active inventory SKUs deployed on your custom storefront layout.'
          },
          {
            step: 'Checkout Initiations',
            count: checkoutCount.toString(),
            percentage: catalogCount > 0 ? Math.min(100, Math.round((checkoutCount / Math.max(1, catalogCount)) * 100)) : (checkoutCount > 0 ? 100 : 0),
            dropoff: checkoutCount > 0 ? `${(((checkoutCount - logisticsCount - finalPaidCount) / checkoutCount) * 100).toFixed(1)}%` : '0%',
            description: 'Shoppers who hit the checkout button and began configuring couriers.'
          },
          {
            step: 'Logistics Fulfillment',
            count: (logisticsCount + finalPaidCount).toString(),
            percentage: checkoutCount > 0 ? Math.round(((logisticsCount + finalPaidCount) / checkoutCount) * 100) : 0,
            dropoff: (logisticsCount + finalPaidCount) > 0 ? `${((logisticsCount / (logisticsCount + finalPaidCount)) * 100).toFixed(1)}%` : '0%',
            description: 'Orders advanced to active shipping pipelines or airwaybill routing.'
          },
          {
            step: 'Completed Purchases',
            count: finalPaidCount.toString(),
            percentage: checkoutCount > 0 ? Math.round((finalPaidCount / checkoutCount) * 100) : 0,
            dropoff: null,
            description: 'Successful fully settled and finalized multi-tenant transaction records.'
          }
        ];

        setFunnelSteps(compiledSteps);

      } catch (err: any) {
        console.error('Error compiling premium conversion funnel matrix:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversionAnalytics();
  }, [router]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Compiling premium conversion funnel matrix...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* BREADCRUMB & HEADER SECTION */}
      <div className="space-y-2">
        <nav className="text-xs font-medium text-ink/40 font-mono flex items-center gap-2">
          <Link href="/seller/insights" className="hover:text-ink transition-colors">Insights</Link>
          <span className="text-ink/20">/</span>
          <span className="text-ink/60">Conversion Analysis</span>
        </nav>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">
          Conversion Funnel
        </h1>
        <p className="text-sm text-ink/50">
          Analyze and target where dynamic shopper sessions drop off before order fulfillment.
        </p>
      </div>

      {/* ERROR HANDLER NOTIFIER */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2 max-w-xl">
          <AlertCircle size={15} />
          <span>⚠️ {errorMessage}</span>
        </div>
      )}

      {/* OVERALL PERFORMANCE CARD */}
      <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm grid md:grid-cols-3 gap-6 items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink/40 uppercase tracking-wider select-none">
            <span>Store Conversion Rate</span>
            <HelpCircle size={13} className="text-ink/30" />
          </div>
          <div className="text-4xl font-bold font-display tracking-tight text-ink flex items-baseline gap-2">
            <span>{conversionRate.toFixed(2)}%</span>
            <span className="text-xs text-emerald-600 font-mono font-medium flex items-center gap-0.5 select-none">
              <TrendingUp size={12} /> Live
            </span>
          </div>
          <p className="text-xs text-ink/40">Gross completed vs total visits</p>
        </div>
        
        <div className="md:col-span-2 text-xs text-ink/60 leading-relaxed border-t md:border-t-0 md:border-l border-ink/10 pt-4 md:pt-0 md:pl-6 flex items-start gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-2 rounded-xl shrink-0 mt-0.5 select-none">
            <Sparkles size={14} />
          </div>
          <div>
            <p className="font-semibold text-ink mb-0.5">SaaS Funnel Optimization Insight</p>
            Your premium store conversion calculation aggregates real-time transactional ratios directly from your product catalog readiness and order checkout intent logs. Abandoned checkouts can be further recovered by setting up dynamic marketing vouchers or flash sales to incentivize high-intent traffic.
          </div>
        </div>
      </div>

      {/* FUNNEL VISUALIZATION AND BREAKDOWN */}
      <div className="border border-ink/10 rounded-2xl p-6 bg-white shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-ink/5 pb-4">
          <h3 className="font-semibold text-sm text-ink">Shopper Conversion Pipeline</h3>
          <span className="text-[11px] text-ink/40 font-mono select-none">Realtime Transaction Aggregates</span>
        </div>
        
        <div className="space-y-2">
          {funnelSteps.map((item, idx) => (
            <div key={idx} className="group">
              {/* Main row grid container */}
              <div className="bg-gray-50/50 hover:bg-gray-50 border border-ink/5 rounded-xl p-4 transition-colors grid sm:grid-cols-12 gap-4 items-center">
                
                {/* Step Name */}
                <div className="sm:col-span-4 space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-ink/30 uppercase tracking-wider block select-none">Stage 0{idx + 1}</span>
                  <span className="text-xs font-semibold text-ink group-hover:text-ink transition-colors block">{item.step}</span>
                </div>

                {/* Progress bar visual container */}
                <div className="sm:col-span-5">
                  <div className="w-full bg-ink/5 h-2 rounded-full overflow-hidden select-none">
                    <div 
                      className="bg-ink h-full rounded-full transition-all duration-500" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-ink/40 mt-1.5 leading-tight line-clamp-1 select-none">{item.description}</p>
                </div>

                {/* Data counts */}
                <div className="sm:col-span-3 text-right font-mono text-xs flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-1">
                  <span className="text-ink/50 text-[11px] sm:text-xs">
                    {idx === 0 ? `${item.count} items deployed` : `${item.count} orders recorded`}
                  </span>
                  <span className="font-bold text-ink bg-ink/5 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded text-[11px] sm:text-sm select-all">
                    {item.percentage}%
                  </span>
                </div>

              </div>

              {/* Dynamic Connecting Arrow / Drop-off Indicator between fields */}
              {item.dropoff && item.dropoff !== '0%' && item.dropoff !== '100%' && (
                <div className="flex items-center justify-center my-2 gap-2 text-[10px] font-mono text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full w-max mx-auto select-none animate-in fade-in duration-200">
                  <ArrowDownCircle size={11} />
                  <span>{item.dropoff} drop-off rate</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ABANDONMENT RECOVERY CONTROL SHORTCUT */}
      <div className="border border-ink/15 rounded-2xl p-6 bg-ink text-paper flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md shadow-ink/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-paper/10 p-1.5 rounded-lg text-paper select-none">
              <Tag size={14} />
            </div>
            <h4 className="font-semibold text-sm">Recover Abandoned Carts?</h4>
          </div>
          <p className="text-xs text-paper/60 max-w-xl">
            Automate recovery flows. Create limited-time coupon codes to dynamically incentivize buyers who left items pending in their active checkouts.
          </p>
        </div>
        <Link 
          href="/seller/marketing/voucher" 
          className="bg-paper text-ink font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-paper/90 active:scale-95 transition inline-flex items-center gap-2 shrink-0 select-none shadow-xs"
        >
          <span>Setup Voucher Discount</span>
          <ArrowRight size={13} />
        </Link>
      </div>

    </main>
  );
}
