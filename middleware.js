 // middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Gagawa ng paunang response object na may dalang request headers
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000';
  const { pathname } = url;

  // 1. SYSTEM ASSETS BYPASS: I-bypass ang mga static files at layout assets
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. SUPABASE SERVER CLIENT ENGINE: Humahawak ng automatic sync ng active tokens sa browser cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // I-set ang cookies sa request para mabasa ng Next.js server components
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          
          // I-reconstruct ang response object para bitbit nito ang pinakabagong session metadata tokens
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          // I-set ang cookies sa response headers para tanggapin at itabi ng web browser ng user
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Awtomatikong pinapagana ang authentication validation check loop mula sa cloud database ng Supabase
  const { data: { session } } = await supabase.auth.getSession();

  // 3. API ROUTES BYPASS: Pasukuin ang mga background core REST API controllers
  if (pathname.startsWith('/api')) {
    return response;
  }

  // 4. SUBDOMAIN EXTRACTION INTERFACE MODULE
  let currentSlug = '';
  if (hostname.includes(mainDomain) && hostname !== mainDomain) {
    currentSlug = hostname.replace(`.${mainDomain}`, '');
  }

  // 5. SUBDOMAIN REWRITE ENGINE DYNAMICS:
  // Kung ang binibisita ay may subdomain (hal. milktea.localhost:3000) at hindi system routes
  if (currentSlug && !['www', 'admin', 'seller'].includes(currentSlug)) {
    url.pathname = `/${currentSlug}${pathname}`;
    return NextResponse.rewrite(url, {
      request: {
        headers: response.headers, // Bitbit pa rin ang verified session headers sa panloob na rewrite
      }
    });
  }

  // 6. PATH-BASED PROTECTION AND CONTROLLER MATRIX (Para sa Localhost Multi-tenant Environment)
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0]; // Nakukuha ang saktong ugat na parameter string tulong ng compiler node

  const centralSaaSPaths = ['admin', 'seller'];

  // SECURITY GUARD ROUTE: Kung ang user ay sumusubok pumasok sa merchant /seller control board nang walang active session token
  if (firstSegment === 'seller' && !session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // PUBLIC CUSTOMER PORTAL PATH GATEWAY: Kung ang binibisita ay hindi super admin o merchant dashboard root structures
  if (firstSegment && !centralSaaSPaths.includes(firstSegment)) {
    // I-render ang isolated customer portal components layer framework compiler node
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
