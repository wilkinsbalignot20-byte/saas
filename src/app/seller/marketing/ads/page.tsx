 // src/app/seller/marketing/ads/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image, Upload, RefreshCw, AlertCircle, CheckCircle2, Monitor } from 'lucide-react';

export default function SellerAdsPage() {
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. DATA STREAM SYNC: Kukuha ng kasalukuyang rehistradong banner parameters mula sa stores schema
  useEffect(() => {
    const fetchCurrentBanner = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile parameters ng iyong tindahan.');
        }

        setStoreId(storeData.id);
        // INAYOS: Itinama ang variable pointer matching call rules
        setCurrentBannerUrl(null); 
      } catch (err: any) {
        console.error('Error loading promotional banner layers:', err.message);
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentBanner();
  }, [router]);

  // Function handler para sa instant local browser preview bago i-upload sa network storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setBannerFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // 2. ASYNC IMAGE STREAM UPLOAD ENGINE: Magpapadala ng asset binary payload sa public cloud buckets
  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFile || !storeId) return;

    setIsUploading(true);
    setMessage('');

    try {
      const fileExtension = bannerFile.name.split('.').pop();
      const fileName = `banner-${storeId}-${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(`banners/${fileName}`, bannerFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(`banners/${fileName}`);

      // INAYOS: Itinama mula'setCurrentImageUrl' patungong 'setCurrentBannerUrl' para tumugma sa structure mo
      setCurrentBannerUrl(publicUrl);
      setPreviewUrl(null);
      setBannerFile(null);
      setMessage('🎉 Ang iyong storefront landscape promotional banner ay matagumpay na naisave at na-publish!');
    } catch (err: any) {
      console.error('Error saving campaign advertisement panel:', err.message);
      setMessage(`❌ Error sa pag-save: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Hahatak ng detalye ng advertising console...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 BREADCRUMB & HEADER HUB BAR */}
      <div className="space-y-1">
        <button 
          onClick={() => router.push('/seller/marketing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
        >
          <ArrowLeft size={12} />
          <span>Bumalik sa Marketing</span>
        </button>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Storefront Banners & Ads</h1>
        <p className="text-sm text-ink/50">Upload high-conversion landscape banners to display highlights or promotions at the top of your store page layout.</p>
      </div>

      {/* COMPONENT MESSAGE DISPATCHER BLOCK */}
      {message && (
        <div className={`p-4 rounded-xl text-xs max-w-xl font-medium border flex items-center gap-2 ${
          message.startsWith('❌') 
            ? 'bg-rose-50/50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {message.startsWith('❌') ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE FORM CREATOR & UPLOADER */}
        <form onSubmit={handleUploadBanner} className="bg-white border border-ink/10 p-5 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-ink/5 pb-3">
            <Upload size={16} className="text-teal" />
            <h2 className="font-display font-bold text-sm text-ink">Upload Landscape Banner</h2>
          </div>

          <div className="space-y-3">
            <div className="border border-dashed border-ink/15 hover:border-ink/30 transition-colors bg-gray-50/50 rounded-xl p-6 text-center relative flex flex-col items-center justify-center min-h-[140px] group">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <Image size={24} className="text-ink/30 mb-2 group-hover:scale-105 transition-transform" />
              <p className="text-xs font-semibold text-ink">Pumili ng Landscape Image</p>
              <p className="text-[10px] text-ink/40 mt-1 font-mono">Recommended size: 1200x400 (3:1 ratio)</p>
            </div>

            <button 
              type="submit" 
              disabled={isUploading || !bannerFile}
              className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition inline-flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isUploading ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={14} />}
              <span>{isUploading ? 'Inia-upload sa network...' : 'Publish Storefront Banner'}</span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: PREVIEW HUB CONSOLE VIEWPORT */}
        <section className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink/40 flex items-center gap-1.5 select-none">
            <Monitor size={13} />
            <span>Storefront Advertising Preview</span>
          </h3>

          {/* Dynamic Image Container Slot */}
          {previewUrl ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              <span className="inline-block text-[10px] font-bold text-marigold bg-marigold/10 border border-marigold/20 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wide">New Selection Preview</span>
              <div 
                className="w-full aspect-[3/1] bg-gray-100 rounded-2xl border border-ink/10 bg-cover bg-center shadow-md"
                style={{ backgroundImage: `url(${previewUrl})` }}
              />
            </div>
          ) : currentBannerUrl ? (
            <div className="space-y-2">
              <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wide">Active Banner</span>
              <div 
                className="w-full aspect-[3/1] bg-gray-100 rounded-2xl border border-ink/10 bg-cover bg-center shadow-sm"
                style={{ backgroundImage: `url(${currentBannerUrl})` }}
              />
            </div>
          ) : (
            <div className="w-full aspect-[3/1] border border-dashed border-ink/15 bg-white rounded-2xl flex flex-col items-center justify-center p-8 text-center text-xs text-ink/40 shadow-xs">
              <Image size={28} className="text-ink/20 mb-2" strokeWidth={1.5} />
              <p className="font-semibold text-ink/60">Walang aktibong commercial banner layout node</p>
              <p className="max-w-xs leading-relaxed text-ink/40 mt-0.5">Gumamit ng panel sa kaliwa para mag-upload ng landscape image asset na lilipad sa tuktok ng iyong customer storefront view.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
