'use client';

// LAHAT NG IMPORTS MO (Binuo kasama ang bagong tracking hooks at dynamic layout icons)
import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Search, Plus, Package, RefreshCw, Save, AlertCircle, CheckCircle2, Layers, ClipboardList, Trash2 } from 'lucide-react';

// Kontrata para sa state management ng pinag-aaralang variations input engine
interface VariantInput {
  variant_name: string;
  sku: string;
  price_modifier: string;
  stock: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  
  // Dynamic parameter allocation track (Kukunin ang active workspace domain, e.g., manipu)
  const seller = params?.seller as string;

  // 1. EXTENDED SPECIFICATION STATES: May kasama nang productImageFile state tagasalo
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('General'); // ◄ Default option setup
  const [description, setDescription] = useState('');
  const [productImageFile, setProductImageFile] = useState<File | null>(null); // ◄ PICTURE STATE

  // 🟢 GINADAGDAG: Dynamic array list core state para sa e-commerce variations nodes nina seller
  const [variants, setVariants] = useState<VariantInput[]>([]);

  // State framework para saluhin ang mga dynamic custom classifications mula sa DB
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 🚀 HIGHWAY GALAMAY MENU DEFINITIONS: Shared horizontal top tab keys mapping
  const PRODUCT_GALAMAY_TABS = [
    { href: `/dashboard/${seller}/product`, label: 'All Products', icon: Package },
    { href: `/dashboard/${seller}/product/new`, label: 'Add New Product', icon: Plus },
    { href: `/dashboard/${seller}/product/inventory`, label: 'Bulk Inventory', icon: ClipboardList },
    { href: `/dashboard/${seller}/product/categories`, label: 'Categories', icon: Layers },
  ];

  // Awtomatikong hahatakin ang mga custom entries (tulad ng Best Seller) ni tenant
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
        
