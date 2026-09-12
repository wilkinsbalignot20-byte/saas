'use client';

// LAHAT NG IMPORTS MO AY PINANATILI AT DINAGDAGAN NG MGA KAIALNGANG HOOKS AT ICONS
import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { Tag, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle2, Search, Package, Layers, ClipboardList } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function SellerCategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  
  // Dynamic parameters allocation node (Kukunin ang store handle gaya ng: manipu)
  const seller = params?.seller as string;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [storeId, setStoreId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  // 🚀 HIGHWAY GALAMAY MENU DEFINITIONS: Ang apat na tabs na naka-sync sa lahat ng sub-pages mo
  const PRODUCT_GALAMAY_TABS = [
    { href: `/dashboard/${seller}/product`, label: 'All Products', icon: Package },
    { href: `/dashboard/${seller}/product/new`, label: 'Add New Product', icon: Plus },
    { href: `/dashboard/${seller}/product/inventory`, label: 'Bulk Inventory', icon: ClipboardList },
    { href: `/dashboard/${seller}/product/categories`, label: 'Categories', icon: Layers },
  ];

  useEffect(() => {
    const fetchCategoriesData = async () => {
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
          throw new Error('Hindi nahanap ang profile record ng iyong tindahan.');
        }

        setStoreId(storeData.id);

        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('store_id', storeData.id)
          .order('name', { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (err: any) {
        console.error('Error loading merchant product categories:', err.message);
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (seller) fetchCategoriesData();
  }, [seller, router]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !storeId) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const cleanSlug = newCategoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (!cleanSlug) throw new Error('Mangyaring maglagay ng wastong pangalan ng kategorya.');

      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            store_id: storeId,
            name: newCategoryName.trim(),
            slug: cleanSlug,
          }
        ])
        .select('id, name, slug')
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Umiiral na ang kategoryang ito sa iyong tindahan.');
        throw error;
      }

      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
      setMessage('🎉 Kategorya ay matagumpay na naidagdag!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!storeId) return;
    if (!confirm('Sigurado ka bang gusto mong burahin ang kategoryang ito? Ang mga produktong gumagamit nito ay mananatili pero mawawalan ng kategorya.')) return;
    
    try {
      // ITINAMA: Double-lock engine verification para sa multi-tenancy rules ng database mo
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('store_id', storeId); 

      if (error) throw error;
      setCategories(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(`❌ Error sa pagbura: ${err.message}`);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <header className="border-b border-ink/5 pb-5">
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Custom Shop Categories</h1>
        <p className="text-sm text-ink/50 mt-1">Create and manage internal layout shelf classifications tailored for your tenant storefront catalog.</p>
      </header>

      {/* 🧭 INTERACTIVE GALAMAY HUB: Horizontal Tabs Menu na nakasabit sa pinakataas ng screen */}
      <nav className="flex flex-wrap gap-2 border-b border-ink/5 pb-2">
        {PRODUCT_GALAMAY_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <button
              key={tab.href}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE FORM CREATOR */}
        <section className="bg-white border border-ink/10 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-ink/5 pb-2">
            <Tag size={16} className="text-teal" />
            <h2 className="font-display font-bold text-sm text-ink">Add Custom Category</h2>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Category Name</label>
              <input 
                type="text" 
                required 
                disabled={loading}
                placeholder="Halimbawa: Best Sellers, Sale" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)} 
                className="w-full bg-gray-50 border border-ink/10 rounded-xl px-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !newCategoryName.trim() || loading}
              className="w-full bg-ink text-paper font-semibold py-3 rounded-xl text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={14} />}
              <span>{isSubmitting ? 'Inililigtas...' : 'Create Category'}</span>
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: ACTIVE CATEGORY RENDERING VIEWPORT SHEET */}
        <section className="lg:col-span-2 space-y-4">
          
          {/* Search Filter Toolbar */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              placeholder="I-filter ang mga kategorya..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-ink/10 text-xs rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-ink/30 text-ink font-medium"
            />
          </div>

          {/* Data List Frame Container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-white border border-ink/10 rounded-2xl shadow-sm">
              <RefreshCw size={20} className="animate-spin text-ink/40" />
              <div className="text-xs font-medium text-ink/50">Hahatak ng categories data stream...</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white border border-ink/10 rounded-2xl p-10 text-center text-xs text-ink/40 shadow-sm space-y-1">
              <p className="font-semibold text-ink">Walang custom categories</p>
              <p className="text-ink/50">Gumamit ng panel sa kaliwa para gumawa ng unang classifications matrix.</p>
            </div>
          ) : (
            <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm divide-y divide-ink/5">
              {categories
                .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-ink">{item.name}</h4>
                      <p className="text-[10px] font-mono text-ink/40 mt-0.5">Slug Handle: /{item.slug}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(item.id)}
                      className="p-2 border border-ink/10 text-coral hover:bg-rose-50/50 rounded-xl transition cursor-pointer"
                      title="Burahin ang Kategorya"
                    >
                      <Trash2 size={13} className="pointer-events-none" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

