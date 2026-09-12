 'use client';

// LAHAT NG IMPORTS MO (Binuo kasama ang bagong hooks para sa tabs routing window)
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter, useParams, usePathname } from 'next/navigation'; 
import { Search, Plus, Package, Edit2, Trash2, RefreshCw, Folder, Layers, ClipboardList } from 'lucide-react';
import { Product } from '../../../../types/product';

export default function SellerProductsPage() {
  const router = useRouter(); 
  const params = useParams();
  const pathname = usePathname();
  
  // Dynamic parameters allocation node (e.g., manipu)
  const seller = params?.seller as string; 

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 🚀 HIGHWAY GALAMAY MENU DEFINITIONS: Ang apat na tabs na makikita sa pinakataas ng screen
  const PRODUCT_GALAMAY_TABS = [
    { href: `/dashboard/${seller}/product`, label: 'All Products', icon: Package },
    { href: `/dashboard/${seller}/product/new`, label: 'Add New Product', icon: Plus },
    { href: `/dashboard/${seller}/product/inventory`, label: 'Bulk Inventory', icon: ClipboardList },
    { href: `/dashboard/${seller}/product/categories`, label: 'Categories', icon: Layers },
  ];

  // 1. DATA STREAM INTEGRATION: Kumuha ng mga produkto na nakahiwalay kada tenant store ID
  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error('Walang aktibong session. Mangyaring mag-log in muli.');
        }

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile record ng iyong tindahan.');
        }

        const { data, error } = await supabase
          .from('products')
          .select('id, store_id, name, price, stock, created_at')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts((data as Product[]) || []);
      } catch (err: any) {
        console.error('Error fetching inventory items node:', err.message);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (seller) fetchSellerProducts();
  }, [seller]);

  // 2. DATA MUTATION NODE: Ligtas na pagbura gamit ang double-lock tenant reference pattern
  const handleDeleteProduct = async (id: string, storeId: string) => {
    if (!confirm('Sigurado ka bang gusto mong burahin ang produktong ito sa iyong catalog?')) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('store_id', storeId); // Double lock framework protection

      if (error) throw error;
      setProducts(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(`❌ Error sa pagbura: ${err.message}`);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER BAR SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ink/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Product Catalog Management</h1>
          <p className="text-sm text-ink/50 mt-1">Manage and scale your active multi-tenant channel storefront storefront catalog.</p>
        </div>
      </header>

      {/* 🧭 INTERACTIVE GALAMAY HUB: Horizontal Navigation Tabs Bar Component */}
      <nav className="flex flex-wrap gap-2 border-b border-ink/5 pb-2">
        {PRODUCT_GALAMAY_TABS.map((tab) => {
          const isActive = pathname === tab.href; // Tingnan kung ito ang kasalukuyang nakabukas na tab
          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                isActive
                  ? 'bg-ink text-paper shadow-sm font-bold scale-[1.02]' // Active State Styling
                  : 'bg-paper border border-ink/10 text-ink/60 hover:text-ink hover:bg-ink/5' // Inactive State Styling
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ERROR HANDLER LOG DISPLAY */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-xs text-rose-800 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* FILTER & TOOLBAR HUB */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Maghanap ng produkto sa iyong catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-ink/10 text-xs rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-ink/30 text-ink font-medium"
          />
        </div>
      </div>

      {/* 📊 INVENTORY ITEM DATA TABLE COMPONENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <div className="text-sm font-medium text-ink/50">Loading catalog inventory channels...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-ink/10 rounded-2xl p-12 text-center text-sm text-ink/40 shadow-sm max-w-xl mx-auto space-y-3">
          <div className="bg-ink/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-ink/40">
            <Package size={20} />
          </div>
          <p className="font-semibold text-ink">Walang aktibong produkto na nahanap</p>
          <p className="max-w-xs mx-auto leading-relaxed text-xs text-ink/50">
            I-click ang "Add New Product" tab sa itaas para maglagay ng unang produkto sa database na makikita sa iyong storefront directory.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-ink/50 font-semibold border-b border-ink/5 uppercase tracking-wider">
                  <th className="py-4 px-6">Product Name</th>
                  <th className="py-4 px-6 text-right">Price</th>
                  <th className="py-4 px-6 text-center">Stock Availability</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 text-xs">
                {products
                  .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-ink text-sm">
                        {product.name}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-ink">
                        ₱{Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-semibold">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-semibold text-[10px] tracking-wide uppercase ${
                          product.stock > 5 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-1.5 justify-end">
                          {/* FIXED ROUTING INTERCONNECTION: Aligned and locked inside dynamic workspace directory */}
                          <button 
                            onClick={() => router.push(`/dashboard/${seller}/product/${product.id}`)}
                            className="p-2 border border-ink/10 text-ink/60 hover:text-ink hover:bg-ink/5 rounded-xl transition cursor-pointer"
                            title="I-edit ang Produkto"
                          >
                            <Edit2 size={13} className="pointer-events-none" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id, product.store_id)}
                            className="p-2 border border-ink/10 text-coral hover:bg-rose-50/50 rounded-xl transition cursor-pointer"
                            title="Burahin ang Produkto"
                          >
                            <Trash2 size={13} className="pointer-events-none" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
