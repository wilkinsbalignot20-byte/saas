// src/app/api/payments/webhook/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basahin ang event type packet transaction record codes mula sa gateway server
    const eventType = body?.data?.attributes?.type || 'payment.paid';
    console.log(`[PayMongo Cloud Hook Intercept]: Event type broadcast received: ${eventType}`);

    // Dito mo ilalagay sa susunod ang code para i-update ang order table kapag successful ang bayad
    return NextResponse.json({ 
      acknowledged: true, 
      status: 'webhook_captured',
      timestamp: new Date().toISOString() 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process incoming gateway webhook stream data packet' }, { status: 500 });
  }
}