        if (data && data.length > 0) {
          setCategory(data[0].slug); 
        }
      } catch (err: any) {
        console.error('Error loading product creation categories loop:', err.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (seller) fetchActiveCategories();
  }, [seller]);

  // Dynamic Array Helper Utilities para sa pagdadagdag at pagbura ng variant fields inputs
  const handleAddVariantField = () => {
    setVariants([...variants, { variant_name: '', sku: '', price_modifier: '0', stock: '0' }]);
  };

  const handleRemoveVariantField = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantInput, value: string) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Numerical conversions control validation map
      const productPrice = parseFloat(price);
      const productStock = parseInt(stock, 10);

      if (isNaN(productPrice) || productPrice <= 0) throw new Error('Mangyaring maglagay ng wastong presyo.');
      if (isNaN(productStock) || productStock < 0) throw new Error('Mangyaring maglagay ng wastong dami ng stock.');

      // 2. AUTHENTICATION & MULTI-TENANT VERIFICATION
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Walang aktibong session. Mangyaring mag-log in muli.');

      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', session.user.id)
        .maybeSingle();

      if (!storeData) throw new Error('Hindi nahanap ang profile record ng iyong tindahan.');

      // 3. 📸 STORAGE UPLOAD ENGINE NODE
      let uploadedImageUrl: string | null = null;

      if (productImageFile) {
        const fileExtension = productImageFile.name.split('.').pop();
        const fileName = `${storeData.id}-${Date.now()}.${fileExtension}`;
        
        const { error: uploadError } = await supabase.storage
          .from('logos') 
          .upload(`products/${fileName}`, productImageFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(`products/${fileName}`);
        
        uploadedImageUrl = publicUrl;
      }

      // 4. DATABASE TRANSACTION: I-save sa products table
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([
          {
            store_id: storeData.id,
            name: name.trim(),
            sku: sku.trim() || null,
            brand: brand.trim() || null,
            category: category, 
            description: description.trim() || null,
            price: productPrice,
            stock: productStock,
            image_url: uploadedImageUrl,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 🟢 GINADAGDAG: Relational database transaction saver para sa variations table rows
      if (variants.length > 0) {
        const variantsPayload = variants.map((v) => ({
          product_id: newProduct.id,
          variant_name: v.variant_name.trim(),
          sku: v.sku.trim() || null,
          price_modifier: parseFloat(v.price_modifier) || 0,
          stock: parseInt(v.stock, 10) || 0,
        }));

        const { error: variantInsertError } = await supabase
          .from('product_variants')
          .insert(variantsPayload);

        if (variantInsertError) throw variantInsertError;
      }

      // 5. 🤖 AUTOMATION EDGEWAY TRIGGER
      await fetch('/api/inngest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'shop/product.created',
          data: {
            productId: newProduct.id,
            storeId: storeData.id,
            sku: newProduct.sku,
            price: newProduct.price
          }
        })
      }).catch(err => console.error("Inngest synchronization trigger issue:", err));

      setMessage('🎉 Produkto, larawan, at variations ay matagumpay na naidagdag sa iyong catalog!');
      
      setTimeout(() => {
        router.push(`/dashboard/${seller}/product`);
      }, 1500);

    } catch (err: any) {
      setMessage(`❌ May Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <header className="border-b border-ink/5 pb-5">
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Add New Storefront Item</h1>
        <p className="text-sm text-ink/50 mt-1">Register structural specification records to your localized public e-commerce channels.</p>
      </header>

      {/* 🧭 INTERACTIVE GALAMAY HUB: Horizontal Navigation Tabs Bar Component */}
      <nav className="flex flex-wrap gap-2 border-b border-ink/5 pb-2">
        {PRODUCT_GALAMAY_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <button
              key={tab.href}
              type="button"
              onClick={() => router.push(tab.href)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                isActive
                  ? 'bg-ink text-paper shadow-sm font-bold scale-[1.02]'
                  : 'bg-paper border border-ink/10 text-ink/60 hover:text-ink hover:bg-ink/5'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

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

      {/* FORM INTERACTIVE MODULE GRID SHEETS */}
      <form onSubmit={handleSubmit} className="max-w-xl bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-5 text-xs">
        
        <div className="flex items-center gap-2 border-b border-ink/5 pb-3">
          <Package className="text-teal" size={18} />
          <h2 className="font-display font-bold text-sm text-ink">General Specifications</h2>
        </div>

        {/* Product Name Title Field */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Pangalan ng Produkto</label>
          <input 
            type="text" 
            required 
            placeholder="Halimbawa: Okinawa Milktea Hub" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors font-medium" 
          />
        </div>

        {/* SKU & Brand Input Fields Elements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Base SKU / Item Code (Opsyonal)</label>
            <input 
              type="text" 
              placeholder="Halimbawa: OKI-MILK-101" 
              value={sku} 
              onChange={(e) => setSku(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors font-mono" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Brand Name (Opsyonal)</label>
            <input 
              type="text" 
              placeholder="Halimbawa: Wilkins Tea Co." 
              value={brand} 
              onChange={(e) => setBrand(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors" 
            />
          </div>
        </div>

        {/* Pricing, Stock Volume, and Category dropdown choices grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Base Presyo (₱)</label>
            <input 
              type="number" 
              step="0.01"
              required 
              placeholder="0.00" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Total Base Stock</label>
            <input 
              type="number" 
              required 
              placeholder="0" 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink font-mono font-bold outline-none focus:border-ink/30" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Kategorya</label>
            <select
              value={category}
              disabled={loadingCategories}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors cursor-pointer font-medium disabled:opacity-50"
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

        {/* 📸 INTERACTIVE PRODUCT IMAGE UPLOADER COMPONENT LAYER */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Larawan ng Produkto (Opsyonal)</label>
          <div className="bg-gray-50 border border-ink/10 rounded-xl p-4">
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

        {/* Long Text Block Description text area component */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Deskripsyon ng Produkto (Opsyonal)</label>
          <textarea 
            placeholder="Ibahagi ang kumpletong impormasyon tungkol sa iyong paninda..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={3}
            className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors resize-none font-medium" 
          />
        </div>

        {/* 🟢 GINADAGDAG: DYNAMIC VARIATIONS MANAGEMENT INTERFACE AREA */}
        <div className="border-t border-dashed border-ink/10 pt-4 mt-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-ink block">Product Variations</span>
              <p className="text-[10px] text-ink/40 leading-tight">Magdagdag ng iba't ibang sukat, kulay, o mga sub-items dito.</p>
            </div>
            <button
              type="button"
              onClick={handleAddVariantField}
              className="bg-ink text-paper text-[10px] px-3 py-1.5 rounded-lg font-bold hover:bg-ink/80 transition active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} />
              <span>Add Variant</span>
            </button>
          </div>

          {/* Dinamikong Hilera ng mga Variant Inputs ng Merchant */}
          {variants.length > 0 && (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {variants.map((variant, index) => (
                <div key={index} className="p-3 bg-gray-50 border border-ink/5 rounded-xl space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveVariantField(index)}
                    className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-ink/40 uppercase">Variant Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Black / Large"
                        value={variant.variant_name}
                        onChange={(e) => handleVariantChange(index, 'variant_name', e.target.value)}
                        className="w-full bg-white border border-ink/10 rounded-lg px-2 py-1.5 text-xs text-ink outline-none focus:border-ink/30 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-ink/40 uppercase">Variant SKU</label>
                      <input
                        type="text"
                        placeholder="e.g., OKI-BLK-LG"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                        className="w-full bg-white border border-ink/10 rounded-lg px-2 py-1.5 text-xs text-ink outline-none focus:border-ink/30 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-ink/40 uppercase">Price Modifier (₱)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={variant.price_modifier}
                        onChange={(e) => handleVariantChange(index, 'price_modifier', e.target.value)}
                        className="w-full bg-white border border-ink/10 rounded-lg px-2 py-1.5 text-xs text-ink outline-none font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-ink/40 uppercase">Variant Stock</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        className="w-full bg-white border border-ink/10 rounded-lg px-2 py-1.5 text-xs text-ink outline-none font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Publish Submitter Button Node layout */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Inirerehistro sa catalog matrix channels...</span>
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
