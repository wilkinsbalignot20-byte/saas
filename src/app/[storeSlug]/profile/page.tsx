// src/app/[storeSlug]/profile/page.tsx
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface PageProps {
  params: Promise<{ storeSlug: string }>;
}

export default function CustomerProfilePage({ params }: PageProps) {
  // 1. I-unwrap ang dynamic param name gamit ang React.use() upang malaman kung aling tindahan ito
  const resolvedParams = use(params);
  const slug = resolvedParams.storeSlug;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [buyerEmail, setBuyerEmail] = useState('');
  
  // Mga sample information ng customer para sa practice window structure
  const [address, setAddress] = useState('123 Rizal Street, Barangay Central, Manila');
  const [phone, setPhone] = useState('09123456789');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const checkBuyerSession = async () => {
      // 2. Suriin kung may active buyer login session sa browser
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Fallback para sa practice mode operations node parameters:
        // Kung nagpapraktis ka lang at walang totoong user, mag-set tayo ng pekeng credentials para hindi ka ma-kickout!
        setBuyerEmail('suki_buyer@example.com');
        setLoading(false);
      } else {
        setBuyerEmail(session.user.email || '');
        setLoading(false);
      }
    };
    checkBuyerSession();
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert('🎉 Profile address configuration updated inside the tenant registry node!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-gray-500">
        <div className="animate-pulse text-xs font-semibold uppercase tracking-wider">Verifying buyer secure tunnel node...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation Backlink Button */}
        <button 
          onClick={() => router.push(`/${slug}`)}
          className="text-xs text-gray-400 hover:text-gray-900 font-semibold transition flex items-center space-x-1"
        >
          <span>←</span> <span>Bumalik sa Shopping Storefront</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT AREA: BUYER INFO SCORECARD CARD */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-xl font-black">
              👤
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight truncate max-w-[180px]">Verified Customer</h2>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate max-w-[180px]">{buyerEmail}</p>
            </div>
            <span className="text-[9px] font-mono bg-blue-50 text-blue-600 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Channel: /{slug}
            </span>
          </div>

          {/* RIGHT AREA: ADDRESS MANAGEMENT HUB FORM */}
          <div className="md:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">Account Settings & Delivery Nodes</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Registered Email</label>
                <input type="text" disabled value={buyerEmail} className="w-full bg-gray-100 border border-gray-200 text-gray-400 rounded-xl px-4 py-3 text-xs cursor-not-allowed outline-none" />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mobile Contact Phone</label>
                <input 
                  type="text" 
                  disabled={!isEditing} 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gray-900 text-gray-800 disabled:opacity-60 transition" 
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Default Shipping Destination</label>
                <textarea 
                  disabled={!isEditing} 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gray-900 text-gray-800 disabled:opacity-60 transition resize-none h-20"
                />
              </div>

              <div className="pt-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl text-xs shadow transition active:scale-95">
                      Save Settings Changes ✓
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 px-4 rounded-xl text-xs transition">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl text-xs transition border border-gray-200">
                    Modify Delivery Address ⚙️
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
