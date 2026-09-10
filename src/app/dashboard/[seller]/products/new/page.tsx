 // src/app/dashboard/[seller]/products/new/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Plus, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  
  // Core Metric States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  
  // INAYOS: Idinagdag ang mga nawawalang states para sa kumpletong e-commerce specifications layout
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Validation check para sa mga numeric string metrics
      const productPrice = parseFloat(price);
      const productStock = parseInt(stock, 10);

      if (isNaN(productPrice) || productPrice <= 0) {
        throw new Error('Mangyaring maglagay ng wastong presyo.');
      }
      if (isNaN(productStock) || productStock < 0) {
        throw new Error('Mangyaring maglagay ng wastong dami ng stock.');
      }

      // 2. INAYOS: Ginamit ang getSession parameters para sa matatag na SSR token tracking engine
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Walang nakitang aktibong session. Mangyaring mag-log in muli.');
      }

      // 3. INAYOS: Itinama mula user_id patungong owner_id para makita ang store ID ng merchant
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', session.user.id)
        .maybeSingle();

      if (storeError || !storeData) {
        throw new Error('Hindi mahanap ang profile ng iyong tindahan sa database configuration.');
      }
      let uploadedImageUrl: string | null = null;

      // 4. INAYOS: Opsyonal na Product Photo Streaming Upload sa Supabase Storage
      if (productImageFile) {
        const fileExtension = productImageFile.name.split('.').pop();
        // Gumawa ng natatanging pangalan para sa larawan ng produkto
        const fileName = `${storeData.id}-${Date.now()}.${fileExtension}`;
        
        // Gagamit tayo ng lagayan o bucket; tiyaking may public bucket ka ring magagawa na 'products' kung nais maglagay ng photos
        const { error: uploadError } = await supabase.storage
          .from('logos') // Pwede mong pansamantalang gamitin ang 'logos' bucket o gumawa ng bagong public bucket na 'products'
          .upload(`products/${fileName}`, productImageFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(`products/${fileName}`);
          uploadedImageUrl = publicUrl;
        }
      }

      // 5. INAYOS: I-insert ang bagong produkto kasama ang kumpletong e-commerce structural specifications sheet
      const { error } = await supabase.from('products').insert([
        {
          store_id: storeData.id,
          name: name,
          sku: sku || null,
          brand: brand || null,
          category: category,
          description: description || null,
          price: productPrice,
          stock: productStock,
          image_url: uploadedImageUrl,
        },
      ]);

      if (error) throw error;

      setMessage('🎉 Produkto ay matagumpay na naidagdag sa iyong sariling tindahan!');
      
      // Ibalik ang seller sa listahan ng mga produkto pagkatapos ng 1.5 segundo
      setTimeout(() => {
        router.push('/seller/products');
      }, 1500);

    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 BREADCRUMB & HEADER SECTION */}
      <div className="space-y-1">
        <button 
          onClick={() => router.push('/seller/products')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
        >
          <ArrowLeft size={12} />
          <span>Bumalik sa Products</span>
        </button>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Magdagdag ng Bagong Produkto</h1>
        <p className="text-sm text-ink/50">I-populate ang iyong public e-commerce store sa pamamagitan ng pagsagot sa form sa ibaba.</p>
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

      {/* FORM INTERACTIVE MODULE */}
      <form onSubmit={handleSubmit} className="max-w-xl bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-5">
        
        <div className="flex items-center gap-2 border-b border-ink/5 pb-3">
          {/* INAYOS: Diretsong text-teal Tailwind class utility */}
          <Package className="text-teal" size={18} />
          <h2 className="font-display font-bold text-sm text-ink">General Specifications</h2>
        </div>

        {/* Product Name Title Field */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Pangalan ng Produkto</label>
          <input 
            type="text" 
            required 
            placeholder="Halimbawa: Barako Coffee Beans 250g" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors" 
          />
        </div>

        {/* BAGONG DAGDAG: SKU & Brand Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">SKU / Item Code <span className="text-ink/30 font-normal lowercase">(optional)</span></label>
            <input 
              type="text" 
              placeholder="Halimbawa: BRK-COF-250" 
              value={sku} 
              onChange={(e) => setSku(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors font-mono" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Brand Name <span className="text-ink/30 font-normal lowercase">(optional)</span></label>
            <input 
              type="text" 
              placeholder="Halimbawa: Benguet Highlands" 
              value={brand} 
              onChange={(e) => setBrand(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors" 
            />
          </div>
        </div>

        {/* Pricing, Stock, and Category Row Elements */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Price Metric */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Presyo (₱)</label>
            <div className="relative shadow-sm rounded-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink/40 text-xs font-mono">₱</div>
              <input 
                type="number" 
                step="0.01"
                required 
                placeholder="0.00" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl pl-8 pr-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
              />
            </div>
          </div>

          {/* Stock Volume */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Dami ng Stock</label>
            <input 
              type="number" 
              required 
              placeholder="0" 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
          </div>

          {/* BAGONG DAGDAG: Category Selection dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Kategorya</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors cursor-pointer"
            >
              <option value="General">General</option>
              <option value="Beverages">Beverages</option>
              <option value="Food & Snacks">Food & Snacks</option>
              <option value="Apparel & Fashion">Apparel & Fashion</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>

        </div>

        {/* BAGONG DAGDAG: Optional Product Image Loader input field */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Larawan ng Produkto <span className="text-ink/30 font-normal lowercase">(optional)</span></label>
          <div className="flex items-center gap-3 bg-gray-50 border border-ink/10 rounded-xl p-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setProductImageFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-ink/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-ink file:text-paper file:hover:bg-ink/80 file:cursor-pointer"
            />
          </div>
        </div>

        {/* BAGONG DAGDAG: Product Long Description textarea node */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Deskripsyon ng Produkto <span className="text-ink/30 font-normal lowercase">(optional)</span></label>
          <textarea 
            placeholder="Ibahagi ang kumpletong impormasyon tungkol sa iyong produkto..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={3}
            className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors resize-none" 
          />
        </div>

        {/* Action Publish Submitter Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition inline-flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Inirerehistro sa catalog...</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>I-save at I-publish ang Produkto</span>
            </>
          )}
        </button>

      </form>

    </main>
  );
}
