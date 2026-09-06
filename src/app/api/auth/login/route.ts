import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Basic inputs check criteria
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Mangyaring ilagay ang iyong email at password.' },
        { status: 400 }
      );
    }

    // 2. Patakbuhin ang password verification sa Supabase Auth engine node
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Maling email o password. Mangyaring subukan muli.' },
        { status: 401 }
      );
    }

    const verifiedUser = authData.user;

    // 3. SECURE CHECK: Tiyakin na ang user na ito ay isang rehistradong merchant sa iyong 'stores' table
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('slug, is_active')
      .eq('user_id', verifiedUser.id)
      .single();

    if (storeError || !storeData) {
      return NextResponse.json(
        { error: 'Ang account na ito ay hindi rehistrado bilang merchant sa aming platform database.' },
        { status: 403 }
      );
    }

    if (!storeData.is_active) {
      return NextResponse.json(
        { error: 'Ang iyong tindahan ay kasalukuyang suspendido. Mangyaring kontakin ang admin.' },
        { status: 403 }
      );
    }

    // 4. Matagumpay na login configuration deployment validation tokens payload setup
    return NextResponse.json(
      { 
        success: true, 
        message: '🎉 Maligayang pagbabalik! Matagumpay ang iyong pag-verify.',
        storeSlug: storeData.slug,
        userId: verifiedUser.id
      },
      { status: 200 }
    );

  } catch (err: any) {
    console.error('Unexpected error during merchant authentication lifecycle:', err);
    return NextResponse.json(
      { error: 'Nagkaroon ng hindi inaasahang error sa aming server matrix processing.' },
      { status: 500 }
    );
  }
}
