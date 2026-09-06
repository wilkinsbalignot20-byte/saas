 'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, HelpCircle, Sparkles, Tag, ArrowDownCircle } from 'lucide-react';

export default function ConversionInsightsPage() {
  // Conversion Funnel Data Simulation
  const funnelSteps = [
    { step: 'Storefront Page Views', count: '10,240', percentage: 100, dropoff: '85.0%', description: 'Total unique shopper sessions browsing your domain.' },
    { step: 'Product Clicks / Add to Cart', count: '1,536', percentage: 15, dropoff: '66.7%', description: 'Shoppers who showed strong purchase intent by modifying bags.' },
    { step: 'Initiated Checkouts', count: '512', percentage: 5, dropoff: '35.9%', description: 'Shoppers who advanced to filling out delivery & courier info.' },
    { step: 'Completed Orders', count: '328', percentage: 3.2, dropoff: null, description: 'Successful paid or COD multi-tenant transactions completed.' },
  ];

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

      {/* OVERALL PERFORMANCE CARD */}
      <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm grid md:grid-cols-3 gap-6 items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink/40 uppercase tracking-wider">
            <span>Store Conversion Rate</span>
            <HelpCircle size={13} className="text-ink/30" />
          </div>
          <div className="text-4xl font-bold font-display tracking-tight text-ink flex items-baseline gap-2">
            <span>3.20%</span>
            <span className="text-xs text-teal font-mono font-medium flex items-center gap-0.5">
              <TrendingUp size={12} /> +0.45%
            </span>
          </div>
          <p className="text-xs text-ink/40">Gross completed vs total visits</p>
        </div>
        
        <div className="md:col-span-2 text-xs text-ink/60 leading-relaxed border-t md:border-t-0 md:border-l border-ink/10 pt-4 md:pt-0 md:pl-6 flex items-start gap-3">
          <div className="bg-teal/10 text-teal p-2 rounded-xl shrink-0 mt-0.5">
            <Sparkles size={14} />
          </div>
          <div>
            <p className="font-semibold text-ink mb-0.5">Manipu Optimization Insight</p>
            Your store conversion is currently within the healthy benchmark for local e-commerce (2.5% - 4.0%). Abandoned checkouts can be further recovered by setting up dynamic marketing vouchers or flash sales to incentivize high-intent traffic.
          </div>
        </div>
      </div>

      {/* FUNNEL VISUALIZATION AND BREAKDOWN */}
      <div className="border border-ink/10 rounded-2xl p-6 bg-white shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-ink/5 pb-4">
          <h3 className="font-semibold text-sm text-ink">Shopper Conversion Pipeline</h3>
          <span className="text-[11px] text-ink/40 font-mono">Realtime Session Aggregates</span>
        </div>
        
        <div className="space-y-2">
          {funnelSteps.map((item, idx) => (
            <div key={idx} className="group">
              {/* Main row grid container */}
              <div className="bg-gray-50/50 hover:bg-gray-50 border border-ink/5 rounded-xl p-4 transition-colors grid sm:grid-cols-12 gap-4 items-center">
                
                {/* Step Name */}
                <div className="sm:col-span-4 space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-ink/30 uppercase tracking-wider block">Step 0{idx + 1}</span>
                  <span className="text-xs font-semibold text-ink group-hover:text-ink transition-colors block">{item.step}</span>
                </div>

                {/* Progress bar visual container */}
                <div className="sm:col-span-5">
                  <div className="w-full bg-ink/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-ink h-full rounded-full transition-all duration-500" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-ink/40 mt-1.5 leading-tight line-clamp-1">{item.description}</p>
                </div>

                {/* Data counts */}
                <div className="sm:col-span-3 text-right font-mono text-xs flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-1">
                  <span className="text-ink/50 text-[11px] sm:text-xs">{item.count} sessions</span>
                  <span className="font-bold text-ink bg-ink/5 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded text-[11px] sm:text-sm">
                    {item.percentage}%
                  </span>
                </div>

              </div>

              {/* Dynamic Connecting Arrow / Drop-off Indicator between fields */}
              {item.dropoff && (
                <div className="flex items-center justify-center my-2 gap-2 text-[10px] font-mono text-rose-600/80 bg-rose-50/40 w-max mx-auto px-3 py-1 rounded-full border border-rose-100/50">
                  <ArrowDownCircle size={11} />
                  <span>{item.dropoff} drop-off rate</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ABANDONMENT RECOVERY CONTROL SHORTCUT */}
      <div className="border border-ink/15 rounded-2xl p-6 bg-ink text-paper flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-paper/10 p-1.5 rounded-lg text-paper">
              <Tag size={14} />
            </div>
            <h4 className="font-semibold text-sm">Recover Abandoned Carts?</h4>
          </div>
          <p className="text-xs text-paper/60 max-w-xl">
            Automate recovery flows. Create limited-time coupon codes to dynamically incentivize buyers who left items pending in their active checkouts.
          </p>
        </div>
        <Link 
          href="/seller/marketing" 
          className="bg-paper text-ink font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-paper/90 active:scale-95 transition inline-flex items-center gap-2 shrink-0 select-none shadow-sm"
        >
          <span>Setup Voucher Discount</span>
          <ArrowRight size={13} />
        </Link>
      </div>

    </main>
  );
}
