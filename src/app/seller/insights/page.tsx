 'use client';

import Link from 'next/link';
import { BarChart3, Users, BarChart2, ShieldCheck, ArrowRight, Eye, ShoppingBag } from 'lucide-react';

export default function SellerInsightsPage() {
  // Mock data para sa storefront traffic analytics
  const insights = [
    { label: 'Storefront Visitors', value: '1,240', status: 'Good', trend: '+12% this week', icon: Users },
    { label: 'Conversion Rate', value: '3.2%', status: 'Stable', trend: 'Healthy threshold', icon: BarChart2 },
    { label: 'Average Basket Value', value: '₱850.00', status: 'Excellent', trend: 'Driven by bundles', icon: ShieldCheck },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER PANEL WITH NAVIGATION LINKS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ink/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">
            Business Insights
          </h1>
          <p className="text-sm text-ink/50 mt-1">
            Deep-dive analysis of your multi-tenant storefront conversion patterns.
          </p>
        </div>
        
        {/* ACTION SHORTCUT FOR SUB-FOLDER RESOLUTION */}
        <Link 
          href="/seller/insights/conversion" 
          className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 transition select-none group"
        >
          <span>View Full Conversion Funnel</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* INSIGHTS GRID SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40 group hover:border-ink/20 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wide">
                  {item.label}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  item.status === 'Excellent' || item.status === 'Good' 
                    ? 'bg-teal/10 text-teal' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="text-3xl font-bold font-display tracking-tight text-ink flex items-center justify-between">
                  <span>{item.value}</span>
                  <Icon size={20} className="text-ink/15 group-hover:text-ink/30 transition-colors" strokeWidth={1.5} />
                </div>
                <div className="text-[11px] font-medium text-ink/40 font-mono">
                  {item.trend}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOP PERFORMING CATALOG SHEET / TABLE */}
      <div className="border border-ink/10 rounded-2xl p-6 bg-white shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-ink/5 pb-3">
          <BarChart3 size={16} className="text-[var(--color-teal)]" />
          <h3 className="font-semibold text-sm text-ink">Top Performing Products</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-ink/50 font-semibold border-b border-ink/5 uppercase tracking-wider">
                <th className="py-4 px-6">Product Details Name</th>
                <th className="py-4 px-6 text-right w-36">Storefront Views</th>
                <th className="py-4 px-6 text-right w-36">Sales count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 text-xs text-ink/70">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-ink font-semibold text-sm">Sample Merchant Catalog Item #1</td>
                <td className="py-4 px-6 text-right font-mono font-medium text-ink/60">
                  <span className="inline-flex items-center gap-1"><Eye size={12} /> 432</span>
                </td>
                <td className="py-4 px-6 text-right font-mono font-bold text-[var(--color-teal)]">
                  <span className="inline-flex items-center gap-1"><ShoppingBag size={12} /> 24</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-ink font-semibold text-sm">Sample Merchant Catalog Item #2</td>
                <td className="py-4 px-6 text-right font-mono font-medium text-ink/60">
                  <span className="inline-flex items-center gap-1"><Eye size={12} /> 310</span>
                </td>
                <td className="py-4 px-6 text-right font-mono font-bold text-[var(--color-teal)]">
                  <span className="inline-flex items-center gap-1"><ShoppingBag size={12} /> 18</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  );
}
