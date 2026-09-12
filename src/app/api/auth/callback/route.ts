 import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    // 1. RESOLVE ASYNC COOKIE STORE FOR CURRENT FRAMEWORKS (Next.js 15 Standards Verified)
    const cookieStore = await cookies();
    
    // 2. SUPABASE SERVER CLIENT INITIALIZATION MATRIX
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set({ name, value, ...options })
              );
            } catch {
              // Sumasalo sa middleware mutation block responses
            }
          },
        },
      }
    );

    // 3. EXCHANGE EXPLICIT AUTH CODE FOR AN ACTIVE SECURE SESSION
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError && sessionData?.user) {
      const user = sessionData.user;
      const userId = user.id;

      /* 🔍 DATABASE VALIDATION CHECK NODE
       * Hahanapin natin ang katapat na registered tenant metadata sheet 
       * gamit ang 'slug' base sa iyong orihinal na stores configuration schemas.
       */
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('slug')
        .eq('owner_id', userId)
        .maybeSingle();

      // 🟢 FIXED: Kung walang store record, ipasa ang Google full_name papuntang onboarding via parameters
      if (!store || storeError) {
        const onboardingUrl = new URL('/onboarding', origin);
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        if (fullName) {
          onboardingUrl.searchParams.set('name', encodeURIComponent(fullName));
        }
        return NextResponse.redirect(onboardingUrl.toString());
      }

      /* 🚀 RE-ALIGNED MONETIZATION REDIRECTION LINK TARGET
       * Ididirekta na nito ang active validated merchant doon sa bagong gawa mong 
       * folder parameter path directory layout node: /dashboard/[seller]
       */
      return NextResponse.redirect(`${origin}/dashboard/${store.slug}`);
    }
  } // Isinara ang 'if (code)' block nang tama

  // Global fallback redirection kung walang code parameter o nag-fail ang structural code validations
  return NextResponse.redirect(`${origin}/login?error=oauth_handshake_failed`);
}
