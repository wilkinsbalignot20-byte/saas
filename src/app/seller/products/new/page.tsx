 'use client';

import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Plus, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Validation check para sa mga inputs
      const productPrice = parseFloat(price);
      const productStock = parseInt(stock, 10);

      if (isNaN(productPrice) || productPrice <= 0) {
        throw new Error('Mangyaring maglagay ng wastong presyo.');
      }
      if (isNaN(productStock) || productStock < 0) {
        throw new Error('Mangyaring maglagay ng wastong dami ng stock.');
      }

      // 2. 🎯 DYNAMIC BRIDGE: Alamin kung sino ang kasalukuyang active session user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Walang nakitang aktibong session. Mangyaring mag-log in muli.');
      }

      // 3. Kukuha ng katapat na store_id ng merchant mula sa 'stores' table sa database
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (storeError || !storeData) {
        throw new Error('Hindi mahanap ang profile ng iyong tindahan sa database configuration.');
      }

      // 4. I-insert ang bagong produkto gamit ang kanyang sariling verified store_id
      const { error } = await supabase.from('products').insert([
        {
          store_id: storeData.id, // Live dynamic tenant UUID isolation node matching contract
          name: name,
          price: productPrice,
          stock: productStock,
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40 hover:text-ink transition-colors font-mono mb-2"
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
            : 'bg-teal/5 text-teal border-teal/20'
        }`}>
          {message.startsWith('❌') ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{message}</span>
        </div>
      )}

      {/* FORM INTERACTIVE MODULE */}
      <form onSubmit={handleSubmit} className="max-w-xl bg-white border border-ink/10 p-6 rounded-2xl shadow-sm space-y-5">
        
        <div className="flex items-center gap-2 border-b border-ink/5 pb-3">
          <Package className="text-[var(--color-teal)]" size={18} />
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

        {/* Pricing and Stock Double Row Elements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
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
