 // src/app/seller/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Receipt,
  Wallet,
  Tag,
  BarChart3,
  MessageCircle,
  LogOut,
} from 'lucide-react';
import LiveChat from '../../../components/LiveChat';

export const metadata: Metadata = {
  title: 'Seller Center — Manipu',
  description: 'Manage your storefront, orders, and earnings in one place.',
};

const NAV_ITEMS = [
  { href: '/seller', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Orders & Shipping', icon: Receipt },
  { href: '/seller/finance', label: 'Finance & Income', icon: Wallet },
  { href: '/seller/marketing', label: 'Vouchers & Ads', icon: Tag },
  { href: '/seller/insights', label: 'Insights', icon: BarChart3 },
  { href: '/seller/chat', label: 'Customer Chat', icon: MessageCircle },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink antialiased flex font-body">
      {/* SIDEBAR — persistent across every seller page */}
      <aside className="w-64 bg-ink text-paper p-6 flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-10">
          <Link href="/seller" className="font-display font-bold text-xl tracking-tight block">
            Manipu <span className="text-paper/40 font-normal text-sm">Seller</span>
          </Link>

          <nav className="space-y-1 text-sm font-medium text-paper/60">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-paper/10 hover:text-paper transition-colors"
              >
                <Icon size={18} strokeWidth={1.75} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile footer */}
        <form action="/api/auth/logout" method="post" className="border-t border-paper/10 pt-4">
          <button
            type="submit"
            className="w-full flex items-center gap-3 text-left text-sm text-paper/50 hover:text-paper font-medium px-4 py-2.5 rounded-xl hover:bg-paper/10 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Sign out
          </button>
        </form>
      </aside>

      {/* MAIN CONTENT — each seller page renders here */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>

      {/* Live chat, available across the whole Seller Center */}
      <LiveChat storeId="a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" isSeller={true} />
    </div>
  );
}