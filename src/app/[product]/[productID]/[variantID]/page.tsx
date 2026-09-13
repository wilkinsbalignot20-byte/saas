 'use client';

export const dynamic = 'force-dynamic'; // 🛡️ LOCKOUT ENGINE: Pinapatay ang link memory trace sa cache memory

// Ginamit ang "use" hook mula sa React para i-unwrap ang async Next.js 15 parameters safely
import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation'; // 🚀 BOUNCER BYPASS: Opisyal na 404 navigation trigger node
import { supabase } from '../../../../lib/supabase'; 
import { Package, RefreshCw } from 'lucide-react';

// Pagkuha ng mga Type contracts na binuo natin sa iyong types element matrix
interface ComponentProductViewData {
  id: string;
  name: string;
  base_price: number;
  description: string | null;
  base_image_url: string | null;
  
  // Active Relational Child Data Properties
  active_variant_name: string | null;
  active_price: number;
  active_stock: number;
  active_sku: string | null;
  active_image_url: string | null;
}

interface ProductVariantDetailPageProps {
  params: Promise<{ product: string; productid: string; variantId: string }>;
}

export default function ProductVariantDetailPage({ params }: ProductVariantDetailPageProps) {
  
  // Basagin ang async Promise wrapper ng Next.js 15 safely
  const resolvedParams = use(params);
  
  const productSlug = resolvedParams.product as string;
  const productid = resolvedParams.productid as string;  
  const variantId = resolvedParams.variantId as string;  

  const [productData, setProductData] = useState<ComponentProductViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchPublicProductDetail = async () => {
      // 🛡️ ULTRA STRIKTONG UUID REGEX PATTERN GUARD LAYER
      // Sinisigurado nito na ang string ay may saktong pattern na xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // SELYADO: Kapag ang productid o variantId ay hindi totoong UUID format (tulad ng 'manipu' o 'setting'),
      // hihinto agad ang frontend at tahimik na magtatapon sa opisyal na 404 page handler.
      if (!productid || !uuidRegex.test(productid) || !variantId || !uuidRegex.test(variantId)) {
        setLoading(false);
        return notFound();
      }

      try {
        setLoading(true);
        setErrorMsg('');

        // 1. Relational Step A: Hugutin ang pangunahing produkto galing sa products table ng database
        const { data: baseProduct, error: productError } = await supabase
          .from('products')
          .select('id, name, price, description, image_url') 
          .eq('id', productid)
          .maybeSingle();

        if (productError) throw productError;
        if (!baseProduct) {
          setLoading(false);
          return notFound();
        }

        // 2. Relational Step B: Kunin ang saktong variation row na tumutugma sa variantId relation
        const { data: activeVariant, error: variantError } = await supabase
          .from('product_variants')
          .select('id, variant_name, price_modifier, stock, sku, image_url')
          .eq('id', variantId)
          .eq('product_id', productid) // Siguraduhing protektado at nakakandado sa magulang nito
          .maybeSingle();

        if (variantError) throw variantError;
        if (!activeVariant) {
          setLoading(false);
          return notFound(); // 404 kung peke o hindi pag-aari ng produktong ito ang variantId token
        }

        // 3. TRANSACTION MAPPING DYNAMICS: Pagsasamahin ang parent at child columns
        const computedPrice = Number(baseProduct.price) + Number(activeVariant.price_modifier);

        setProductData({
          id: baseProduct.id,
          name: baseProduct.name,
          base_price: Number(baseProduct.price),
          description: baseProduct.description,
          base_image_url: baseProduct.image_url,
          
          active_variant_name: activeVariant.variant_name,
          active_price: computedPrice,
          active_stock: activeVariant.stock,
          active_sku: activeVariant.sku,
          active_image_url: activeVariant.image_url || baseProduct.image_url
        });

      } catch (err: any) {
        console.error('Public View Extraction Issue:', err.message);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProductDetail();
  }, [productid, variantId]); // Naka-lock sa dual param validation tracking anchors

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-xs text-ink/50 space-y-3 font-mono">
        <RefreshCw size={20} className="animate-spin text-ink/40" />
        <span>Hahatak ng variant metadata metrics network stream...</span>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 font-body antialiased">
      <div className="max-w-md w-full border border-ink/10 rounded-2xl bg-white p-6 md:p-8 shadow-sm text-center space-y-5">
        
        {/* 📸 DYNAMIC IMAGE FRAME: Variant Photo ang lalabas, kung wala ay gagamitin ang Base Product Photo */}
        <div className="w-full aspect-video rounded-xl bg-gray-50 border border-ink/5 overflow-hidden flex items-center justify-center relative shadow-xs">
          {productData?.active_image_url ? (
            <img 
              src={productData.active_image_url} 
              alt={productData.name || "Product Variant Storefront Detail View"} 
              className="w-full h-full object-cover animate-in fade-in duration-300"
              onError={(e) => {
                // Fallback icon pattern handler mechanism kung sakaling ma-unreachable ang database media cloud buckets
                (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21.88a2 2 0 0 0 2 0l8-4.66a2 2 0 0 0 1-1.73l-.03-9.45a2 2 0 0 0-1.03-1.74L13 2.2a2 2 0 0 0-2 0L3.03 6.3a2 2 0 0 0-1 1.73l.03 9.45a2 2 0 0 0 1.03 1.74z"/><path d="M12 22V12"/><path d="M12 12 4.05 7.5"/><path d="m12 12 7.95-4.5"/></svg>';
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-ink/20">
              <Package size={32} strokeWidth={1.5} />
              <span className="text-[10px] font-mono tracking-wider uppercase font-semibold">No Asset File</span>
            </div>
          )}
        </div>

        {/* Product Information Header Titles Matrix */}
        <div className="space-y-1">
          <h1 className="font-display font-bold text-lg md:text-xl tracking-tight text-ink leading-tight">
            {errorMsg ? "Data Extraction Error" : (productData?.name || "Product Node")}
          </h1>
          
          {/* Tagline / Indicator para sa Piniling Variant Component */}
          {productData?.active_variant_name && (
            <p className="text-xs text-ink/40 font-medium">
              Variation: <span className="text-ink font-semibold">{productData.active_variant_name}</span>
            </p>
          )}

          {/* ₱ Kalkuladong Presyo base sa Modifier */}
          {productData?.active_price !== undefined && (
            <p className="text-teal font-mono font-bold text-base pt-1">
              ₱{Number(productData.active_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          )}

          <p className="text-[10px] text-ink/40 font-mono tracking-tight pt-2">
            URL Allocation Track: /{productSlug}/{productid}/{variantId}
          </p>
        </div>

        {/* Product Long Description Preview Block */}
        {productData?.description && (
          <p className="text-xs text-ink/60 border-t border-ink/5 pt-3 text-left leading-relaxed max-h-24 overflow-y-auto font-sans">
            {productData.description}
          </p>
        )}

        {/* 📊 SYSTEM CORE PIPELINE MONITORING LOGS */}
        <div className="p-4 bg-paper border border-ink/5 rounded-xl text-left text-xs space-y-2 font-mono text-ink/60 border-t-2 border-t-teal/40">
          <p className="flex justify-between items-center">
            <span>• Inventory Stock Status:</span> 
            {productData && productData.active_stock > 0 ? (
              <span className="text-emerald-700 font-bold uppercase text-[9px] tracking-wide bg-emerald-50 px-2 py-0.5 rounded-md">
                In Stock ({productData.active_stock} units)
              </span>
            ) : (
              <span className="text-rose-700 font-bold uppercase text-[9px] tracking-wide bg-rose-50 px-2 py-0.5 rounded-md">
                Out of Stock
              </span>
            )}
          </p>
          
          <p className="flex justify-between items-center">
            <span>• Relational Integrity Check:</span> 
            <span className="text-teal font-bold uppercase text-[9px] tracking-wide bg-teal-50 px-2 py-0.5 rounded-md">
              Valid Variant Map
            </span>
          </p>
          
          <p className="flex justify-between items-center border-t border-ink/5 pt-1.5 mt-1">
            <span>• Active Variant Token ID:</span> 
            <span className="text-ink font-bold uppercase text-[9px] bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[180px]">
              {variantId}
            </span>
          </p>

          {productData?.active_sku && (
            <p className="flex justify-between border-t border-ink/5 pt-1.5 font-sans">
              <span className="font-mono text-xs">• Variant SKU Link:</span> 
              <span className="font-semibold text-ink/80 text-xs font-mono">{productData.active_sku}</span>
            </p>
          )}

          {errorMsg && (
            <div className="text-rose-700 font-semibold bg-rose-50/50 border border-rose-100 p-2.5 rounded-xl text-[10px] mt-1 space-y-1">
              <p className="font-bold">⚠️ Diagnostic Shield Log:</p>
              <p className="font-normal text-rose-600/90 leading-relaxed">{errorMsg}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
