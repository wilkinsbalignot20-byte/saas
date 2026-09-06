import { NextResponse } from 'next/server';

export async function GET() {
  const courierIntegrations = [
    { code: 'jnt', name: 'J&T Express Philippines', enabled: true, trackingMode: 'webhook_pull' },
    { code: 'flash', name: 'Flash Express National', enabled: false, trackingMode: 'api_polling' },
    { code: 'lala', name: 'Lalamove Instant Rider', enabled: true, trackingMode: 'on_demand' }
  ];
  return NextResponse.json(courierIntegrations);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, message: `Courier status modified for code: ${body.code}` });
}
