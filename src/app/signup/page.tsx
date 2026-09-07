 // src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STEPS = ['Account', 'Business', 'Store'] as const;

export default function SellerSignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Account Credentials (Step 1)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Business Identity & Courier Configuration (Step 2)
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Single Proprietorship');
  const [contactNumber, setContactNumber] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');

  // Store Configuration & Design Customization (Step 3)
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [themeColor, setThemeColor] = useState('#E8A33D');
  
  // Custom Media Assets & Layout Design Tokens
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Auto-generate safe lowercase URL slug handle habang nagta-type ang user
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setStoreSlug(autoSlug);
  };

  // Form field evaluation guard rules per step matrix
  const isStepValid = () => {
    if (step === 0) return fullName && email && password;
    if (step === 1) return businessName && contactNumber && pickupAddress;
    return storeName && storeSlug;
  };

  const handleNext = () => {
    if (!isStepValid()) {
      setMessage('Please fill in all fields before continuing.');
      return;
    }
    setMessage('');
    setStep((s) => s + 1);
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStepValid()) return;
    setLoading(true);
    setMessage('');

    try {
      // 1. I-verify muna kung existing na ang slug para maiwasan ang duplicate data errors
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

      // 2. Sign up sa Supabase Auth kasama ang user meta data options para malinis ang account profiling
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (authError) throw authError;

      if (authData.user) {
        let uploadedLogoUrl: string | null = null;

        // 3. Opsyonal na Media Engine Asset streaming upload sa cloud bucket storage
        if (logoFile) {
          const fileExtension = logoFile.name.split('.').pop();
          const fileName = `${authData.user.id}-${Date.now()}.${fileExtension}`;
          
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

        // 4. I-insert ang bagong multi-tenant tenant row data sheet inside public configuration schemas
        const { error: storeError } = await supabase.from('stores').insert([
          {
            name: storeName,
            slug: storeSlug,
            theme_color: themeColor,
            status: 'active',
            owner_id: authData.user.id,
            owner_name: fullName,
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
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      // INAYOS: Itinama ang spelling mula _final patungong finally para maalis ang compiler crash
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
          <h2 className="font-display font-bold text-3xl text-ink mb-2">Shop Launched!</h2>
          <p className="text-sm text-ink/60 mb-6 leading-relaxed">
            Your store <span className="font-semibold text-ink">{storeName}</span> has been successfully registered. Your storefront link is live at:
          </p>
          
          <div className="bg-ink/5 p-3 rounded-xl font-mono text-sm text-ink font-medium select-all mb-8">
            https://manipu.com{storeSlug}
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
          <p className="text-sm font-semibold text-marigold-dark mb-2">Step {step + 1} of 3</p>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Welcome to Manipu</h1>
          <p className="text-ink/50 text-sm">Let&apos;s set up your store — it only takes a minute.</p>
        </div>

        {/* Global Pipeline Step Progress Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i <= step ? 'bg-marigold' : 'bg-ink/15'
                }`}
              />
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-ink/15" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSignUp} className="bg-white border border-ink/10 rounded-2xl shadow-sm p-8">
          {message && message !== 'success' && (
            <div className="p-3 bg-coral/10 text-coral rounded-xl text-sm mb-5">{message}</div>
          )}

          {/* STEP 1: MERCHANT USER REGISTRATION CREDENTIALS */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-lg mb-1">Your account</h2>
              <input
                type="text"
                required
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors"
              />
            </div>
          )}

          {/* STEP 2: BUSINESS PROFILE & LOGISTICS DISTRIBUTION INFORMATION */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-lg mb-1">Your business</h2>
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

          {/* STEP 3: CUSTOM TENANT STOREFRONT DESIGN NODES */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-lg mb-1">Your store</h2>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-2">Store Profile</label>
                <input
                  type="text"
                  required
                  placeholder="Store name"
                  value={storeName}
                  onChange={(e) => handleStoreNameChange(e.target.value)}
                  className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors mb-3"
                />
                <div className="relative flex items-center">
                  {/* INAYOS: Ginawang ://manipu.com para sa tamang visual framing overlay */}
                  <span className="absolute left-4 text-sm text-ink/40 select-none">://manipu.com</span>
                  <input
                    type="text"
                    required
                    placeholder="store-slug"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                    className="w-full bg-paper border border-ink/15 rounded-xl pl-[86px] pr-4 py-3 text-sm focus:outline-none focus:border-marigold transition-colors text-marigold-dark font-mono"
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
                      {/* INAYOS: Idinagdag ang pointer-events-none para hindi maharang ang click capture loop */}
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
                      {/* INAYOS: May pointer-events-none na ang parehong sub-spans */}
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
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 border border-ink/15 font-semibold py-3 rounded-xl text-sm hover:border-ink/30 transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
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
                {loading ? 'Setting up your store…' : 'Launch my store'}
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-ink/50 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-ink font-semibold hover:text-marigold-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
