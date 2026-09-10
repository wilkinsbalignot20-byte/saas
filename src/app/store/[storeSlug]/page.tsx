 'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, ArrowRight, Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function CustomerStorefrontPage() {
  const params = useParams();
  const storeSlug = params?.storeSlug as string;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreCatalog = async () => {
      try {
        // Kukuha ng mga produkto gamit ang bago mong official Supabase ID
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, stock')
          .eq('store_id', '54f9be83-6bc6-4b2b-9815-f81875955d73');

        // FALLBACK PRACTICE DATA:
        if (error || !data || data.length === 0) {
          setProducts([
            { id: '1', name: 'Premium Barako Coffee Beans 250g', price: 350.00, stock: 12 },
            { id: '2', name: 'Classic Minimalist Boxy Fit Tee', price: 499.00, stock: 5 },
            { id: '3', name: 'Canvas Tote Bag Large Graphic', price: 280.00, stock: 0 },
          ]);
        } else {
          setProducts(data);
        }
      } catch (err) {
        console.error('Error rendering customer catalog pipeline:', err);
      } finally {
        setLoading(false);
      }
    };

    if (storeSlug) {
      fetchStoreCatalog();
    }
  }, [storeSlug]);

  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased flex flex-col justify-between">
      
      {/* 🧭 CUSTOMER STOREFRONT TOP BAR BRANDING */}
      <header className="sticky top-0 bg-white border-b border-ink/5 px-6 py-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-black text-xl tracking-tight uppercase">
            Storefront
          </span>
          <span className="text-[10px] font-mono text-ink/40 max-w-[120px] truncate hidden sm:inline-block">
            ID: {storeSlug}
          </span>
        </div>

        {/* Global Bag State Trigger Button Shortcuts */}
        <button className="relative bg-ink text-paper p-3 rounded-xl transition hover:bg-ink/90 active:scale-95 flex items-center gap-2 text-xs font-semibold cursor-pointer">
          <ShoppingBag size={15} />
          <span>Shopping Bag</span>
          <span className="bg-[var(--color-teal)] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
            0
          </span>
        </button>
      </header>

      {/* 🛍️ MAIN CATALOG MERCHANDISE SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-10">
        
        {/* HERO BANNER COVER ELEMENT */}
        <div className="bg-white border border-ink/10 rounded-3xl p-6 md:p-10 flex flex-col justify-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 text-xs text-[var(--color-teal)] font-semibold bg-[var(--color-teal-light)] px-3 py-1 rounded-full w-max">
            <Sparkles size={13} />
            <span>Storefront Active & Verified</span>
          </div>
          <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight max-w-xl leading-tight">
            Welcome to Our Dynamic Showcase
          </h1>
          <p className="text-sm text-ink/50 max-w-md leading-relaxed">
            Browse through our updated variation structures. Enjoy secure checkouts and reliable national delivery options.
          </p>
        </div>

        {/* CATALOG LOG ARCHITECTURE */}
        <div className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-ink/5 pb-3">
            <h3 className="font-display font-bold text-lg md:text-xl tracking-tight">All Products</h3>
            <span className="text-xs text-ink/40 font-medium font-mono">{products.length} catalog items</span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-sm font-medium text-ink/40 animate-pulse">
              Loading merchant storefront showcase...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white border border-ink/10 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative group hover:border-ink/20 transition-all"
                >
                  {/* Aesthetic image wrapper box holder */}
                  <div className="bg-gray-50 border border-ink/5 rounded-xl aspect-square w-full flex items-center justify-center text-ink/10 relative overflow-hidden mb-4">
                    <ShoppingBag size={48} strokeWidth={1} />
                    <button className="absolute top-3 right-3 p-2.5 bg-white border border-ink/5 rounded-xl text-ink/30 hover:text-rose-600 transition shadow-sm cursor-pointer">
                      <Heart size={14} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Item parameters */}
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-sm text-ink leading-snug line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                        <span className={product.stock === 0 ? 'text-[var(--color-coral)] font-bold' : 'text-ink/40'}>
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} units left`}
                        </span>
                      </div>
                    </div>

                    {/* Price Tag & Add Trigger Container */}
                    <div className="flex items-center justify-between pt-2 border-t border-ink/5">
                      <div className="font-mono text-base font-bold text-ink">
                        <span className="text-xs font-sans font-normal text-ink/40 mr-0.5">₱</span>
                        {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      
                      <button 
                        disabled={product.stock === 0}
                        onClick={() => alert(`Added ${product.name} to checkout bag payload!`)}
                        className="inline-flex items-center gap-1.5 bg-ink text-paper font-semibold px-3 py-2 rounded-xl text-[11px] hover:bg-ink/90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition shadow-sm cursor-pointer"
                      >
                        <span>Add to Cart</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* 🔒 SECURE FOOTER ACCENT */}
      <footer className="bg-white border-t border-ink/5 p-6 text-center text-xs text-ink/40 font-medium">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-[var(--color-teal)]" />
          <span>Multi-Tenant Storefront Secured by Manipu Cloud Solutions © 2026</span>
        </div>
      </footer>

    </div>
  );
}
