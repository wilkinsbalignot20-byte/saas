 // src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // 1. DYNAMIC RESPONSE ENGINE INITIALIZATION
  // Gumawa ng iisang permanenteng response instance para sa buong lifecycle ng request
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000';
  const { pathname } = url;

  // 2. SYSTEM ASSETS STATIC BYPASS LAYER
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Runtime Safety Guards para sa mga Supabase Keys
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response; 
  }

  // 3. ASYNC COOKIE SYNC ENGINE (SUPABASE SSR MECHANISM - FIXED)
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // SECURE FIX: I-update ang request at response cookies nang magkasabay 
          // nang hindi sinisira o nire-reset ang NextResponse chain instance.
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 🚀 DIRECT LIVE AUTH CONFIRMATION
  const { data: { user } } = await supabase.auth.getUser();

  // 4. API BACKGROUND CONTROLLERS SECURITY PATROL (UPGRADED GATEWAY)
  if (pathname.startsWith('/api')) {
    // Payagan ang mga pampublikong webhooks (Inngest, Payments, at Auth callbacks)
    const isPublicWebhook = 
      pathname.startsWith('/api/webhook') || 
      pathname.startsWith('/api/inngest') || 
      pathname.startsWith('/api/payments/webhook') ||
      pathname.startsWith('/api/auth/callback');

    if (isPublicWebhook) {
      return response;
    }

    // SECURITY CHECK: Kung ang API ay para sa dashboard/admin actions at walang rehistradong user, HARANGIN AGAD (401)
    if (!user && (pathname.includes('/orders') || pathname.includes('/fulfill') || pathname.includes('/dashboard'))) {
      return NextResponse.json({ error: 'UNAUTHORIZED_API_GATEWAY_BREACH' }, { status: 401 });
    }

    return response;
  }

  // 5. EXTRACT SUBDOMAIN O DYNAMIC SLUG IDENTIFIERS
  let currentSlug = '';
  if (hostname.includes(mainDomain) && hostname !== mainDomain) {
    currentSlug = hostname.replace(`.${mainDomain}`, '');
  }

  // 6. MULTI-TENANT VERIFICATION ENGINE (DATABASE INTERCEPTOR GUARD)
  let userStoreSlug = null;
  let hasCheckedStore = false;

  if (user) {
    try {
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('slug')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!storeError && store && store.slug) {
        userStoreSlug = store.slug;
      }
      hasCheckedStore = true;
    } catch (err) {
      hasCheckedStore = false;
    }
  }

  // 7. PATH SEGMENT EVALUATIONS
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0] || ''; 
  const secondSegment = pathSegments[1] || '';

  // RE-ALIGNMENT FIXED
  const isAuthOrOnboarding =
    pathname === '/onboarding' ||
    pathname === '/login' ||
    pathname === '/signup';

  // 🚀 ABSOLUTE HARD LOCK INTERCEPTOR RULES FOR SYSTEM SAFETY
  if (user && hasCheckedStore) {
    if (!userStoreSlug && !isAuthOrOnboarding) {
      const absoluteOnboardingUrl = new URL('/onboarding', request.url);
      if (user.user_metadata) {
        absoluteOnboardingUrl.searchParams.set(
          'name', 
          encodeURIComponent(user.user_metadata.full_name || user.user_metadata.name || '')
        );
      }
      return NextResponse.redirect(absoluteOnboardingUrl);
    }

    if (userStoreSlug && pathname === '/onboarding') {
      const absoluteDashboardUrl = new URL(`/dashboard/${userStoreSlug}`, request.url);
      return NextResponse.redirect(absoluteDashboardUrl);
    }
  }

  // 8. SECURITY PATH COUPLING PATROL FOR PROTECTED ROUTE CHECKPOINTS
  if (!user && firstSegment === 'dashboard') {
    const absoluteLoginUrl = new URL('/login', request.url);
    return NextResponse.redirect(absoluteLoginUrl);
  }

  // 9. SUBDOMAIN REWRITE ENGINE DYNAMICS (CUSTOMER FRONTSTORE ROUTING)
  if (currentSlug && !['www', 'admin', 'seller'].includes(currentSlug)) {
    url.pathname = `/store/${currentSlug}${pathname}`; 
    return NextResponse.rewrite(url, {
      request: {
        headers: response.headers,
      }
    });
  }

  // 10. MULTI-TENANT CROSS-ACCESS PATROL (ANTI-HAMK CROSS SELLER)
  if (user && userStoreSlug && firstSegment === 'dashboard' && secondSegment) {
    if (secondSegment !== userStoreSlug) {
      const selfDashboardUrl = new URL(`/dashboard/${userStoreSlug}`, request.url);
      return NextResponse.redirect(selfDashboardUrl);
    }
  }

  return response;
}

// 11. MATCHER CONFIGURATIONS CONFIG SCHEMA
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
};
