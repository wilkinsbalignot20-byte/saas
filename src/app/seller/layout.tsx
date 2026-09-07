 // src/app/seller/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ChevronUp,
  Store,
  Settings
} from 'lucide-react';

// EXPERT SaaS MENU REGISTRY CONTRACT
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
      { href: '/seller/orders/returns', label: 'Returns & Refunds' },
      { href: '/seller/orders/logistics', label: 'Integrated Courier' }
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
      { href: '/seller/marketing', label: 'Vouchers Management' },
      { href: '/seller/marketing/ads', label: 'Storefront Banners' },
      { href: '/seller/marketing/flash-sales', label: 'Flash Campaigns' }
    ]
  },
  { type: 'link', href: '/seller/insights', label: 'Insights Overview', icon: BarChart3 },
  { type: 'link', href: '/seller/chat', label: 'Customer Chat', icon: MessageCircle },
  { type: 'link', href: '/seller/settings', label: 'Store Settings', icon: Settings },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [storeName, setStoreName] = useState('Manipu Seller');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Dynamic status evaluation track maps
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    Products: false,
    'Orders & Shipping': false,
    'Finance & Income': false,
    'Vouchers & Ads': false,
  });
  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    const fetchStoreIdentity = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // Kukuha ng real configuration attributes para sa layout rendering header pipeline blocks
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('name, logo_url')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (!storeError && storeData) {
          setStoreName(storeData.name || 'Manipu Seller');
          setLogoUrl(storeData.logo_url);
        }
      } catch (err) {
        console.error('Error in sidebar data synchronization loop:', err);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchStoreIdentity();
  }, [router]);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50">Verifying merchant token session…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink antialiased flex font-body h-screen overflow-hidden">
      
      {/* SIDEBAR — persistent across every seller page */}
      <aside className="w-64 bg-ink text-paper p-6 flex flex-col justify-between hidden md:flex shrink-0 select-none border-r border-ink/10 h-full">
        <div className="space-y-10 overflow-y-auto pr-1 flex-1">
          
          {/* INAYOS: Dynamic Merchant Brand Panel with Logo Avatar Insertion */}
          <Link href="/seller" className="flex items-center gap-3 border-b border-paper/10 pb-5 block group">
            {logoUrl ? (
              <div 
                className="w-10 h-10 rounded-full border border-paper/10 overflow-hidden bg-white bg-cover bg-center shrink-0 shadow-md"
                style={{ backgroundImage: `url(${logoUrl})` }}
              >
                <img src={logoUrl} alt={storeName} className="sr-only" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-paper/10 text-paper flex items-center justify-center shrink-0 shadow-inner">
                <Store size={18} strokeWidth={1.75} />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm tracking-tight truncate group-hover:text-paper/90 transition-colors">
                {storeName}
              </h2>
              <span className="text-paper/40 text-[11px] uppercase tracking-wider block font-semibold mt-0.5">
                Merchant Panel
              </span>
            </div>
          </Link>

          {/* Navigation Items Interface Controllers Mapping */}
          <nav className="space-y-1 text-sm font-medium text-paper/60">
            {NAV_ITEMS.map((item, index) => {
              if (item.type === 'link' && item.href) {
                const Icon = item.icon!;
                const isActive = pathname === item.href || (item.href !== '/seller' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-paper/10 hover:text-paper ${
                      isActive ? 'bg-paper/10 text-paper font-semibold' : ''
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              if (item.type === 'dropdown') {
                const Icon = item.icon!;
                const isDropdownOpen = openDropdowns[item.label!];
                const hasActiveSubItem = item.subItems?.some(sub => pathname === sub.href || pathname.startsWith(sub.href));

                return (
                  <div key={index} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.label!)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-paper/10 hover:text-paper cursor-pointer ${
                        hasActiveSubItem ? 'text-paper font-semibold bg-paper/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </div>
                      {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* SUB-MENU TREE ITEMS EXPANSION PANEL */}
                    {isDropdownOpen && (
                      <div className="pl-9 space-y-1 border-l border-paper/10 ml-6 my-1 animate-in fade-in slide-in-from-top-1 duration-200">
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

        {/* Profile footer with live Supabase operational signOut token trigger */}
        <div className="border-t border-paper/10 pt-4 mt-auto">
          <button
            type="button"
            onClick={async () => {
              if (confirm('Sigurado ka bang gusto mong mag-sign out mula sa iyong Control Center?')) {
                await supabase.auth.signOut();
                window.location.href = '/login';
              }
            }}
            className="w-full flex items-center gap-3 text-left text-sm text-paper/50 hover:text-paper font-medium px-4 py-2.5 rounded-xl hover:bg-paper/10 transition-colors cursor-pointer group"
          >
            <LogOut size={18} strokeWidth={1.75} className="text-paper/40 group-hover:text-rose-400 transition-colors" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE VIEWPORT — each seller page renders here */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-paper">
        {children}
      </div>

    </div>
  );
}
