// src/app/explore/[productSlug]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Store, Package } from 'lucide-react';
import { supabase } from '../../../lib/supabase'; // 🟢 SINKRONISADO: Relative tracking link patungong database controller
import { useCart } from '../../../context/CartContext';

interface ProductDetailItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  image_url: string | null;
  category: string | null;
  store_id: string;
  store_slug: string;
  store_name: string;
}

interface ProductPageProps {
  params: Promise<{ productSlug: string }>;
}

// 🚀 RE-ALIGNMENT FIX: Idinagdag ang opisyal na "export default" React Component para malutas ang Next.js runtime crash log mo
export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const productSlug = resolvedParams.productSlug;
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetailItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductPayloadAndStoreRelation = async () => {
      try {
        setLoading(true);

        // 🗄️ MULTI-TENANT MATRIX QUERY: Hahanapin ang item sa database gamit ang URL slug definition nito
        // Gumagamit ng relational join para makuha rin ang details ng tindahan na nagbebenta nito
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            stock,
            description,
            image_url,
            category,
            store_id,
            stores (
              name,
              slug
            )
          `);

        if (error) {
          console.error('🚨 Error pulling item parameters from Supabase:', error.message);
          return;
        }

        // Dahil walang direct column na slug sa products row mo ngayon,
        // hahanapin natin ang item sa pamamagitan ng pag-convert ng name nito para itugma sa current URL parameter slug
        const matchedProduct = (data || []).find((item: any) => {
          const itemSlug = item.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
          return itemSlug === productSlug;
        });

        if (!matchedProduct) {
          setProduct(null);
          return;
        }

        // I-map ang nahanap na record patungo sa malinis na state contract rules
        setProduct({
          id: matchedProduct.id,
          name: matchedProduct.name,
          price: matchedProduct.price,
          stock: matchedProduct.stock,
          description: matchedProduct.description,
          image_url: matchedProduct.image_url,
          category: matchedProduct.category,
          store_id: matchedProduct.store_id,
          store_name: matchedProduct.stores ? (matchedProduct.stores as any).name : 'Unknown Shop',
          store_slug: matchedProduct.stores ? (matchedProduct.stores as any).slug : 'unknown-shop'
        });

      } catch (err: any) {
        console.error('Critical malfunction on product catalog item renderer:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      fetchProductPayloadAndStoreRelation();
    }
  }, [productSlug]);

  if (loading) {
    return (
      <div className="text-center py-32 text-xs text-neutral-400 animate-pulse flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
        <span>Inspecting product metrics…</span>
      </div>
    );
  }

  if (!product) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Back button and directory control tracker */}
      <button 
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Go Back</span>
      </button>

      {/* Main split display viewport block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white border border-neutral-200 p-6 md:p-8 rounded-3xl shadow-sm">
        
        {/* Photo view matrix layer */}
        <div className="w-full h-80 md:h-[400px] bg-neutral-50 rounded-2xl border border-neutral-200/60 overflow-hidden flex items-center justify-center relative">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Package size={40} className="text-neutral-200" strokeWidth={1.5} />
          )}
        </div>

        {/* Information parameters sheet right panel zone */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* 🟢 THE LAZADA-STYLE STORE BRIDGE NODE: Clickable shop access card wrapper link */}
            <div 
              onClick={() => router.push(`/store/${product.store_slug}`)}
              className="inline-flex items-center gap-2 border border-neutral-200 bg-neutral-50 hover:bg-neutral-100/80 px-3 py-1.5 rounded-full cursor-pointer text-xs font-bold text-neutral-600 transition-colors select-none"
            >
              <Store size={12} className="text-neutral-400" />
              <span>Sold by: {product.store_name}</span>
            </div>

            <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-neutral-900 leading-tight">
              {product.name}
            </h1>

            <p className="text-2xl font-black text-emerald-600">
              ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>

            <div className="border-t border-neutral-200 pt-4 space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">Description</span>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.description || "No unique parameters or specifications sheet provided by the vendor for this product catalog row entry."}
              </p>
            </div>
          </div>

          {/* Lower action transaction button container panel */}
          <div className="border-t border-neutral-200 pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs text-neutral-400 select-none">
              <span>Merchant Stocks Availability</span>
              <span className={product.stock > 0 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>
                {product.stock > 0 ? `${product.stock} items left` : 'Out of stock'}
              </span>
            </div>

            <button 
              type="button"
              onClick={() => addToCart({ id: product.id, name: product.name, price: Number(product.price) })}
              disabled={product.stock <= 0}
              className="w-full text-white bg-neutral-900 hover:bg-neutral-800 text-sm font-semibold py-4 px-6 rounded-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              <span>Add to Shopping Cart</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
