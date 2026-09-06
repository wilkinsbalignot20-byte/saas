 // middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000';
  const { pathname } = url;

  // 1. I-bypass ang mga system files at assets at central server APIs
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/static') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Tiyakin ang subdomain configuration check rules
  let currentSlug = '';
  if (hostname.includes(mainDomain) && hostname !== mainDomain) {
    currentSlug = hostname.replace(`.${mainDomain}`, '');
  }

  // 3. SUBDOMAIN ROUTING INTERFACE:
  if (currentSlug && !['www', 'admin', 'seller'].includes(currentSlug)) {
    url.pathname = `/${currentSlug}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 4. PATH-BASED ROUTING (Para sa Localhost Directory Testing Loop)
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  // Listahan ng mga ugat na eksklusibo lamang para sa Main SaaS Portal Core Network
  const centralSaaSPaths = ['admin', 'seller'];

  // Kung ang binibisita ay HINDI admin o seller, at may higit sa isang segment (hal. /milktea-zone/signup)
  if (firstSegment && !centralSaaSPaths.includes(firstSegment)) {
    // Hayaan lang ang Next.js na ipasok ang request sa app/[storeSlug]/ dynamic route channels framework compiler node
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
