 'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '../../lib/supabase';
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

  // 🚀 REAL-TIME SESSION ENGINE VALIDATOR
  useEffect(() => {
    const fetchOAuthData = async () => {
      try {
        const nameFromUrl = searchParams.get('name');
        if (nameFromUrl) {
          setOwnerName(decodeURIComponent(nameFromUrl));
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/login?error=unauthorized');
          return;
        }
        
        setUserId(user.id);

        if (!nameFromUrl) {
          const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || '';
          setOwnerName(metadataName);
        }

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

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setStoreSlug(autoSlug);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setLogoFile(selectedFile);
      setLogoPreview(URL.createObjectURL(selectedFile));
    }
  };

  const isFormValid = () => {
    return businessName && contactNumber && pickupAddress && storeName && storeSlug;
  };
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid() || !userId) {
      setMessage('Please fill in all configuration fields.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
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

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);

        uploadedLogoUrl = publicUrl;
      }

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
            https://manipu.com{storeSlug}
          </div>

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

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-ink font-body">
        <div className="text-center space-y-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-xs font-mono text-ink/40">Verifying session architecture matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 font-body antialiased">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Complete your profile</h1>
          <p className="text-ink/50 text-sm">Hi {ownerName}, let&apos;s finalize your configuration maps to launch your active store space.</p>
        </div>

        <form onSubmit={handleCompleteOnboarding} className="bg-white border border-ink/10 rounded-2xl shadow-sm p-8 space-y-6">
          {message && message !== 'success' && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-mono mb-2">{message}</div>
          )}

          <div className="space-y-4">
            <h2 className="font-display font-semibold text-indigo-500 uppercase tracking-wider text-xs">Section 1: Business Identity</h2>
            
            <input
              type="text"
              required
              placeholder="Registered business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-ink/80 cursor-pointer"
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
                className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <textarea
              required
              placeholder="Pickup address (for J&T, Flash, SPX riders)"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              rows={2}
              className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-ink/5">
            <h2 className="font-display font-semibold text-indigo-500 uppercase tracking-wider text-xs">Section 2: Storefront Deployment</h2>
            
            <input
              type="text"
              required
              placeholder="Store Name (e.g., Wilkins Premium Goods)"
              value={storeName}
              onChange={(e) => handleStoreNameChange(e.target.value)}
              className="w-full bg-paper border border-ink/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Live URL Handle link</label>
              <div className="relative rounded-xl flex items-center bg-paper border border-ink/15 focus-within:border-indigo-500 transition-colors overflow-hidden">
                <span className="pl-4 pr-1 font-mono text-xs text-ink/30 select-none">://://manipu.com</span>
                <input
                  type="text"
                  required
                  readOnly
                  placeholder="auto-generated-slug"
                  value={storeSlug}
                  className="w-full bg-transparent border-none py-3 pr-4 text-sm text-indigo-500 outline-none font-mono"
                />
              </div>
            </div>

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
          </button> {/* 🟢 FIXED: Idinagdag ang kulang na pansasara ng button tag */}
        </form>
      </div>
    </div>
  );
} // 1. Isinasara ang SellerOnboardingPageContent return block at function matrix

// 2. 🚀 CRITICAL SUSPENSE EXPORT FOR NEXT.JS ROUTER STABILITY
export default function SellerOnboardingPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center text-ink font-body">
          <div className="text-center space-y-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto"></div>
            <p className="text-xs font-mono text-ink/40">Loading secure onboarding layout map...</p>
          </div>
        </div>
      }
    >
      <SellerOnboardingPageContent />
    </Suspense>
  );
}
