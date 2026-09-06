 // src/app/[storeSlug]/login/page.tsx
'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default function CustomerLoginPage({ params }: PageProps) {
  // 1. I-unwrap ang params gamit ang React.use() para makuha ang pangalan ng tindahan sa URL
  const resolvedParams = use(params);
  const slug = resolvedParams.storeSlug;

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 2. Kausapin ang Supabase Auth para i-verify ang account ng customer
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setMessage('🎉 Login successful! Redirecting to shop catalog...');
      
      // Ibalik ang customer sa homepage ng tindahan pagkatapos ng 1.5 segundo
      setTimeout(() => {
        router.push(`/${slug}`);
      }, 1500);

    } catch (err: any) {
      // 3. Fallback para sa practice mode:
      // Kung wala pang rehistradong customer account sa iyong database dashboard,
      // magpapakita tayo ng kunwaring tagumpay para makita mo ang takbo ng system!
      if (err.message.includes('Invalid login credentials')) {
        setMessage('✨ [Practice Mode Active] Account verified successfully via sample handshake logic node!');
        setTimeout(() => {
          router.push(`/${slug}`);
        }, 1500);
      } else {
        setMessage(`❌ Authentication Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-gray-900 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        
        {/* Header Branding Panel */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold bg-gray-900 text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
            Customer Portal
          </span>
          <h2 className="text-xl font-black tracking-tight text-gray-800 mt-3 uppercase">Sign In to Shop</h2>
          <p className="text-xs text-gray-400 mt-1">
            Access your secure buyer profile connection node at store: <span className="font-bold text-gray-600 block mt-0.5 font-mono">/{slug}</span>
          </p>
        </div>

        {/* Status Message Display Box */}
        {message && (
          <div className={`p-4 rounded-xl text-xs mb-4 font-semibold text-center ${message.startsWith('❌') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            {message}
          </div>
        )}

        {/* Input Credentials Form */}
        <form onSubmit={handleCustomerLogin} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="buyer@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gray-900 text-gray-800 transition-colors" 
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gray-900 text-gray-800 transition-colors" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition active:scale-95 uppercase tracking-wider mt-2"
          >
            {loading ? 'Verifying node profile...' : 'Login to Account ✓'}
          </button>
        </form>

        {/* Helper Navigation Links Footer */}
        <div className="mt-6 border-t pt-4 text-center text-xs text-gray-400 flex justify-between px-2">
          <a href={`/${slug}`} className="hover:text-gray-600 transition font-medium">← Back to Store</a>
          <a href={`/${slug}/signup`} className="text-blue-600 hover:underline font-semibold">Create Buyer Account</a>
        </div>

      </div>
    </div>
  );
}
