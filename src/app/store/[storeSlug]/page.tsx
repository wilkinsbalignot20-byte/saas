 // src/app/store/[storeSlug]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import { ShoppingBag, Package } from 'lucide-react';
import ProductCard from './ProductCard'; // 🟢 SINKRONISADO: Tinawag ang kasama nitong ProductCard component sa folder

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
  brand_color?: string; // Opsyonal na branding identity parameter color hex
}

interface StorefrontPageProps {
  params: Promise<{ storeSlug: string }>;
}

export default function CustomerStorefrontPage({ params }: StorefrontPageProps) {
  // Basagin ang Next.js 15 async parameters wrapper safely gamit ang React.use()
  const resolvedParams = use(params);
  const storeSlug = resolvedParams.storeSlug;

  const [store, setStore] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Default color parameter kung sakaling walang brand_color column ang database row mo ngayon
  const activeBrandColor = store?.brand_color || '#111111'; 

  useEffect(() => {
    const fetchStoreCatalogAndProfile = async () => {
      try {
        setLoading(true);

        // 🟢 METHOD EXTROLLER CONNECT: Tinatawag ang saktong folder path ng iyong products API route!
        // Inalis ang tawag sa multong /api/stores/ para maiwasan ang HTML token parsing crash logs.
        const productsRes = await fetch(`/store/${storeSlug}/product`);
        
        // 🛡️ DIAGNOSTIC SHIELD: Humarang laban sa HTML syntax errors bago mag-crash ang JSON parser
        if (!productsRes.ok) {
          console.error(`🚨 Storefront Products Route Error: Status ${productsRes.status}`);
          const rawHtmlText = await productsRes.text(); // Basahin muna bilang plain text/HTML para mahuli ang glitch
          console.log("HTML response leaked instead of JSON matrix:", rawHtmlText.substring(0, 150));
          return notFound(); // Kusa at tahimik na mag-404 sa screen sa halip na i-crash ang JavaScript console ng browser
        }

        const productsData = await productsRes.json();
        
        // 📊 RELATIONAL PARSING LAYER:
        // Dahil ang `/store/[storeSlug]/product/route.ts` mo ang API endpoint na konektado sa database,
        // itatalaga natin ang dynamic list ng products at sync data layout properties dito.
        setProducts(productsData || []);
        
        // Dynamic profile mapping switcher fallback module
        setStore({
          id: '1',
          name: storeSlug.toUpperCase(),
          slug: storeSlug,
          description: "Browse through our updated storefront variation structures. Enjoy secure checkouts and reliable national delivery options."
        });

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
      
      {/* Hero banner */}
      <div className="bg-white border border-ink/10 rounded-3xl p-6 md:p-10 flex flex-col justify-center space-y-4 relative overflow-hidden">
        <span className="block w-10 h-1 rounded-full" style={{ backgroundColor: activeBrandColor }} />
        <h1 className="font-display font-black text-3xl md:text-5xl tracking-tight max-w-xl text-ink leading-tight">
          Welcome to {store.name}
        </h1>
        <p className="text-sm text-ink/50 max-w-md leading-relaxed">
          {store.description || "Browse through our updated variation structures. Enjoy secure checkouts and reliable national delivery options."}
        </p>
      </div>

      {/* Catalog section */}
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
          /* Empty catalog state */
          <div className="w-full border border-dashed border-ink/15 rounded-2xl p-12 text-center bg-white text-ink/40">
            <Package size={32} className="mx-auto text-ink/20 mb-2 stroke-[1.5]" />
            <span className="block text-sm font-semibold text-ink/70">Walang paninda sa kasalukuyan</span>
            <p className="text-xs max-w-xs mx-auto mt-0.5 leading-normal">Ang tindahan na ito ay wala pang naka-list na items sa kanyang catalog.</p>
          </div>
        ) : (
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