 // src/app/admin/stores/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminStoresPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    // 🛠️ MOCK TENANT DIRECTORY DATA LISTING FOR PRACTICE
    setTenants([
      { id: '1', name: 'Milktea Zone Hub', slug: 'milktea-zone', theme: '#10b981', status: 'active', plan: 'Enterprise Plan' },
      { id: '2', name: 'Kape ni Juan Branch', slug: 'kape-ni-juan', theme: '#3b2219', status: 'active', plan: 'Basic Starter' },
      { id: '3', name: 'Juan Clothing Factory', slug: 'juan-clothing', theme: '#6366f1', status: 'suspended', plan: 'Trial Node' }
    ]);
  }, []);

  return (
    <div className="flex-1 p-6 md:p-10 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      
      {/* Admin Central Dashboard Banner Navigation Grid Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-wider text-purple-500 uppercase">SaaS Tenant Registry</h1>
          <p className="text-xs text-slate-500 mt-1">Manage global cloud store configurations, approve registrations, or override system locks.</p>
        </div>
        
        {/* 🛠️ TAB NAVIGATION BUTTONS */}
        <div className="flex gap-2 text-xs font-bold font-sans">
          <button 
            onClick={() => router.push('/admin/stores')} 
            className="bg-purple-900/40 border border-purple-700/50 px-3.5 py-2.5 rounded-xl text-purple-300"
          >
            🏪 Active Tenants
          </button>
          <button 
            onClick={() => router.push('/admin/billing')} 
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white transition"
          >
            💳 Platform Income
          </button>
        </div>
      </header>

      {/* 📊 GLOBAL MERCHANTS MANAGEMENT DATA SHEET TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-widest text-[9px]">
                <th className="p-4">Store Identity</th>
                <th className="p-4">URL Domain Path</th>
                <th className="p-4">Subscription Plan</th>
                <th className="p-4">Cloud Status</th>
                <th className="p-4 text-center">Server Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium font-mono">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: tenant.theme }} />
                    <span className="font-bold text-slate-200 font-sans text-sm">{tenant.name}</span>
                  </td>
                  <td className="p-4 text-purple-400">/{tenant.slug}</td>
                  <td className="p-4 text-slate-400">{tenant.plan}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      tenant.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/20' : 'bg-red-950 text-red-400 border border-red-900/20'
                    }`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-4 font-sans text-xs">
                    <button onClick={() => window.open(`/${tenant.slug}`, '_blank')} className="text-blue-400 hover:underline">Launch View</button>
                    <button onClick={() => alert(`Suspending tenant workspace session instance: ${tenant.name}`)} className="text-red-400 hover:underline font-bold">Suspend Lock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
