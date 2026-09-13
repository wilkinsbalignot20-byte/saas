 'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
// SELYADO: Malinis na imports ng core visual anchors para sa setting configuration
import { Store, Save, RefreshCw, AlertCircle, CheckCircle2, Globe, ShieldAlert } from 'lucide-react';

export default function SellerSettingPage() {
  const router = useRouter();

  // Core Identity & Meta Configuration Form States
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  
  // Social Integration Link Pointers
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  // Profile Logo Media Asset Trackers
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [newLogoFile, setNewImageFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // 1. SYSTEM INITIALIZATION DATA STREAM: Hahatakin ang active store row matching profiles
  useEffect(() => {
    const fetchStoreIdentitySetting = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id, name, slug, description, logo_url, social_facebook, social_instagram, is_open')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile records configuration ng iyong tindahan.');
        }

        // I-populate ang states gamit ang totoong database fields records
        setStoreId(storeData.id);
        setStoreName(storeData.name || '');
        setSlug(storeData.slug || '');
        setDescription(storeData.description || '');
        setLogoUrl(storeData.logo_url);
        setFacebook(storeData.social_facebook || '');
        setInstagram(storeData.social_instagram || '');
        setIsOpen(storeData.is_open);

      } catch (err: any) {
        console.error('Error loading storefront dashboard setups:', err.message);
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreIdentitySetting();
  }, [router]);

  // Handler para sa instant graphic component preview bago ihulog sa network storage bucket
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setNewImageFile(selectedFile);
      setLogoPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // 2. LIVE TRANSACTION ACTIONS: Magpapadala ng custom layout identity metrics update sa database rows
  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || isSaving) return;

    setIsSaving(true);
    setMessage('');

    try {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (!cleanSlug) throw new Error('Mangyaring maglagay ng wastong dynamic storefront shop slug handle.');

      let finalLogoUrl = logoUrl;

      // Opsyonal na Merchant Brand Profile Logo Streaming Upload sa Supabase Storage bucket
      if (newLogoFile) {
        const fileExtension = newLogoFile.name.split('.').pop();
        const fileName = `${storeId}-${Date.now()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(`merchant-profiles/${fileName}`, newLogoFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(`merchant-profiles/${fileName}`);

        finalLogoUrl = publicUrl;
      }

      // Isakatuparan ang transaction execution gamit ang saktong database row tracking query
      const { error } = await supabase
        .from('stores')
        .update({
          name: storeName.trim(),
          slug: cleanSlug,
          description: description.trim() || null,
          logo_url: finalLogoUrl,
          social_facebook: facebook.trim() || null,
          social_instagram: instagram.trim() || null,
          is_open: isOpen
        })
        .eq('id', storeId);

      if (error) {
        if (error.code === '23505') throw new Error('Ang sub-domain url o slug handle na ito ay ginagamit na ng ibang tindahan.');
        throw error;
      }

      setLogoUrl(finalLogoUrl);
      setNewImageFile(null);
      setLogoPreviewUrl(null);
      setMessage('🎉 Storefront setting configuration successfully synchronized into database!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error('Error executing merchant identity save loop:', err.message);
      setMessage(`❌ Error sa pag-save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Compiling store identity parameters...</span>
        </div>
      </div>
    );
  }
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <header className="border-b border-ink/5 pb-5">
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink flex items-center gap-2 select-none">
          <Store className="text-teal" size={24} />
          <span>Storefront Management & Setting</span>
        </h1>
        <p className="text-sm text-ink/50 mt-1">Configure your pampublikong domain routing identifiers, identity brand descriptions, and social networking handles.</p>
      </header>

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

      <form onSubmit={handleSaveSetting} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start max-w-5xl">
        
        {/* LEFT COLUMN: IDENTITY TEXT FIELDS INTERFACE CONTROLS */}
        <div className="bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-5 lg:col-span-2">
          
          <div className="flex items-center gap-2 border-b border-ink/5 pb-3 select-none">
            <Globe size={16} className="text-teal" />
            <h2 className="font-display font-bold text-sm text-ink">Core White-label Credentials</h2>
          </div>

          {/* Store Name Title Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Storefront Business Name</label>
            <input 
              type="text" 
              required 
              value={storeName} 
              onChange={(e) => setStoreName(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors font-medium" 
            />
          </div>

          {/* Dynamic URL Routing Slug Handle Block */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Dynamic Store Handle Subdomain URL / Slug</label>
            <div className="relative shadow-sm rounded-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink/30 text-xs font-mono select-none">://manipu.com</div>
              <input 
                type="text" 
                required 
                placeholder="my-shop-name"
                value={slug} 
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl pl-24 pr-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30 transition-colors" 
              />
            </div>
            <p className="text-[10px] text-ink/30 font-mono mt-1 select-none">Bawal ang space, malalaking titik, o special characters maliban sa gitling (-).</p>
          </div>

          {/* Store Bio Description Textarea Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Store Profile Biography Description</label>
            <textarea 
              placeholder="Ibahagi ang maikling kwento o tagline tungkol sa iyong pampublikong tindahan upang mabasa ng mga kustomers..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors resize-none leading-relaxed" 
            />
          </div>

          {/* Operational Shop Status Toggle Controller Switch Box */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-ink/5 mt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-ink block select-none">Storefront Operational Status Mode</span>
              <p className="text-[11px] text-ink/40 leading-tight select-none">Kapag naka-off, pansamantalang isasara ang checkout functions sa iyong domain (Vacation Mode).</p>
            </div>
            <div className="relative flex items-center h-5">
              <input 
                type="checkbox" 
                checked={isOpen} 
                onChange={(e) => setIsOpen(e.target.checked)} 
                className="w-4 h-4 rounded border-ink/15 cursor-pointer appearance-none checked:bg-ink relative checked:after:content-['✓'] checked:after:text-paper checked:after:text-[10px] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:font-bold" 
              />
            </div>
          </div>

          {/* Core Master Action Submitter Button Control */}
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition inline-flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={14} />}
            <span>{isSaving ? 'Inilalagak ang mga pagbabago...' : 'Save Setting Identity'}</span>
          </button>

        </div>

        {/* RIGHT COLUMN: BRANDING MEDIA GRAPHICS MANAGEMENT HUB PANEL */}
        <div className="space-y-6">
          
          {/* Visual Brand Photo Box */}
          <section className="bg-white border border-ink/10 p-5 rounded-2xl shadow-sm space-y-4">
            <span className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide select-none">Store Brand Identity Logo</span>
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50/50 border border-dashed border-ink/10 rounded-xl relative group">
              {logoPreviewUrl ? (
                <div className="w-20 h-20 rounded-full border border-ink/15 bg-white bg-cover bg-center shadow-md animate-in zoom-in-95" style={{ backgroundImage: `url(${logoPreviewUrl})` }} />
              ) : logoUrl ? (
                <div className="w-20 h-20 rounded-full border border-ink/15 bg-white bg-cover bg-center shadow-xs" style={{ backgroundImage: `url(${logoUrl})` }} />
              ) : (
                <div className="w-20 h-20 rounded-full bg-ink/5 flex items-center justify-center text-ink/30 border border-ink/5 shadow-inner text-xl select-none">🏪</div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <span className="text-[11px] font-semibold text-ink/70 group-hover:text-ink transition-colors cursor-pointer">Palitan ang profile image file</span>
            </div>
          </section>

          {/* Social Media Network Links Connectivity Card Panel */}
          <section className="bg-white border border-ink/10 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-ink/5 pb-2 select-none">
              <ShieldAlert size={14} className="text-teal" />
              <h3 className="font-display font-bold text-xs text-ink">Social Integrations</h3>
            </div>

            <div className="space-y-4">
              {/* Facebook handle link */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-ink/40 uppercase tracking-wide flex items-center gap-1 select-none font-sans">
                  🔵 Facebook Profile Link
                </label>
                <input 
                  type="url" 
                  placeholder="https://facebook.com"
                  value={facebook} 
                  onChange={(e) => setFacebook(e.target.value)} 
                  className="w-full bg-gray-50 border border-ink/10 rounded-xl px-3 py-2.5 text-xs text-ink outline-none focus:border-ink/30 transition-colors font-mono" 
                />
              </div>

              {/* Instagram handle link */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-ink/40 uppercase tracking-wide flex items-center gap-1 select-none font-sans">
                  📸 Instagram Username Handle
                </label>
                <input 
                  type="text" 
                  placeholder="@my.brand.shop"
                  value={instagram} 
                  onChange={(e) => setInstagram(e.target.value)} 
                  className="w-full bg-gray-50 border border-ink/10 rounded-xl px-3 py-2.5 text-xs text-ink outline-none focus:border-ink/30 transition-colors font-mono" 
                />
              </div>
            </div>
          </section>

        </div>
      </form>
    </main>
  );
}
