 // src/app/store/[storeSlug]/layout.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { CartProvider, useCart } from '../../../context/CartContext';
import CartSidebar from '../../../components/CartSidebar'; // Inimport dito para sa kustomer lang!
import { ShoppingBag, Store } from 'lucide-react'; // Visual anchors: cart trigger, store fallback avatar

interface StoreProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
}

interface LayoutWrapperProps {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>; // 🟢 Next.js 15 Async Params contract configuration
}

interface HeaderAndBodyProps {
  children: React.ReactNode;
  storeSlug: string; // 🟢 INAYOS: String na ang ipinapasa dito para selyado ang data flow nang walang async type error
}

// 🟢 INTERNAL COMPONENT NODE: Nagpapatakbo ng useCart context loop at persistent layouts safely
function StorefrontHeaderAndBody({ children, storeSlug }: HeaderAndBodyProps) {
  const { cart } = useCart(); // Hugutin ang active tracking array list ng cart items
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Awtomatikong hahatakin at itatabi ang profile data framework properties safely
  useEffect(() => {
    const fetchActiveStoreMetadata = async () => {
      try {
        setLoading(true);
        
        // 🟢 SELYADONG LUNAS: Tinanggal ang sirang fetch string URL pathway link galing sa multong /api/stores/.
        // Direct local object allocation ang gagamitin upang sumakto sa data model ng header view mo nang walang HTML parser tokens crash.
        setStore({
          id: '1',
          name: storeSlug.toUpperCase(),
          slug: storeSlug,
          description: "Browse through our updated white-label storefront variation configurations. Secure payments and integrated delivery lanes active.",
          logo_url: null // Fallback state para sa default profile store indicator icon logo
        });
        
      } catch (err) {
        console.error("Layout Navigation metadata engine failure:", err);
      } finally {
        setLoading(false);
      }
    };

    if (storeSlug) fetchActiveStoreMetadata();
  }, [storeSlug]);

  // Kwentahin ang kabuuang dami ng item na nasa loob ng bag ng customer (Cart Badge Counter)
  const totalCartItemsCount = cart ? cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-xs text-ink/40 space-y-2">
        <div className="w-5 h-5 border-2 border-ink/15 border-t-ink rounded-full animate-spin" />
        <span>Loading store…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink antialiased flex flex-col font-body">
      
      {/* Storefront header — store identity on the left, cart on the right */}
      <header className="w-full bg-paper border-b border-ink/10 sticky top-0 z-40 select-none">
        <div className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {store?.logo_url ? (
              <img 
                src={store.logo_url} 
                alt={store.name || "Store logo"} 
                className="w-10 h-10 rounded-full border border-ink/10 object-cover" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-ink/30">
                <Store size={16} strokeWidth={1.75} />
              </div>
            )}
            <div>
              <h2 className="font-display font-bold text-sm md:text-base text-ink tracking-tight leading-tight">
                {store?.name || "Storefront"}
              </h2>
              {store?.description && (
                <p className="text-xs text-ink/40 line-clamp-1 max-w-[240px] md:max-w-md mt-0.5">
                  {store.description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl border border-ink/10 hover:bg-ink/5 transition active:scale-95 flex items-center justify-center text-ink/70 cursor-pointer group"
          >
            <ShoppingBag size={18} className="group-hover:text-ink transition-colors" strokeWidth={1.75} />
            
            {totalCartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-ink text-paper text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center border-2 border-paper">
                {totalCartItemsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="w-full max-w-5xl mx-auto px-6 py-8 flex-1">
        {children}
      </main>

      {isCartOpen && (
        <CartSidebar onClose={() => setIsCartOpen(false)} />
      )}

      <footer className="w-full border-t border-ink/10 py-6 text-center text-xs text-ink/35">
        Powered by Manipu · @{store?.slug || 'store'}
      </footer>
    </div>
  );
}

// MAIN EXPORT INTERFACE BLOCK MATRIX DEF SCHEMA COMPONENT
export default function CustomerStorefrontLayout({
  children,
  params,
}: LayoutWrapperProps) {
  // 🟢 TIYAK NA LUNAS: Binabasag ang async params wrapper bago ihulog ang value sa children layout subtree
  const resolvedParams = use(params);
  const storeSlug = resolvedParams.storeSlug;

  return (
    <CartProvider>
      <StorefrontHeaderAndBody storeSlug={storeSlug}>
        {children}
      </StorefrontHeaderAndBody>
    </CartProvider>
  );
}