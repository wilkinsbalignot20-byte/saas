// src/app/api/stores/[storeSlug]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * 🚀 CENTRAL TENANT API ENGINE
 * Ang nag-iisang file na ito ang sasagot sa lahat ng request ng customer storefront
 * gamit ang URL parameters (?type=products, ?type=orders, etc.)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  const resolvedParams = await params;
  const slug = resolvedParams.storeSlug;

  // Kunin ang 'type' mula sa URL query string (halimbawa: ?type=products)
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  // 1. Hanapin muna ang store gamit ang slug nito
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();

  if (storeError || !store) {
    return NextResponse.json({ error: 'Store configuration path not found.' }, { status: 404 });
  }

  // 2. SWITCH SYSTEM: Dito natin sinasala kung ano ang hinihingi ng frontend
  switch (type) {
    case 'products':
      // API counterpart ng: stores/[storeSlug]/products/route.ts
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id);
      return NextResponse.json(products || []);

    case 'orders':
      // API counterpart ng: stores/[storeSlug]/orders/route.ts
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', store.id);
      return NextResponse.json(orders || []);

    case 'billing':
      // API counterpart ng: stores/[storeSlug]/billing/route.ts
      return NextResponse.json({ plan: 'Premium Scale Node', status: 'paid', amountDue: 0.00 });

    default:
      // Kapag walang query parameter (halimbawa: /api/stores/milktea-zone), ibalik ang basic store profile
      return NextResponse.json(store);
  }
}
