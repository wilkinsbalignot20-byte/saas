import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    campaignName: '9.9 Mega Flash Stream',
    status: 'scheduled',
    discountMultiplier: 0.15,
    startsAt: '2026-09-09T00:00:00Z'
  });
}
