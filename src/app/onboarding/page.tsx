// src/app/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Onboarding Setup Status Flow Nodes
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Business, Step 2: Store Design

  // Captured Merchant Identity Data Block
  const [ownerName, setOwnerName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // STEP 1 FIELDS: Business Profile & Courier Distribution Setup
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Single Proprietorship');
  const [contactNumber, setContactNumber] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');

  // STEP 2 FIELDS: Store Theme Configuration & Design Customization
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [themeColor, setThemeColor] = useState('#E8A33D');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundPreset, setBackgroundPreset] = useState('bg-slate-50');

  const THEME_PRESETS = [
    { label: 'Marigold', value: '#E8A33D' },
    { label: 'Teal', value: '#1B6F5F' },
    { label: 'Coral', value: '#C1443B' },
    { label: 'Ink', value: '#14171F' },
  ];

  const BACKGROUND_PRESETS = [
    { label: 'Soft Slate', value: 'bg-slate-50', preview: '#f8fafc' },
    { label: 'Warm Sand', value: 'bg-orange-50/40', preview: '#fffbf7' },
    { label: 'Mint Cream', value: 'bg-emerald-50/30', preview: '#f7fdfa' },
    { label: 'Zinc Minimal', value: 'bg-zinc-100/50', preview: '#f4f4f5' },
  ];

  // Awtomatikong kukunin ang active session at ang pangalan na galing kay Google
  useEffect(() => {
    const fetchOAuthData = async () => {
      // 1. Pipitasin ang pinasang pangalan mula sa Google metadata sa URL query parameters
      const nameFromUrl = searchParams.get('name');
      if (nameFromUrl) {
        setOwnerName(decodeURIComponent(nameFromUrl));
      }

      // 2. I-verify ang active Supabase Auth engine session para masigurong ligtas
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/login?error=unauthorized');
        return;
      }
      
      setUserId(user.id);

      // Kung walang pangalan sa URL, gamitin ang fallback mula sa real-time session metadata
      if (!nameFromUrl) {
        const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        setOwnerName(metadataName);
      }
    };

    fetchOAuthData();
  }, [searchParams, router]);

  // Auto-generate safe lowercase URL slug handle habang nagta-type ang user
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setStoreSlug(autoSlug);
  };
  // Validation guard rules para sa bawat dynamic onboarding step matrix
  const isStepValid = () => {
    if (currentStep === 1) return businessName && contactNumber && pickupAddress;
    return storeName && storeSlug;
  };

  const handleNextStep = () => {
    if (!isStepValid()) {
      setMessage('Please fill in all active fields before proceeding.');
      return;
    }
    setMessage('');
    setCurrentStep(2);
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid() || !userId) return;
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

      // 3. I-insert ang bagong merchant profile data base sa stores schema definitions
      const { error: storeError } = await supabase.from('stores').insert([
        {
          name: storeName,
          slug: storeSlug,
          theme_color: themeColor,
          status: 'active',
          owner_id: userId,
          owner_name: ownerName || 'Google Merchant', // Fallback value kung walang pangalang nakuha
          business_name: businessName,
          business_type: businessType,
          contact_number: contactNumber,
          pickup_address: pickupAddress,
          logo_url: uploadedLogoUrl,
          background_preset: backgroundPreset,
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
  // SUCCESS SCREEN RENDER VIEW INTERFACE
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
          
          <div className="bg-ink/5 p-3 rounded-xl font-mono text-sm text-ink font-medium select-all mb-8">
            ://manipu.com{storeSlug}
          </div>

          <button
            onClick={() => router.push('/seller')}
            className="w-full bg-ink text-paper font-semibold py-3.5 rounded-full text-sm hover:bg-ink/90 transition-colors shadow-lg cursor-pointer"
          >
            Go to Seller Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 font-body">
      <div className="max-w-md w-full">
        {/* Header Branding Panel */}
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-marigold-dark mb-2">Step {currentStep} of 2</p>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Complete your profile</h1>
          <p className="text-ink/50 text-sm">Hi {ownerName}, let&apos;s finalize your store layout settings.</p>
        </div>

        {/* Global Pipeline Step Progress Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((stepNum) => (
            <div key={stepNum} className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  stepNum <= currentStep ? 'bg-marigold' : 'bg-ink/15'
                }`}
              />
              {stepNum === 1 && <div className="w-6 h-px bg-ink/15" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleCompleteOnboarding} className="bg-white border border-ink/10 rounded-2xl shadow-sm p-8">
          {message && message !== 'success' && (
            <div className="p-3 bg-coral/10 text-coral rounded-xl text-sm mb-5">{message}</div>
          )}

          {/* STEP 1: BUSINESS PROFILE & LOGISTICS DISTRIBUTION INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-lg mb-1">Your business details</h2>
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
                  className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors text-ink/80"
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
          )}

          {/* STEP 2: STORE CONFIGURATION & DESIGN CUSTOMIZATION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-lg mb-1">Your store configuration</h2>
              <input
                type="text"
                required
                placeholder="Store Name"
                value={storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
              
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Store URL handle</label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-mono text-xs text-ink/30 rounded-l-xl select-none">
                    ://manipu.com
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="my-shop"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                    className="w-full bg-paper border border-ink/15 rounded-xl pl-[105px] pr-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors text-marigold-dark font-mono"
                  />
                </div>
              </div>

              {/* Secure Media Stream Upload Block */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-2">
                  Store Logo <span className="text-ink/30 font-normal lowercase">(optional)</span>
                </label>
                <div className="flex items-center gap-3 bg-paper border border-ink/15 rounded-xl p-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setLogoFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs text-ink/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-ink file:text-paper file:hover:bg-ink/80 file:cursor-pointer"
                  />
                </div>
              </div>

              {/* Unified Theme Identity Matrix Grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-2">Theme Identity</label>
                <div className="flex flex-wrap gap-2">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setThemeColor(preset.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        themeColor === preset.value
                          ? 'border-ink bg-ink/5 font-semibold'
                          : 'border-ink/15 hover:border-ink/30'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shadow-inner pointer-events-none" style={{ backgroundColor: preset.value }} />
                      <span className="pointer-events-none">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Store Background Configuration Selection Cluster */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-2">Store Canvas Background</label>
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUND_PRESETS.map((bg) => (
                    <button
                      key={bg.value}
                      type="button"
                      onClick={() => setBackgroundPreset(bg.value)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        backgroundPreset === bg.value
                          ? 'border-ink bg-ink/5 ring-1 ring-ink font-semibold'
                          : 'border-ink/15 bg-white hover:border-ink/30'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md border border-ink/10 shadow-sm pointer-events-none" style={{ backgroundColor: bg.preview }} />
                      <span className="truncate pointer-events-none">{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Layout Navigation Operational Controllers */}
          <div className="flex items-center gap-3 mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 border border-ink/15 font-semibold py-3 rounded-xl text-sm hover:border-ink/30 transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 bg-ink text-paper font-semibold py-3 rounded-xl text-sm hover:bg-ink/90 transition-colors cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-ink text-paper font-semibold py-3 rounded-xl text-sm hover:bg-ink/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Launching your store…' : 'Launch my store'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}