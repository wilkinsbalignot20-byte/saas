 // src/app/seller/orders/logistics/courier/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * GET METHOD ENDPOINT
 * Trabaho: Hahatakin ang courier preference flags para sa isang saktong tindahan.
 * Ginagamit ito sa checkout storefront upang malaman kung aling delivery options ang ipapakita sa buyer.
 * Trigger link template samples: /seller/orders/logistics/courier?storeId=UUID-HERE
 */
export async function GET(request: Request) {
  try {
    // 1. I-extract ang URL query parameters mula sa transaction request pipeline
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: 'Missing tenant identifier query parameters (storeId).' },
        { status: 400 }
      );
    }

    // 2. DATABASE CONFIGURATION CAPTURE: Hahatakin ang toggle values mula sa cloud records cell
    const { data: storeLogistics, error } = await supabase
      .from('stores')
      .select('courier_jand, courier_flash, courier_lalamove')
      .eq('id', storeId)
      .maybeSingle();

    if (error) throw error;
    if (!storeLogistics) {
      return NextResponse.json(
        { error: 'Store configuration identity not found inside database registry.' },
        { status: 404 }
      );
    }

    // 3. SUCCESS DATA PACKET DELIVERY
    return NextResponse.json({
      success: true,
      logisticsConfiguration: {
        jtExpress: storeLogistics.courier_jand,
        flashExpress: storeLogistics.courier_flash,
        lalamoveInstant: storeLogistics.courier_lalamove
      }
    });

  } catch (err: any) {
    console.error('API Error inside logistics compiler route handler node:', err.message);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}
