 'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface EditProductPageProps {
  params: Promise<{ seller: string; productId: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter();
  const routeParams = useParams();
  
  // Unwrap dynamic routing identification parameter keys safely
  const resolvedParams = use(params);
  const productId = resolvedParams.productId;
  
  // Dynamic seller parameter node (hal. manipu) mula sa router URL
  const seller = resolvedParams.seller || (routeParams?.seller as string);

  // Form Field Evaluation States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  
  // Media Asset Management States
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  // 🟢 BAGONG DAGDAG: State trackers para sa dynamic database categories alignment
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // 🟢 BAGONG DAGDAG: Kusa nitong hahatakin ang mga totoong categories ni tenant tuwing bubuksan ang edit page
  useEffect(() => {
    const fetchActiveCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: storeData } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (!storeData) return;

        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('store_id', storeData.id)
          .order('name', { ascending: true });

        if (error) throw error;
        setDbCategories(data || []);
      } catch (err: any) {
        console.error('Error loading product edit categories loop:', err.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (seller) fetchActiveCategories();
  }, [seller]);

  // 1. DATA STREAM INTEGRATION: Hahatakin ang kasalukuyang active details ng produkto mula sa database
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          throw new Error('Hindi nahanap ang produktong ito sa database catalog.');
        }

        // I-populate ang states gamit ang totoong records
        setName(data.name);
        setPrice(data.price.toString());
        setStock(data.stock.toString());
        setSku(data.sku || '');
        setBrand(data.brand || '');
        setCategory(data.category || 'General'); // Kung anong slug ang nakasave sa product, ito ang magiging default choice
        setDescription(data.description || '');
        setCurrentImageUrl(data.image_url);

      } catch (err: any) {
        console.error('Error extracting configuration product node:', err.message);
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProductDetails();
  }, [productId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const productPrice = parseFloat(price);
      const productStock = parseInt(stock, 10);

      if (isNaN(productPrice) || productPrice <= 0) throw new Error('Mangyaring maglagay ng wastong presyo.');
      if (isNaN(productStock) || productStock < 0) throw new Error('Mangyaring maglagay ng wastong dami ng stock.');

      let finalImageUrl = currentImageUrl;

      if (newImageFile) {
        const fileExtension = newImageFile.name.split('.').pop();
        const fileName = `${productId}-${Date.now()}.${fileExtension}`;
        
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(`products/${fileName}`, newImageFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(`products/${fileName}`);
        
        finalImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          sku: sku.trim() || null,
          brand: brand.trim() || null,
          category: category, // Kakainin nito kung anong slug ang aktibong binago sa dynamic choice mapping
          description: description.trim() || null,
          price: productPrice,
          stock: productStock,
          image_url: finalImageUrl,
        })
        .eq('id', productId);

      if (error) throw error;

      setMessage('🎉 Ang produkto ay matagumpay na na-update!');
      
      setTimeout(() => {
        router.push(`/dashboard/${seller}/product`);
      }, 1500);

    } catch (err: any) {
      console.error('Error executing database update sequence:', err.message);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse text-sm font-medium text-ink/50 flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <span>Hahatak ng detalye ng produkto...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* 🧭 BREADCRUMB & HEADER SECTION */}
      <div className="space-y-1">
        <button 
          onClick={() => router.push(`/dashboard/${seller}/product`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2 cursor-pointer"
        >
          <ArrowLeft size={12} />
          <span>Bumalik sa Products</span>
        </button>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">I-edit ang Produkto</h1>
        <p className="text-sm text-ink/50">Baguhin o i-update ang mga kasalukuyang detalye ng aitem sa iyong multi-tenant catalog.</p>
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
      <form onSubmit={handleUpdate} className="max-w-xl bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-5">
        
        <div className="flex items-center gap-2 border-b border-ink/5 pb-3">
          <Package className="text-teal" size={18} />
          <h2 className="font-display font-bold text-sm text-ink">Product Specifications Overview</h2>
        </div>

        {/* Product Name Title Field */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Pangalan ng Produkto</label>
          <input 
            type="text" 
            required 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors" 
          />
        </div>

        {/* SKU & Brand Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">SKU / Item Code</label>
            <input 
              type="text" 
              placeholder="Walang SKU Code" 
              value={sku} 
              onChange={(e) => setSku(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors font-mono" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Brand Name</label>
            <input 
              type="text" 
              placeholder="Walang Brand" 
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
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Kategorya</label>
            {/* 🟢 BINAGO/INAYOS: Ginawang dynamic drop-down loader mula sa active storage classifications */}
            <select
              value={category}
              disabled={loadingCategories}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingCategories ? (
                <option value="Loading">Loading categories...</option>
              ) : dbCategories.length === 0 ? (
                <option value="General">General</option>
              ) : (
                dbCategories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

        </div>
        {/* Product Image Uploader with Current Preview Section */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Larawan ng Produkto</label>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 border border-ink/10 rounded-xl p-4">
            {currentImageUrl && !newImageFile && (
              <div 
                className="w-16 h-16 rounded-xl border border-ink/15 bg-white bg-cover bg-center shrink-0 shadow-xs" 
                style={{ backgroundImage: `url(${currentImageUrl})` }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setNewImageFile(e.target.files[0]);
                }
              }}
              className="w-full text-xs text-ink/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-ink file:text-paper file:hover:bg-ink/80 file:cursor-pointer"
            />
          </div>
        </div>

        {/* Product Long Description textarea node */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Deskripsyon ng Produkto</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={3}
            className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors resize-none" 
          />
        </div>

        {/* Action Publish Submitter Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition inline-flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Inia-update ang detalye sa catalog...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>I-save at I-update ang Produkto</span>
            </>
          )}
        </button>

      </form>

    </main>
  );
}
