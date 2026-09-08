 // src/app/api/auth/callback/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    // Gumawa ng paunang response object para sa ligtas na pag-forward ng cookies mamaya
    let response = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Kukunin ang cookies mula sa papasok na HTTP request object ng Next.js
          getAll() {
            return request.cookies.getAll();
          },
          // Isasaksak ang cookies sa parehong request at response headers nang sabay
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set({ name, value, ...options });
            });
          },
        },
      }
    );

    // Ipagpalit ang temporary auth code mula kay Google para maging isang aktibong session cookie
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (!sessionError && sessionData?.user) {
      const verifiedUser = sessionData.user;
      // EXPERT MULTI-TENANT GUARD CHECK: May tindahan na ba ang Google account na ito?
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('slug')
        .eq('owner_id', verifiedUser.id)
        .maybeSingle();

      let targetUrl = `${origin}/seller`;

      // CASE B: Kung WALANG tindahan, ituring na BAGONG SIGNUP at idirekta sa onboarding wizard flow
      if (!storeData || storeError) {
        const rawName = verifiedUser.user_metadata?.full_name || verifiedUser.user_metadata?.name || '';
        targetUrl = `${origin}/onboarding/profile?oauth=true&name=${encodeURIComponent(rawName)}`;
      }

      // Gumawa ng permanenteng redirect response object papunta sa target destination URL
      const redirectResponse = NextResponse.redirect(targetUrl);

      // CRITICAL LOGIC: Kopyahin ang naipong session cookies mula sa request/response proxy ng Supabase
      // at isaksak ito sa redirectResponse headers para tanggapin at i-save ng mismong browser ng user.
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set({
          name: cookie.name,
          value: cookie.value,
          ...cookie,
        });
      });

      return redirectResponse;
    }
  }

  // Fallback fallback mechanism kung may nagka-error o walang auth code na pumasok mula kay Google
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
