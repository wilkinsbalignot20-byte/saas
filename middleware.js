 // middleware.js [PART 1 OF 3]
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  // 1. DYNAMIC RESPONSE ENGINE INITIALIZATION
  let response = NextResponse.next({
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

  // 3. ASYNC COOKIE SYNC ENGINE (SUPABASE SSR MECHANISM)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // 🚀 DIRECT LIVE AUTH CONFIRMATION ( getUser() Call Is Safe and Stable Verified )
  const { data: { user } } = await supabase.auth.getUser();

  // 4. API BACKGROUND CONTROLLERS BYPASS
  if (pathname.startsWith('/api')) {
    return response;
  }
// middleware.js [PART 2 OF 3]

  // 5. EXTRACT SUBDOMAIN O DYNAMIC SLUG IDENTIFIERS (Binuhat pataas para sa scope integration)
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

  // 🚀 ABSOLUTE HARD LOCK INTERCEPTOR RULES FOR SYSTEM SAFETY:
  if (user && hasCheckedStore) {
    
    // Kung ang authenticated user ay WALANG tindahan sa database, at hindi niya binibisita ang /onboarding,
    // harangin siya gamit ang isang Absolute URL structure at hinding-hindi siya pababayaang makalabas patungong 404 block.
    if (!userStoreSlug && pathname !== '/onboarding') {
      const absoluteOnboardingUrl = new URL('/onboarding', request.url);
      absoluteOnboardingUrl.searchParams.set('name', encodeURIComponent(user.user_metadata?.full_name || user.user_metadata?.name || ''));
      return NextResponse.redirect(absoluteOnboardingUrl);
    }

    // Kung may registered store slug na siya sa database pero tinatangkang pumasok o bumalik sa /onboarding
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
// middleware.js [PART 3 OF 3]

  // 9. SUBDOMAIN REWRITE ENGINE DYNAMICS
  if (currentSlug && !['www', 'admin', 'seller'].includes(currentSlug)) {
    url.pathname = `/${currentSlug}${pathname}`;
    return NextResponse.rewrite(url, {
      request: {
        headers: response.headers,
      }
    });
  }

  // 10. MULTI-TENANT CROSS-ACCESS PATROL (RE-ALIGNED TO NEW DASHBOARD TREE)
  // Kung ang tenant ay nasa loob ng /dashboard/[seller] area, sisiguraduhin natin na hinding-hindi niya masisilip ang ibang handle slug.
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
    /*
     * Match ang lahat ng request paths maliban sa mga sumusunod:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Lahat ng media files na may extensions (svg, png, jpg, jpeg, gif, webp, mp4, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
};
