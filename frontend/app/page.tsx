import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 md:p-16 shadow-2xl border border-slate-700/50">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Next-Gen Classifieds Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Buy & Sell Anything with <span className="gradient-text-primary">Confidence</span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
            Discover thousands of listings from verified users in your local community. Simple, secure, and instant peer-to-peer marketplace.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/register"
              className="btn-primary text-base px-6 py-3.5 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50"
            >
              Post an Ad Free
            </Link>
            <Link
              href="/profile"
              className="btn-outline text-white border-slate-600 hover:bg-slate-800/80 px-6 py-3.5"
            >
              View My Account
            </Link>
          </div>
        </div>

      </section>

      {/* Feature Grid */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-panel p-6 flex flex-col space-y-3 hover:border-emerald-500/40 hover:-translate-y-1 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
            ⚡
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Instant Posting
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Create high-converting ad listings in under 60 seconds with rich media uploads and location tagging.
          </p>
        </div>

        <div className="glass-panel p-6 flex flex-col space-y-3 hover:border-emerald-500/40 hover:-translate-y-1 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl">
            🛡️
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Verified Profiles
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Trade with peace of mind. User identity, email, and phone verification ensure trusted transactions.
          </p>
        </div>

        <div className="glass-panel p-6 flex flex-col space-y-3 hover:border-emerald-500/40 hover:-translate-y-1 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xl">
            📍
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Local Discovery
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Filter items near your city or neighborhood with smart location tags and interactive categories.
          </p>
        </div>

      </section>

    </main>
  );
}
