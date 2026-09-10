// src/app/onboarding/profile/page.tsx [PART 1 OF 2]
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingProfileFallbackPage() {
  const router = useRouter();

  // 🚀 AUTOMATIC ROUTING REWRITE NODE
  useEffect(() => {
    // Awtomatikong ibabalik ang user sa main onboarding stream center para doon sagutan ang form
    router.push('/onboarding');
  }, [router]);
// src/app/onboarding/profile/page.tsx [PART 2 OF 2]

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center text-ink font-body antialiased">
      <div className="text-center space-y-2">
        {/* Modern minimal micro-spinner indicator node */}
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-marigold border-t-transparent mx-auto" />
        <p className="text-xs font-mono text-ink/40 tracking-tight">
          Redirecting to dynamic configuration setup workspace...
        </p>
      </div>
    </div>
  );
}
