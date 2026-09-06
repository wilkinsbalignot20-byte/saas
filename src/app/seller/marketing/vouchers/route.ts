import { NextResponse } from 'next/server';

export async function GET() {
  const activePromoVouchers = [
    { id: 'v1', code: 'KAWAN20', type: 'percentage', value: 20, status: 'active' },
    { id: 'v2', code: 'SALAMAT100', type: 'fixed_amount', value: 100, status: 'expired' }
  ];
  return NextResponse.json(activePromoVouchers);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, message: `Voucher code ${body.code} saved node entry.` }, { status: 201 });
}
