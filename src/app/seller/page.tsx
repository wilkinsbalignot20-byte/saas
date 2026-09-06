 // src/app/seller/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { TrendingUp, ShoppingBag, AlertTriangle, Ticket } from 'lucide-react';

export default function SellerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [merchantEmail, setMerchantEmail] = useState('');

  // Mock values — replace with real Supabase aggregates once the seller API routes are wired up
  const [metrics] = useState({
    totalSales: 24500.0,
    ordersCount: 48,
    lowStockItems: 3,
    activeVouchers: 2,
  });

  useEffect(() => {
    const checkUser = async () => {
      // TODO: remove this bypass once seller auth is fully wired up. Real check below.
      setMerchantEmail('developer@manipu.com');
      setLoading(false);

      /*
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setMerchantEmail(session.user.email || '');
        setLoading(false);
      }
      */
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50">Loading your dashboard…</div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper">
      <header>
        <p className="text-sm text-ink/40 mb-1">{merchantEmail}</p>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight">Store overview</h1>
        <p className="text-sm text-ink/50 mt-1">Here&apos;s how your store is doing today.</p>
      </header>

      {/* SUMMARY SCORECARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide">Total revenue</span>
            <TrendingUp size={16} className="text-teal" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-2xl text-ink">
            ₱{metrics.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-ink/40 mt-1">Gross sales this month</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide">Orders received</span>
            <ShoppingBag size={16} className="text-ink/40" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-2xl text-ink">{metrics.ordersCount}</div>
          <p className="text-xs text-ink/40 mt-1">Awaiting fulfillment or shipping</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide">Low stock</span>
            <AlertTriangle size={16} className="text-marigold-dark" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-2xl text-marigold-dark">{metrics.lowStockItems}</div>
          <p className="text-xs text-ink/40 mt-1">Products running low</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-ink/40 uppercase tracking-wide">Active campaigns</span>
            <Ticket size={16} className="text-teal" strokeWidth={1.75} />
          </div>
          <div className="font-display font-bold text-2xl text-ink">{metrics.activeVouchers}</div>
          <p className="text-xs text-ink/40 mt-1">Live vouchers and discounts</p>
        </div>
      </div>

      {/* QUICK ACTION & OPERATIONAL HUBS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-ink/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-ink/60 mb-4">Recent activity</h3>
          <div className="border border-dashed border-ink/15 rounded-xl p-10 text-center text-sm text-ink/40">
            No new orders yet. Share your store link to start getting sales.
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink/60 mb-2">Store appearance</h3>
            <p className="text-sm text-ink/50 leading-relaxed">
              Update your logo, brand color, and layout to keep your storefront looking fresh.
            </p>
          </div>
          <button className="w-full bg-ink text-paper font-semibold py-3 rounded-xl text-sm mt-6 hover:bg-ink/90 transition-colors">
            Customize your store
          </button>
        </div>
      </div>
    </main>
  );
}