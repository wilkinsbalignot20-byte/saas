 // src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

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

  // 🚀 EXPERT OAUTH NODE: Google Login Action Switch
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Ididirekta nito ang gumagamit sa parehong callback endpoint na may multi-tenant validation check
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(`Google Login Error: ${err.message}`);
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
              <AlertCircle size={14} className="text-rose-600 shrink-0" />
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

          {/* OAuth Divider Element */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-ink/5"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-ink/30 uppercase tracking-wider font-mono">Or secure sign in with</span>
            <div className="flex-grow border-t border-ink/5"></div>
          </div>

          {/* Google Single-Sign On Login Button Node */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full bg-white text-ink border border-ink/10 font-semibold py-3 px-4 rounded-xl text-xs hover:bg-gray-50 active:scale-[0.98] disabled:opacity-40 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google Account</span>
          </button>

          {/* Form redirection layout navigation footer options */}
          <div className="border-t border-ink/5 pt-4 text-center">
            <p className="text-xs text-ink/40">
              Don&apos;t have a store yet?{' '}
              <Link href="/sign-up" className="text-ink font-semibold hover:text-[var(--color-marigold-dark)] transition-colors">
                Create one for free
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
