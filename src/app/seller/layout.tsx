 'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Receipt,
  Wallet,
  Tag,
  BarChart3,
  MessageCircle,
  LogOut,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const NAV_ITEMS = [
  { type: 'link', href: '/seller', label: 'Dashboard', icon: LayoutDashboard },
  {
    type: 'dropdown',
    label: 'Products',
    icon: Package,
    subItems: [
      { href: '/seller/products', label: 'Product List' },
      { href: '/seller/products/new', label: 'Add Product' },
      { href: '/seller/products/inventory', label: 'Inventory Stock' }
    ]
  },
  {
    type: 'dropdown',
    label: 'Orders & Shipping',
    icon: Receipt,
    subItems: [
      { href: '/seller/orders', label: 'Fulfillment' },
      { href: '/seller/orders/returns', label: 'Returns & Refunds' }
    ]
  },
  {
    type: 'dropdown',
    label: 'Finance & Income',
    icon: Wallet,
    subItems: [
      { href: '/seller/finance', label: 'Overview' },
      { href: '/seller/finance/withdraw', label: 'Withdrawal' },
      { href: '/seller/finance/income-statements', label: 'Income Statements' }
    ]
  },
  {
    type: 'dropdown',
    label: 'Vouchers & Ads',
    icon: Tag,
    subItems: [
      { href: '/seller/marketing', label: 'Vouchers Management' }
    ]
  },
  { type: 'link', href: '/seller/insights', label: 'Insights', icon: BarChart3 },
  { type: 'link', href: '/seller/chat', label: 'Customer Chat', icon: MessageCircle },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    Products: false,
    'Orders & Shipping': false,
    'Finance & Income': false,
    'Vouchers & Ads': false,
  });

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="min-h-screen bg-paper text-ink antialiased flex font-body">
      {/* SIDEBAR — persistent across every seller page */}
      <aside className="w-64 bg-ink text-paper p-6 flex flex-col justify-between hidden md:flex shrink-0 select-none">
        <div className="space-y-10">
          <Link href="/seller" className="font-display font-bold text-xl tracking-tight block">
            Manipu <span className="text-paper/40 font-normal text-sm">Seller</span>
          </Link>

          <nav className="space-y-1 text-sm font-medium text-paper/60">
            {NAV_ITEMS.map((item, index) => {
              if (item.type === 'link' && item.href) {
                const Icon = item.icon!;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-paper/10 hover:text-paper ${
                      isActive ? 'bg-paper/10 text-paper' : ''
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              if (item.type === 'dropdown') {
                const Icon = item.icon!;
                const isDropdownOpen = openDropdowns[item.label];
                const hasActiveSubItem = item.subItems?.some(sub => pathname === sub.href);

                return (
                  <div key={index} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-paper/10 hover:text-paper ${
                        hasActiveSubItem ? 'text-paper font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </div>
                      {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* SUB-MENU TREE ITEMS */}
                    {isDropdownOpen && (
                      <div className="pl-9 space-y-1 border-l border-paper/10 ml-6 my-1">
                        {item.subItems?.map((subItem, subIndex) => {
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subIndex}
                              href={subItem.href}
                              className={`block px-3 py-2 rounded-lg text-xs transition-colors hover:text-paper ${
                                isSubActive ? 'text-paper font-semibold bg-paper/5' : 'text-paper/50'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
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
    </div>
  );
}
