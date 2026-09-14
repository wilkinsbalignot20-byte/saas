 // src/app/page.tsx
import Link from 'next/link';

export default function SaasLandingPage() {
  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            Manipu
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/70">
            <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
            <a href="#audiences" className="hover:text-ink transition-colors">For sellers</a>
            <Link href="/explore" className="hover:text-ink transition-colors">Explore stores</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-full hover:bg-ink/5 transition-colors"
            >
              Log in
            </Link>
            {/* 🟢 RE-ALIGNMENT FIXED: Itinama pabalik sa saktong /signup folder name mo nang walang gitling */}
            <Link
              href="/signup"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-sm font-semibold text-marigold-dark mb-4">
            Built for Filipino merchants
          </p>
          <h1 className="font-display font-bold text-5xl leading-[1.05] tracking-tight mb-6">
            Every tindahan deserves its own storefront
          </h1>
          <p className="text-lg text-ink/60 leading-relaxed max-w-md mb-8">
            Manipu gives you a fully working online store in minutes — your own products,
            your own colors, your own customers. We handle the payments, shipping, and
            stock behind the scenes.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {/* 🟢 RE-ALIGNMENT FIXED: Itinama pabalik sa saktong /signup folder name mo nang walang gitling */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-ink text-paper font-semibold px-6 py-3.5 rounded-full hover:bg-ink/90 transition-colors"
            >
              Start your store
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 border border-ink/20 font-semibold px-6 py-3.5 rounded-full hover:border-ink/40 transition-colors"
            >
              Browse existing stores
            </Link>
          </div>
          <p className="text-sm text-ink/40 mt-6">No credit card required to start.</p>
        </div>

        {/* 🏪 DYNAMIC STOREFRONT STACK AREA */}
        <div className="relative h-[420px] hidden lg:block">
          
          {/* BOX 1: Manipu Wear */}
          <Link href="/explore" className="absolute top-0 left-4 w-72 -rotate-6 rounded-2xl bg-ink text-paper p-5 shadow-xl block hover:-translate-y-1 transition-transform cursor-pointer group select-none overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-sm group-hover:text-marigold transition-colors">Manipu Wear</span>
              <span className="w-2 h-2 rounded-full bg-marigold" />
            </div>
            
            <div className="h-24 rounded-lg bg-marigold/10 mb-4 relative overflow-hidden border border-paper/10">
              <video 
                src="/wear.mp4" 
                autoPlay loop muted playsInline 
                className="w-full h-full object-cover pointer-events-none" 
              />
            </div>

            <div className="h-2 w-3/4 rounded bg-paper/20 mb-2" />
            <div className="h-2 w-1/2 rounded bg-paper/20" />
          </Link>

          {/* "Go to our market" badge sa gitna */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none select-none">
            <div className="bg-white text-ink border border-ink/15 font-display font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full shadow-2xl animate-pulse whitespace-nowrap">
              Go to our market
            </div>
          </div>

          {/* BOX 2: Infinity Gems Coffee */}
          <Link href="/explore" className="absolute top-24 right-2 w-72 rotate-3 rounded-2xl bg-teal text-white p-5 shadow-xl block hover:-translate-y-1 transition-transform cursor-pointer group select-none overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-sm group-hover:text-marigold transition-colors">Infinity Gems Coffee</span>
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>
            
            <div className="h-24 rounded-lg bg-white/10 mb-4 relative overflow-hidden border border-white/10">
              <video 
                src="/coffee.mp4" 
                autoPlay loop muted playsInline 
                className="w-full h-full object-cover pointer-events-none" 
              />
            </div>

            <div className="h-2 w-2/3 rounded bg-white/25 mb-2" />
            <div className="h-2 w-1/3 rounded bg-white/25" />
          </Link>

          {/* BOX 3: Sariling Tindahan */}
          <Link href="/explore" className="absolute bottom-0 left-16 w-72 -rotate-2 rounded-2xl bg-white border border-ink/10 p-5 shadow-xl block hover:-translate-y-1 transition-transform cursor-pointer group select-none overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-semibold text-sm text-ink group-hover:text-marigold transition-colors">Sariling Tindahan</span>
              <span className="w-2 h-2 rounded-full bg-coral" />
            </div>
            
            <div className="h-24 rounded-lg bg-coral/10 mb-4 relative overflow-hidden border border-ink/10">
              <video 
                src="/tindahan.mp4" 
                autoPlay loop muted playsInline 
                className="w-full h-full object-cover pointer-events-none" 
              />
            </div>
            <div className="h-2 w-3/5 rounded bg-ink/10 mb-2" />
            <div className="h-2 w-2/5 rounded bg-ink/10" />
          </Link>
        </div>
      </section>

      {/* AUDIENCES: sellers vs shoppers */}
      <section id="audiences" className="border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-px bg-ink/10">
          <div className="bg-paper p-10">
            <p className="text-sm font-semibold text-marigold-dark mb-3">For sellers</p>
            <h2 className="font-display font-bold text-2xl mb-4">
              Run your tindahan from one dashboard
            </h2>
            <ul className="space-y-2 text-ink/60 text-sm mb-8">
              <li>Products, stock, and orders in one place</li>
              <li>Print shipping labels for J&amp;T, Flash, SPX</li>
              <li>Track your balance and payouts</li>
            </ul>
            {/* 🟢 RE-ALIGNMENT FIXED: Itinama ang link mula /sign-up pabalik sa /signup */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 font-semibold text-ink border-b-2 border-marigold pb-0.5"
            >
              Create a seller account
            </Link>
          </div>
          <div className="bg-paper p-10">
            <p className="text-sm font-semibold text-teal mb-3">For shoppers</p>
            <h2 className="font-display font-bold text-2xl mb-4">
              Discover independent stores
            </h2>
            <ul className="space-y-2 text-ink/60 text-sm mb-8">
              <li>Shop directly from the merchant, no middleman</li>
              <li>Track orders from checkout to delivery</li>
              <li>Chat with the seller in real time</li>
            </ul>
            {/* 🟢 RE-ALIGNMENT FIXED: Itinama ang link mula /sign-up pabalik sa /signup */}
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 font-semibold text-ink border-b-2 border-teal pb-0.5"
            >
              Create a shopper account
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="font-display font-bold text-3xl mb-14 max-w-md">
          From sign-up to your first sale, in three steps
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <p className="font-display font-bold text-4xl text-marigold mb-4">1</p>
            <h3 className="font-semibold mb-2">Sign up</h3>
            <p className="text-sm text-ink/60 leading-relaxed">
              Create your seller account and pick your store&apos;s address.
            </p>
          </div>
          <div>
            <p className="font-display font-bold text-4xl text-marigold mb-4">2</p>
            <h3 className="font-semibold mb-2">Customize your store</h3>
            <p className="text-sm text-ink/60 leading-relaxed">
              Add your logo, pick your colors, and list your first products.
            </p>
          </div>
          <div>
            <p className="font-display font-bold text-4xl text-marigold mb-4">3</p>
            <h3 className="font-semibold mb-2">Start selling</h3>
            <p className="text-sm text-ink/60 leading-relaxed">
              Share your store link and start taking orders the same day.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE TAGS */}
      <section className="border-t border-ink/10 bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display font-bold text-2xl mb-10">
            Everything a tindahan needs, already built in
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="relative pl-6">
              <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-marigold" />
              <p className="font-semibold mb-1">Inventory tracking</p>
              <p className="text-sm text-paper/50">Never oversell what you don&apos;t have in stock.</p>
            </div>
            <div className="relative pl-6">
              <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-marigold" />
              <p className="font-semibold mb-1">Order management</p>
              <p className="text-sm text-paper/50">Pending to delivered, all in one view.</p>
            </div>
            <div className="relative pl-6">
              <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-marigold" />
              <p className="font-semibold mb-1">Secure checkout</p>
              <p className="text-sm text-paper/50">Card and e-wallet payments, handled for you.</p>
            </div>
            <div className="relative pl-6">
              <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-marigold" />
              <p className="font-semibold mb-1">Sales insights</p>
              <p className="text-sm text-paper/50">See what&apos;s selling and who&apos;s buying.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="explore" className="bg-ink text-paper/60 border-t border-paper/10">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="font-display font-bold text-lg text-paper mb-1">Manipu</p>
            <p className="text-sm">The storefront platform for independent merchants.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:text-paper transition-colors">Log in</Link>
            {/* 🟢 RE-ALIGNMENT FIXED: Itinama ang link mula /sign-up pabalik sa /signup sa footer */}
            <Link href="/signup" className="hover:text-paper transition-colors">Sign up</Link>
            <span className="text-paper/30">© 2026 Manipu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
