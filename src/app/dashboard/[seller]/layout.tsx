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
  Cpu,        // Icon para sa Automation Engine
  FileText,   // Icon para sa Reports
  Truck,      // Icon para sa Logistics Control
  Settings,   // Icon para sa Settings
  LogOut,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Seller Center — Manipu',
  description: 'Manage your storefront, orders, and earnings in one place.',
};

interface SellerLayoutProps {
  children: React.ReactNode;
  params: Promise<{ seller: string }>;
}

export default async function SellerLayout({
  children,
  params,
}: SellerLayoutProps) {
  // Sa Next.js 15, kailangan i-await ang params bago basahin ang dynamic segment handle
  const { seller } = await params;

  // 🚀 HIGHWAY ROUTING MAP: Lahat ng iyong folders ay 100% interconnected na ngayon gamit ang orihinal mong style scheme
  // Grouped by what a seller actually does day-to-day, instead of one long flat list.
  const NAV_GROUPS = [
    {
      label: 'Overview',
      items: [
        { href: `/dashboard/${seller}`, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Catalog & orders',
      items: [
        { href: `/dashboard/${seller}/product`, label: 'Products', icon: Package },
        { href: `/dashboard/${seller}/order`, label: 'Orders & shipping', icon: Receipt },
        { href: `/dashboard/${seller}/order/logistics`, label: 'Logistics control', icon: Truck },
      ],
    },
    {
      label: 'Money & growth',
      items: [
        { href: `/dashboard/${seller}/finance`, label: 'Finance & income', icon: Wallet },
        { href: `/dashboard/${seller}/marketing`, label: 'Vouchers & ads', icon: Tag },
        { href: `/dashboard/${seller}/insights`, label: 'Insights', icon: BarChart3 },
      ],
    },
    {
      label: 'Operations',
      items: [
        { href: `/dashboard/${seller}/chat`, label: 'Customer chat', icon: MessageCircle },
        { href: `/dashboard/${seller}/automation`, label: 'Automation engine', icon: Cpu },
        { href: `/dashboard/${seller}/reports`, label: 'Reports', icon: FileText },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink antialiased flex font-body">
      {/* SIDEBAR — persistent across every seller page gamit ang original mong ink background */}
      <aside className="w-64 bg-ink text-paper p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-8">
          <div className="space-y-3">
            <Link href={`/dashboard/${seller}`} className="font-display font-bold text-xl tracking-tight block">
              Manipu <span className="text-paper/40 font-normal text-sm">Seller</span>
            </Link>

            {/* Dynamic tenant indicator, styled like a hang tag clipped to a garment */}
            <div className="flex items-center gap-2 pl-3 pr-3 py-1.5 rounded-lg border-l-2 border-teal bg-paper/[0.06] text-xs text-paper/50 truncate">
              <span>Workspace</span>
              <span className="text-paper font-semibold">@{seller}</span>
            </div>
          </div>

          <nav className="space-y-6 text-sm font-medium text-paper/60">
            {NAV_GROUPS.map((group, i) => (
              <div
                key={group.label}
                className={i > 0 ? 'pt-6 border-t border-dashed border-paper/15 space-y-1' : 'space-y-1'}
              >
                <p className="px-4 pb-2 text-[11px] text-paper/35">{group.label}</p>
                {group.items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-paper/10 hover:text-paper transition-colors"
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Profile footer and safety logout controller */}
        <div className="border-t border-dashed border-paper/15 pt-4 space-y-1">
          <Link
            href={`/dashboard/${seller}/setting`}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-paper/60 hover:bg-paper/10 hover:text-paper transition-colors"
          >
            <Settings size={18} strokeWidth={1.75} />
            Settings
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 text-left text-sm text-paper/50 hover:text-paper font-medium px-4 py-2.5 rounded-xl hover:bg-paper/10 transition-colors cursor-pointer"
            >
              <LogOut size={18} strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT — each seller subroute page renders here cleanly without layout bugs */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}