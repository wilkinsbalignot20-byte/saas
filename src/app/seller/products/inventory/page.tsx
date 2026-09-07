 // src/app/seller/products/inventory/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, AlertCircle, RefreshCw, Save } from 'lucide-react';

interface InventoryProduct {
  id: string;
  sku: string | null;
  name: string;
  stock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export default function InventoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryList, setInventoryList] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Magpapanatili ng talaan ng mga id at stock na binago ng user para sa bulk saving block
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Kukuha muna ng store_id na pagmamay-ari ng active user profile
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', session.user.id)
          .maybeSingle();

        if (storeError || !storeData) {
          throw new Error('Hindi nahanap ang profile record ng iyong tindahan.');
        }

        // Kunin ang lahat ng produkto ng tindahan para sa stock audit control board sheets
        const { data, error } = await supabase
          .from('products')
          .select('id, sku, name, stock, price')
          .eq('store_id', storeData.id)
          .order('name', { ascending: true });

        if (error) throw error;

        // I-map ang nakuha nating flat query rows kasama ang pag-calculate ng status badges
        const mappedInventory = (data || []).map((item: any) => {
          let currentStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (item.stock === 0) currentStatus = 'Out of Stock';
          else if (item.stock <= 5) currentStatus = 'Low Stock';

          return {
            id: item.id,
            sku: item.sku || 'NO SKU',
            name: item.name,
            stock: item.stock,
            price: Number(item.price || 0),
            status: currentStatus,
          };
        });

        setInventoryList(mappedInventory);
      } catch (err: any) {
        console.error('Error fetching inventory catalog matrix:', err.message);
        setMessage(`❌ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [router]);

  // Function para sa inline stock numeric editor helper
  const handleStockChange = (id: string, newValue: number) => {
    const updatedStock = Math.max(0, newValue);

    // 1. I-update ang visualization list state para ramdam agad ng user sa screen
    setInventoryList(prev =>
      prev.map(item => {
        if (item.id === id) {
          let updatedStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (updatedStock === 0) updatedStatus = 'Out of Stock';
          else if (updatedStock <= 5) updatedStatus = 'Low Stock';
          
          return { ...item, stock: updatedStock, status: updatedStatus };
        }
        return item;
      })
    );

    // 2. Itala ang binagong stock sa pending queue array matrix module map layer
    setPendingUpdates(prev => ({
      ...prev,
      [id]: updatedStock
    }));
  };

  // Bulk Async Transaction Pipeline: Sabay-sabay na ise-save ang lahat ng binagong stock sa cloud database
  const handleSaveChanges = async () => {
    const updateIds = Object.keys(pendingUpdates);
    if (updateIds.length === 0) return;

    setIsSaving(true);
    setMessage('');

    try {
      // Isasakatuparan ang sunod-sunod na update requests gamit ang individual map tracking execution blocks
      const updatePromises = updateIds.map(id => 
        supabase
          .from('products')
          .update({ stock: pendingUpdates[id] })
          .eq('id', id)
      );

      const results = await Promise.all(updatePromises);
      const hasError = results.some(res => res.error);

      if (hasError) throw new Error('May naganap na isyu sa pag-update ng ilang stock cells.');

      setPendingUpdates({}); // I-clear ang listahan ng binago kapag matagumpay ang bulk loop operation
      setMessage('🎉 Lahat ng pagbabago sa iyong mga stock ay matagumpay na naisave sa database!');
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`❌ Error sa pag-save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto bg-paper text-ink font-body animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-ink/5 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-ink">Inventory Stock</h1>
          <p className="text-sm text-ink/50 mt-1">Audit and update your product stock levels across your active catalog.</p>
        </div>
        
        {/* INAYOS: Nilagyan ng active save function trigger at disabled capabilities habang nagpa-process ng data */}
        <button 
          onClick={handleSaveChanges}
          disabled={isSaving || Object.keys(pendingUpdates).length === 0}
          className="flex items-center justify-center gap-2 self-start bg-ink text-paper font-semibold px-4 py-2.5 rounded-xl text-xs hover:bg-ink/90 transition-all disabled:opacity-40 cursor-pointer"
        >
          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{isSaving ? 'Inise-save...' : 'Save Changes'}</span>
        </button>
      </header>

      {/* COMPONENT MESSAGE DISPATCHER BLOCK */}
      {message && (
        <div className={`p-4 rounded-xl text-xs max-w-xl font-medium border flex items-center gap-2 ${
          message.startsWith('❌') 
            ? 'bg-rose-50/50 text-rose-800 border-rose-200' 
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {message.startsWith('❌') ? <AlertCircle size={15} /> : <ShieldCheck size={15} />}
          <span>{message}</span>
        </div>
      )}

      {/* FILTER & SEARCH BAR TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Maghanap gamit ang pangalan o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-ink/10 text-xs rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-ink/30 text-ink font-medium"
          />
        </div>
      </div>

      {/* 📊 INVENTORY SHEET DATA TABLE COMPONENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw size={24} className="animate-spin text-ink/40" />
          <div className="text-sm font-medium text-ink/50">Loading catalog inventory channels...</div>
        </div>
      ) : inventoryList.length === 0 ? (
        <div className="bg-white border border-ink/10 rounded-2xl p-12 text-center text-sm text-ink/40 shadow-sm max-w-xl mx-auto space-y-2">
          <p className="font-semibold text-ink">Walang nakitang imbentaryo</p>
          <p className="max-w-xs mx-auto leading-relaxed text-xs text-ink/50">
            Magdagdag muna ng produkto sa iyong catalog para ma-audit ang dami ng iyong mga stocks dito.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-ink/5 text-xs font-semibold text-ink/50 tracking-wider">
                  <th className="py-4 px-6">SKU / Item Code</th>
                  <th className="py-4 px-6">Product Details</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Price</th>
                  <th className="py-4 px-6 text-center w-36">Available Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 text-xs">
                {inventoryList
                  .filter(item => 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      
                      {/* SKU */}
                      <td className="py-4 px-6 font-mono font-medium text-ink/60">{item.sku}</td>
                      
                      {/* Product Name Title */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-ink text-sm">{item.name}</p>
                      </td>
                      
                      {/* INAYOS: Status Badge with standardized Tailwind colors */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[10px] tracking-wide uppercase ${
                          item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' :
                          item.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {item.status === 'In Stock' && <ShieldCheck size={11} />}
                          {item.status !== 'In Stock' && <AlertCircle size={11} />}
                          {item.status}
                        </span>
                      </td>
                      
                      {/* Price Tag */}
                      <td className="py-4 px-6 text-right font-mono font-bold text-ink">
                        ₱{item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      
                      {/* Quantitative Inline Stock Editor Input Node */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center border border-ink/10 rounded-xl bg-gray-50 overflow-hidden w-28 mx-auto">
                          <button
                            type="button"
                            onClick={() => handleStockChange(item.id, item.stock - 1)}
                            className="px-3 py-2 text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors font-bold text-sm cursor-pointer select-none"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.stock}
                            onChange={(e) => handleStockChange(item.id, parseInt(e.target.value, 10) || 0)}
                            className="w-full text-center bg-transparent text-xs font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-ink font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleStockChange(item.id, item.stock + 1)}
                            className="px-3 py-2 text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors font-bold text-sm cursor-pointer select-none"
                          >
                            +
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
