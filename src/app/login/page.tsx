'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, RefreshCw, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

export default function SellerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      if (data.user) {
        router.push('/seller');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased grid lg:grid-cols-2 animate-in fade-in duration-300">

      {/* LEFT SIDE: BRANDING WITH INTEGRATED VIDEO & FLOATING CARDS */}
      <div className="hidden lg:flex relative bg-ink text-paper p-12 flex-col justify-between overflow-hidden select-none">
        
        {/* Ambient video layer asset stream */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-45 mix-blend-lighten"
        >
          <source src="/shoes2.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay for precise typography legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/30 z-10" />

        {/* Floating active merchant showcase structural preview cards */}
        <div className="absolute top-16 right-6 z-20 hidden xl:block">
          <div className="w-48 -rotate-6 rounded-2xl bg-paper/10 border border-paper/10 p-4 backdrop-blur-md shadow-xl mb-4 ml-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-semibold text-xs tracking-tight text-paper">Manipu Wear</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-marigold)]" />
            </div>
            <div className="h-14 rounded-xl bg-[var(--color-marigold)]/10 border border-[var(--color-marigold)]/20" />
          </div>
          <div className="w-48 rotate-3 rounded-2xl bg-paper/10 border border-paper/10 p-4 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-semibold text-xs tracking-tight text-paper">Infinity Gems Coffee</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)]" />
            </div>
            <div className="h-14 rounded-xl bg-[var(--color-teal)]/10 border border-[var(--color-teal)]/20" />
          </div>
        </div>

        {/* Header link branding context */}
        <div className="relative z-20">
          <Link href="/" className="font-display font-black text-2xl tracking-tight text-paper hover:opacity-80 transition-opacity uppercase">
            Manipu <span className="text-paper/40 font-sans text-xs tracking-normal font-normal capitalize ml-1">SaaS</span>
          </Link>
        </div>

        {/* Bottom branding presentation block */}
        <div className="relative z-20 max-w-md space-y-4">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-marigold)] bg-paper/10 border border-paper/5 px-3 py-1 rounded-full backdrop-blur-md font-mono">
            <ShieldCheck size={11} /> Seller Portal Center
          </span>
          <div>
            <h1 className="font-display font-bold text-4xl leading-tight text-paper tracking-tight">
              Manage your store like a pro.
            </h1>
            <p className="text-paper/60 text-xs leading-relaxed mt-2 font-medium">
              Monitor your active sales pipeline, auto-generate airwaybills for J&T and Flash, and execute dynamic fund payouts — all from one synchronized workspace dashboard node.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: INTERACTIVE LOGIN FORM MATRIX */}
      <div className="flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 bg-white border-l border-ink/5">
        
        {/* Responsive top view logo only visible on portable displays */}
        <div className="lg:hidden mb-10 text-center">
          <Link href="/" className="font-display font-black text-2xl tracking-tight uppercase text-ink">
            Manipu <span className="text-ink/40 font-sans text-xs font-normal lowercase">SaaS</span>
          </Link>
        </div>

        <div className="max-w-sm w-full space-y-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-ink tracking-tight">Welcome Back</h2>
            <p className="text-xs text-ink/40 mt-0.5">Sign in to manage your active digital storefront operations.</p>
          </div>

          {/* ASYNC DISPATCHER ERROR ALERT CARD BAR */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-shake">
              <AlertCircle size={14} className="text-[var(--color-coral)] shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field Wrapper input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Email address</label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink/30">
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-ink/10 rounded-xl pl-10 pr-4 py-3 text-xs text-ink font-medium outline-none focus:border-ink/30 transition-colors"
                />
              </div>
            </div>

            {/* Password Field Wrapper inputs */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wide">Password</label>
                <a href="#" className="text-[11px] font-medium text-ink/40 hover:text-ink transition-colors font-mono">
                  Forgot?
                </a>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-ink/30">
                  <Lock size={14} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-ink/10 rounded-xl pl-10 pr-4 py-3 text-xs text-ink outline-none focus:border-ink/30 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Submit Action Control Trigger Pin button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-paper font-semibold py-3.5 rounded-xl mt-3 text-xs shadow-sm hover:bg-ink/90 active:scale-95 disabled:opacity-40 transition inline-flex items-center justify-center gap-2 cursor-pointer group"
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Signing in to database...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Form redirection layout navigation footer options */}
          <div className="border-t border-ink/5 pt-4 text-center">
            <p className="text-xs text-ink/40">
              Don&apos;t have a store yet?{' '}
              <Link href="/signup" className="text-ink font-semibold hover:text-[var(--color-marigold-dark)] transition-colors">
                Create one for free
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
