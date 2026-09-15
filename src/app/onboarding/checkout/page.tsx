// src/app/onboarding/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { ShieldCheck, Rocket, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function OnboardingCheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboardingState = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // 1. VERIFICATION LAYER: Alamin kung may nagawa nang tindahan ang user na ito
        const { data: store, error } = await supabase
          .from('stores')
          .select('slug, status')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (error || !store) {
          // Kung wala pang nagagawang shop name/slug, ibalik sila sa main onboarding page
          router.push('/onboarding');
          return;
        }

        // Kung active na ang store (nakabayad na dati), i-bypass at itapon agad sa dashboard
        if (store.status === 'active') {
          router.push(`/dashboard/${store.slug}`);
          return;
        }

        setStoreSlug(store.slug);
      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingState();
  }, [router]);

  // 2. ACTIVATION ENGINE: Awtomatikong i-a-activate ang tindahan nang walang bayad (Free Plan Startup)
  const handleActivateFreePlan = async () => {
    if (!storeSlug) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // I-update ang status ng tindahan mula sa database patungong 'active'
      const { error } = await supabase
        .from('stores')
        .update({ status: 'active' })
        .eq('owner_id', session.user.id)
        .eq('slug', storeSlug);

      if (error) throw error;

      // SUCCESS: Diretsong pasok sa bagong gawang Seller Dashboard!
      router.push(`/dashboard/${storeSlug}`);
    } catch (err: any) {
      console.error('Onboarding activation failure:', err.message);
      setErrorMessage(`Hindi ma-activate ang workspace: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink font-body">
        <div className="text-xs font-mono flex items-center gap-2 text-ink/50">
          <RefreshCw size={14} className="animate-spin" />
          <span>Inihahanda ang iyong shop parameters...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 text-ink font-body p-6">
      <div className="max-w-md w-full bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-ink/5 text-ink rounded-full flex items-center justify-center mx-auto">
            <Rocket size={20} />
          </div>
          <h1 className="text-xl font-bold font-display tracking-tight">Activate Your Store Workspace</h1>
          <p className="text-xs text-ink/50 max-w-xs mx-auto">
            Your shop URL <span className="font-mono font-bold text-ink">@{storeSlug}</span> has been locked. Activate your account to open your dashboard.
          </p>
        </div>

        {/* ERROR DISPATCHER */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
            <AlertCircle size={14} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PLAN DETAILS CARD (Gaya ng Lazada/Shopify Free Tier) */}
        <div className="bg-gray-50 border border-ink/5 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center border-b border-ink/5 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/40">Selected Plan</span>
            <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Manipu Free Tier</span>
          </div>
          
          <ul className="text-[11px] text-ink/60 space-y-1.5 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-500" /> Multi-tenant Shopify-style storefront
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-500" /> Integrated custom logistics setup
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-emerald-500" /> Real-time backend matrix analytics
            </li>
          </ul>

          <div className="pt-2 border-t border-ink/5 flex justify-between items-center text-xs">
            <span className="font-semibold text-ink/50">Total Amount Due:</span>
            <span className="font-mono font-bold text-sm text-ink">₱0.00</span>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleActivateFreePlan}
          className="w-full bg-ink text-paper font-semibold py-2.5 px-4 rounded-xl text-xs shadow-xs hover:bg-ink/90 active:scale-95 transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Activating Workspace...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} />
              <span>Launch My Seller Center 🚀</span>
            </>
          )}
        </button>

      </div>
    </main>
  );
}
