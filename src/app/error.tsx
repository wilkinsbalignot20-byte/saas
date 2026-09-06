// src/app/error.tsx
'use client'; // OBLIGADO: Ang error files sa Next.js ay dapat Client Components

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // I-log ang error sa console para makita mo habang nagde-debug
    console.error('SaaS App Exception caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white border rounded-2xl p-8 max-w-md w-full shadow-xl">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          ⚠️
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          May naganap na hindi inaasahang error
        </h2>
        
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Hindi matapos ang iyong hiling sa ngayon. Maaaring may problema sa koneksyon o sa database server.
        </p>

        {/* Error Code Digest (kung mayroon) */}
        {error.digest && (
          <p className="text-[10px] font-mono bg-gray-100 text-gray-400 rounded px-2 py-1 mt-3 inline-block">
            Digest ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {/* Subukang i-reload lang ang apektadong component */}
          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md active:scale-95 transition-all text-sm"
          >
            Subukan Ulit (Try Again)
          </button>
          
          {/* Bumalik sa main homepage */}
          <a
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-all text-sm inline-block"
          >
            Bumalik sa Home
          </a>
        </div>
      </div>
    </div>
  );
}
