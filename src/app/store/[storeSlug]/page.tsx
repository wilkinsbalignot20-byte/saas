 // src/app/store/[storeSlug]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { ShoppingBag, Package } from 'lucide-react';
import ProductCard from './ProductCard'; 
import { supabase } from '../../../lib/supabase'; // 🟢 DIREKTANG IMPORT: Browser client para sa ligtas na table execution

interface ProductCatalogItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string | null;
  category?: string;
}

interface StoreProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand_color?: string; 
}

interface StorefrontPageProps {
  params: Promise<{ storeSlug: string }>;
}

export default function CustomerStorefrontPage({ params }: StorefrontPageProps) {
  const resolvedParams = use(params);
  const storeSlug = resolvedParams.storeSlug;

  const [store, setStore] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Default theme color dahil wala pang brand_color column sa stores table mo ngayon
  const activeBrandColor = store?.brand_color || '#111111'; 

  useEffect(() => {
    const fetchStoreCatalogAndProfile = async () => {
      try {
        setLoading(true);

        // 🗄️ DIRECT QUERY 1: Kunin ang Profile ng Store base sa dynamic storeSlug
        const { data: storeData, error: storeError } = await supabase
          .from('stores') 
          .select('id, name, slug, description') // 🟢 INAYOS: Inalis ang brand_color dito para hindi na mag-error ang Supabase
          .eq('slug', storeSlug)
          .single();

        if (storeError || !storeData) {
          console.error('🚨 Error fetching store profile from Supabase matrix:', storeError?.message);
          setStore(null);
          return;
        }

        // Itakda ang nakuha mong record sa profile state ng page
        setStore({
          id: storeData.id,
          name: storeData.name,
          slug: storeData.slug,
          description: storeData.description,
          brand_color: '#111111' // 🟢 FALLBACK MODULE: Default solid black muna ang ibinabato habang wala pang style system
        });

        // 🗄️ DIRECT QUERY 2: Kunin ang mga Products na pagmamay-ari ng store gamit ang nakuha nating storeData.id
        const { data: productsData, error: productsError } = await supabase
          .from('products') // 100% lapat sa ipinakita mong SQL migrations schema table definition
          .select('id, name, price, stock, image_url, category')
          .eq('store_id', storeData.id);

        if (productsError) {
          console.error('🚨 Error fetching products inventory array from Supabase:', productsError.message);
          setProducts([]);
        } else {
          setProducts(productsData || []);
        }

      } catch (err: any) {
        console.error('Error rendering customer catalog pipeline:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (storeSlug) {
      fetchStoreCatalogAndProfile();
    }
  }, [storeSlug]);

  if (loading) {
    return (
      <div className="text-center py-32 text-xs text-ink/40 animate-pulse flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-ink/15 border-t-ink rounded-full animate-spin" />
        <span>Loading store…</span>
      </div>
    );
  }

  if (!store) return notFound();

  return (
    <div className="space-y-10 w-full animate-in fade-in duration-300">
      
      {/* Hero banner ng tindahan */}
      <div className="bg-white border border-ink/10 rounded-3xl p-6 md:p-10 flex flex-col justify-center space-y-4 relative overflow-hidden">
        <span className="block w-10 h-1 rounded-full" style={{ backgroundColor: activeBrandColor }} />
        <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight max-w-xl text-ink leading-tight">
          Welcome to {store.name}
        </h1>
        <p className="text-sm text-ink/50 max-w-md leading-relaxed">
          {store.description || "Browse through our updated variation structures. Enjoy secure checkouts and reliable national delivery options."}
        </p>
      </div>

      {/* Catalog ng mga paninda */}
      <div className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-ink/10 pb-3 select-none">
          <h3 className="font-semibold text-base text-ink flex items-center gap-2">
            <ShoppingBag size={15} className="text-ink/40" strokeWidth={1.75} />
            <span>All products</span>
          </h3>
          <span className="text-xs text-ink/40">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {products.length === 0 ? (
          /* Kapag walang paninda si seller */
          <div className="w-full border border-dashed border-ink/15 rounded-2xl p-12 text-center bg-white text-ink/40">
            <Package size={32} className="mx-auto text-ink/20 mb-2 stroke-[1.5]" />
            <span className="block text-sm font-semibold text-ink/70">Walang paninda sa kasalukuyan</span>
            <p className="text-xs max-w-xs mx-auto mt-0.5 leading-normal">Ang tindahan na ito ay wala pang naka-list na items sa kanyang catalog.</p>
          </div>
        ) : (
          /* Grid listahan ng mga paninda */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                brandColor={activeBrandColor} 
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
