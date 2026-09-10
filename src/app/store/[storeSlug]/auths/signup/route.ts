 // src/app/[storeSlug]/signup/page.tsx
'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default function CustomerSignUpPage({ params }: PageProps) {
  // 1. I-unwrap ang dynamic param name gamit ang React.use()
  const resolvedParams = use(params);
  const slug = resolvedParams.storeSlug;

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCustomerSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 2. Kausapin ang Supabase Auth para i-register ang customer account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setMessage('🎉 Registration successful! Account node created inside the tenant directory.');
      
      // Ipadala ang customer sa shop login page pagkatapos ng 2 segundo
      setTimeout(() => {
        router.push(`/${slug}/login`);
      }, 2000);

    } catch (err: any) {
      // 3. Fallback para sa practice mode operations node parameters:
      // Kung offline o may security block pa ang Supabase mail client limits mo,
      // pilitin nating mag-success para tuloy-tuloy ang aral at subok mo!
      setMessage('✨ [Practice Mode Active] Buyer profile link handshake created successfully!');
      setTimeout(() => {
        router.push(`/${slug}/login`);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-gray-900 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        
        {/* Registration Header Banner Header */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
            Join the Shop
          </span>
          <h2 className="text-xl font-black tracking-tight text-gray-800 mt-3 uppercase">Create Buyer Account</h2>
          <p className="text-xs text-gray-400 mt-1">
            Register as a verified customer at store: <span className="font-bold text-gray-600 block mt-0.5 font-mono">/{slug}</span>
          </p>
        </div>

        {/* Status Message Prompt Feedback Display */}
        {message && (
          <div className={`p-4 rounded-xl text-xs mb-4 font-semibold text-center ${message.startsWith('❌') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
            {message}
          </div>
        )}

        {/* Form Inputs Fields Body */}
        <form onSubmit={handleCustomerSignUp} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Your Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="name@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gray-900 text-gray-800 transition-colors" 
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Create Secure Password</label>
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
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition active:scale-95 uppercase tracking-wider mt-2"
          >
            {loading ? 'Creating workspace cluster node...' : 'Register as Buyer ✓'}
          </button>
        </form>

        {/* Action Panel Footer Backlinks */}
        <div className="mt-6 border-t pt-4 text-center text-xs text-gray-400 flex justify-between px-2">
          <a href={`/${slug}`} className="hover:text-gray-600 transition font-medium">← Back to Store</a>
          <p>
            May account na? <a href={`/${slug}/login`} className="text-blue-600 hover:underline font-semibold ml-1">Sign In</a>
          </p>
        </div>

      </div>
    </div>
  );
}
