import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ activeCampaignsCount: 0, platformCreditBalance: 0.00 });
}
