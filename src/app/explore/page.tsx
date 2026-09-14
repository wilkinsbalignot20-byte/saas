 // src/app/(marketplace)/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Store } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // 🟢 SINKRONISADO: Sakto ang pabalik na daan patungong lib
import ProductCard from '../store/[storeSlug]/ProductCard'; // 🟢 SINKRONISADO: Reusable card link

interface MarketplaceProductItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string | null;
  category?: string;
  store_name: string; 
}

export default function LazadaStyleMarketplaceHome() {
  const [products, setProducts] = useState<MarketplaceProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalMarketplaceCatalog = async () => {
      try {
        setLoading(true);

        // 🗄️ RELATIONAL JOIN QUERY: Kukuha ng LAHAT ng rows sa products table nang walang store_id filter
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, 
            name, 
            price, 
            stock, 
            image_url, 
            category,
            stores (
              name
            )
          `);

        if (error) {
          console.error('🚨 Error fetching global catalog row matrix:', error.message);
          setProducts([]);
          return;
        }

        // I-map ang nested stores array object patungong flat property para sa product card
        const parsedProducts = (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          stock: item.stock,
          image_url: item.image_url,
          category: item.category,
          store_name: item.stores ? (item.stores as any).name : 'Unknown Shop'
        }));

        setProducts(parsedProducts);

      } catch (err: any) {
        console.error('Critical failure execution on marketplace hub node:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalMarketplaceCatalog();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-32 text-xs text-neutral-400 animate-pulse flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
        <span>Scouting marketplace offers…</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 w-full animate-in fade-in duration-300 px-4 md:px-10 max-w-7xl mx-auto py-10">
      
      {/* Central Marketplace Banner */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-900/90 border border-neutral-800 rounded-3xl p-8 md:p-12 flex flex-col justify-center space-y-4 relative overflow-hidden text-white shadow-xl select-none">
        <div className="absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10 pointer-events-none">
          <Store size={350} strokeWidth={1} />
        </div>
        <span className="block w-12 h-1 rounded-full bg-emerald-400" />
        <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight max-w-xl leading-tight">
          Explore the Central Marketplace
        </h1>
        <p className="text-sm text-white/60 max-w-sm leading-relaxed">
          Discover handpicked items and premium automated services provided directly by verified local independent stores.
        </p>
      </div>

      {/* Main Items Display Matrix */}
      <div className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3 select-none">
          <h3 className="font-semibold text-base text-neutral-800 flex items-center gap-2">
            <ShoppingBag size={15} className="text-neutral-400" strokeWidth={1.75} />
            <span>All Live Items</span>
          </h3>
          <span className="text-xs text-neutral-400">
            {products.length} {products.length === 1 ? 'product' : 'products'} currently on display
          </span>
        </div>

        {products.length === 0 ? (
          <div className="w-full border border-dashed border-neutral-200 rounded-2xl p-12 text-center bg-white text-neutral-400">
            <Package size={32} className="mx-auto text-neutral-200 mb-2 stroke-[1.5]" />
            <span className="block text-sm font-semibold text-neutral-700">Wala pang nakadisplay na paninda</span>
            <p className="text-xs max-w-xs mx-auto mt-0.5 leading-normal">Kasalukuyang walang active products ang kahit sinong seller sa buong platform.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                brandColor="#10b981" // Emerald green branding theme para sa gitnang mall application frame
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
