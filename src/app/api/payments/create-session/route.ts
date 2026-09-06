// src/app/api/payments/create-session/route.ts
import { NextResponse } from 'next/server';
import { createGatewayCheckoutSession } from '../../../../lib/payment';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verification check kung may dalang total bill amount ang checkout event
    if (!body?.amount) {
      return NextResponse.json(
        { error: 'Missing payment amount parameter inside checkout data packets.' },
        { status: 400 }
      );
    }

    // Tawagan ang core payment gateway constructor helper file node
    const paymentSession = await createGatewayCheckoutSession({
      amount: body.amount,
      currency: 'PHP',
      description: body.description || 'Storefront Customer Order checkout payment logs',
      storeId: body.storeId || 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d'
    });

    return NextResponse.json(paymentSession, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown payment gateway runtime error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
