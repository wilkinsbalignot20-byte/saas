 // src/app/onboarding/page.tsx [PART 1 OF 3]
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // 🟢 Inayos: Gumagamit na ng unibersal na path alias shortcut
import { useRouter, useSearchParams } from 'next/navigation';

function SellerOnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Onboarding Active Loader Control Nodes
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Captured Merchant Identity Data Block
  const [ownerName, setOwnerName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // MANDATORY FLUID FIELDS: Business Identity & Logistics Infrastructure Profile
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Single Proprietorship');
  const [contactNumber, setContactNumber] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');

  // MANDATORY FLUID FIELDS: Virtual Storefront Architecture Layout
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // 🚀 REAL-TIME SESSION ENGINE VALIDATOR: Awtomatikong sasalain ang OAuth account metadata details
  useEffect(() => {
    const fetchOAuthData = async () => {
      try {
        // 1. Kumuha ng structural reference name mula sa link parameter passing utilities
        const nameFromUrl = searchParams.get('name');
        if (nameFromUrl) {
          setOwnerName(decodeURIComponent(nameFromUrl));
        }

        // 2. I-verify ang operational core user parameters mula sa Supabase Auth layer upang maiwasan ang deadlock loops
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/login?error=unauthorized');
          return;
        }
        
        setUserId(user.id);

        // Fallback parameter assignment kung blangko ang in-url meta queries
        if (!nameFromUrl) {
          const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          setOwnerName(metadataName);
        }

        // 3. Double-check guard loop: Kung may table deployment record na ang user, ipadala na sa bagong path prefix
        const { data: existingStore } = await supabase
          .from('stores')
          .select('slug')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (existingStore) {
          router.push(`/dashboard/${existingStore.slug}`);
        } else {
          setSessionLoading(false);
        }
      } catch (err) {
        setMessage('Security Handshake Matrix Error.');
        setSessionLoading(false);
      }
    };

    fetchOAuthData();
  }, [searchParams, router]);

  // Clean format lowercase deployment URL engine builder handle
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setStoreSlug(autoSlug);
  };

  // Immediate Client-Side Asset Allocation Viewer Utility
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setLogoFile(selectedFile);
      setLogoPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Evaluation field control verification rule checker
  const isFormValid = () => {
    return businessName && contactNumber && pickupAddress && storeName && storeSlug;
  };
