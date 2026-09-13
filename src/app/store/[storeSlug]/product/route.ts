import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * ⚡ STOREFRONT PRODUCTS API CONTRACT ENGINE
 * Ang file na ito ang awtomatikong magbabalik ng mga paninda ng saktong tindahan
 * na tumutugma sa kasalukuyang [storeSlug] sa URL.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  try {
    // 1. Basagin ang async matrix params wrapper ng Next.js 15 safely
    const resolvedParams = await params;
    const slug = resolvedParams.storeSlug;

    if (!slug) {
      return NextResponse.json({ error: 'Missing tenant store slug identifier.' }, { status: 400 });
    }

    // 2. TRANSACTION LAYER A: Hanapin ang id ng store gamit ang dynamic slug identifier nito
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store credentials configuration path not found.' }, { status: 404 });
    }

    // 3. TRANSACTION LAYER B: Hugutin ang lahat ng hilera ng produkto na nakakandado sa store_id na ito
    // Katugma ng iyong primary fields database rules mapping
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, image_url, category')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (productsError) {
      throw productsError;
    }

    // 4. PIPELINE DISPATCHER: Ibalik ang malinis na JSON data array sa iyong frontend page.tsx
    return NextResponse.json(products || []);

  } catch (err: any) {
    console.error('🚨 Storefront Products API Failure Engine Log:', err.message);
    return NextResponse.json({ error: 'Internal system data compile error.', details: err.message }, { status: 500 });
  }
}
