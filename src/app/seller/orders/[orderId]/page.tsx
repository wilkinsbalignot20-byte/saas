// src/app/seller/orders/[orderId]/page.tsx
'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const router = useRouter();
  const [status, setStatus] = useState('pending');

  return (
    <div className="flex-1 p-6 md:p-10 space-y-6 bg-gray-950 text-gray-100 min-h-screen">
      <button onClick={() => router.push('/seller/orders')} className="text-xs text-gray-400 hover:text-white transition">
        ← Back to Orders
      </button>

      <div className="max-w-2xl bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Order Invoice Node</h1>
          <p className="text-xs font-mono text-gray-500 mt-1">ID: #{orderId}</p>
        </div>

        <div className="border-t border-b border-gray-800 py-4 space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-gray-400">Customer:</span> <span className="font-bold">Juan Dela Cruz</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Items ordered:</span> <span className="font-bold">2x Espresso Blend (₱300.00)</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Shipping Address:</span> <span className="font-bold text-right max-w-[250px]">Manila, Philippines</span></div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-950 p-4 rounded-xl border border-gray-800">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Logistics Status</span>
            <span className="text-sm font-bold capitalize text-blue-400">{status}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setStatus('shipped')} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition">
              Mark as Shipped 🚚
            </button>
            <button onClick={() => setStatus('completed')} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition">
              Complete Order ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