// src/app/onboarding/page.tsx [PART 2 OF 3]

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !userId) {
      setMessage('Please fill in all configuration fields.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      // 1. I-verify muna kung existing na ang store slug para maiwasan ang unique constraint duplicate data errors
      const { data: existingStore, error: slugCheckError } = await supabase
        .from('stores')
        .select('slug')
        .eq('slug', storeSlug)
        .maybeSingle();

      if (slugCheckError) throw slugCheckError;

      if (existingStore) {
        setMessage('❌ Store URL handle/slug is already taken. Please try a different Store Name.');
        setLoading(false);
        return;
      }

      let uploadedLogoUrl: string | null = null;

      // 2. Opsyonal na Media Engine Asset streaming upload sa cloud bucket storage
      if (logoFile) {
        const fileExtension = logoFile.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExtension}`;
        
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Kunin ang permanenteng secure public url endpoint link galing cloud resource node
        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);

        uploadedLogoUrl = publicUrl;
      }

      // 3. I-insert ang bagong merchant profile data base sa stores schema definitions gamit ang monetization pricing structure defaults
      const { error: storeError } = await supabase.from('stores').insert([
        {
          name: storeName,
          slug: storeSlug,
          theme_color: '#E8A33D', 
          status: 'active',
          owner_id: userId,
          owner_name: ownerName || 'Google Merchant', 
          business_name: businessName,
          business_type: businessType,
          contact_number: contactNumber,
          pickup_address: pickupAddress,
          logo_url: uploadedLogoUrl,
          background_preset: 'bg-slate-50', 
        },
      ]);

      if (storeError) throw storeError;
      setMessage('success');
    } catch (error: any) {
      setMessage(`Onboarding Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN RENDER VIEW INTERFACE (RE-ALIGNED TO NEW DASHBOARD ROUTE MATRIX)
  if (message === 'success') {
    return (
      <div className="min-h-screen bg-paper text-ink font-body antialiased flex flex-col justify-center items-center p-6">
        <div className="bg-paper p-8 rounded-2xl shadow-xl max-w-md w-full border border-ink/10 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-ink/5 text-ink text-3xl flex items-center justify-center rounded-full mx-auto mb-6">
            🚀
          </div>
          <h2 className="font-display font-bold text-3xl text-ink mb-2">Setup Complete!</h2>
          <p className="text-sm text-ink/60 mb-6 leading-relaxed">
            Welcome aboard <span className="font-semibold text-ink">{ownerName}</span>! Your store <span className="font-semibold text-ink">{storeName}</span> is now active. Your link is live at:
          </p>
          
          {/* UPDATED PUBLIC PREVIEW EMBEDDED LINK WITH DASHBOARD PREFIX */}
          <div className="bg-ink/5 p-3 rounded-xl font-mono text-sm text-ink font-medium select-all mb-8">
            https://manipu.com{storeSlug}
          </div>

          {/* 🟢 FIXED ROUTER REDIRECTION PATH NODE LINK - Target ang dashboard folder configuration block */}
          <button
            onClick={() => router.push(`/dashboard/${storeSlug}`)}
            className="w-full bg-ink text-paper font-semibold py-3.5 rounded-full text-sm hover:bg-ink/90 transition-colors shadow-lg cursor-pointer"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Interstitial system loader for active secure validation processes
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-ink font-body">
        <div className="text-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-marigold border-t-transparent mx-auto"></div>
          <p className="text-xs font-mono text-ink/40">Verifying session architecture matrix...</p>
        </div>
      </div>
    );
  }
// src/app/onboarding/page.tsx [PART 3 OF 3]

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 font-body antialiased">
      <div className="max-w-md w-full">
        
        {/* Header Branding Panel */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Complete your profile</h1>
          <p className="text-ink/50 text-sm">Hi {ownerName}, let&apos;s finalize your configuration maps to launch your active store space.</p>
        </div>

        <form onSubmit={handleCompleteOnboarding} className="bg-white border border-ink/10 rounded-2xl shadow-sm p-8 space-y-6">
          {message && message !== 'success' && (
            <div className="p-3 bg-coral/10 text-coral rounded-xl text-sm mb-2">{message}</div>
          )}

          {/* BLOCK A: BUSINESS IDENTITY PROFILE */}
          <div className="space-y-4">
            <h2 className="font-display font-semibold text-marigold-dark uppercase tracking-wider text-xs">Section 1: Business Identity</h2>
            
            <input
              type="text"
              required
              placeholder="Registered business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors text-ink/80 cursor-pointer"
              >
                <option value="Single Proprietorship">Single Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Corporation">Corporation</option>
              </select>
              
              <input
                type="tel"
                required
                placeholder="Contact number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
            </div>
            
            <textarea
              required
              placeholder="Pickup address (for J&T, Flash, SPX riders)"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              rows={2}
              className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors resize-none"
            />
          </div>

          {/* BLOCK B: VIRTUAL STOREFRONT ARCHITECTURE */}
          <div className="space-y-4 pt-4 border-t border-ink/5">
            <h2 className="font-display font-semibold text-marigold-dark uppercase tracking-wider text-xs">Section 2: Storefront Deployment</h2>
            
            <input
              type="text"
              required
              placeholder="Store Name (e.g., Manipu Premium Goods)"
              value={storeName}
              onChange={(e) => handleStoreNameChange(e.target.value)}
              className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
            />
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Live URL Handle link</label>
              {/* 🟢 FIXED VISUAL LINK INTERFACE MATRIX PREVIEW WITH DASHBOARD INCLUSION */}
              <div className="relative rounded-xl shadow-xs flex items-center bg-paper border border-ink/15 focus-within:border-marigold transition-colors overflow-hidden">
                <span className="pl-4 pr-1 font-mono text-xs text-ink/30 select-none">://manipu.com</span>
                <input
                  type="text"
                  required
                  readOnly
                  placeholder="auto-generated-slug"
                  value={storeSlug}
                  className="w-full bg-transparent border-none py-3 pr-4 text-sm text-marigold-dark outline-none font-mono"
                />
              </div>
            </div>

            {/* Brand Logo Upload Node (Free Tier Option) */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Store Brand Logo</label>
              <div className="flex items-center gap-4 bg-paper border border-ink/15 rounded-xl p-3">
                <div className="h-12 w-12 rounded-lg bg-ink/5 border border-ink/10 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-ink/30 font-mono">No Logo</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-ink/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-ink file:text-paper file:hover:bg-ink/80 file:cursor-pointer"
                />
              </div>
            </div>
          </div>
          
          {/* Action Submission Deployment Controller */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl mt-4 text-sm hover:bg-ink/90 active:scale-[0.99] disabled:opacity-40 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent"></div>
                <span>Deploying store environment tables...</span>
              </>
            ) : (
              <span>Launch My Store Platform 🚀</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// 🚀 CRITICAL SUSPENSE EXPORT COUPLING PATROL FOR NEXT.JS ROUTER STABILITY
import { Suspense } from 'react';

export default function SellerOnboardingPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center text-ink font-body">
          <div className="text-center space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-marigold border-t-transparent mx-auto"></div>
            <p className="text-xs font-mono text-ink/40">Loading secure onboarding layout map...</p>
          </div>
        </div>
      }
    >
      <SellerOnboardingPageContent />
    </Suspense>
  );
}
