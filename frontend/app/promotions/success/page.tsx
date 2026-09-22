"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Home, Eye, ShieldCheck, Zap, CheckCircle } from "lucide-react";

function PromotionSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "BOOST-PROMO";

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      {/* Decorative Glow */}
      <div className="absolute left-1/2 top-10 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

      {/* Success Icon */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 shadow-xl shadow-emerald-500/10 ring-8 ring-emerald-500/5 dark:bg-emerald-400/10 dark:text-emerald-400">
        <CheckCircle2 className="h-10 w-10 animate-bounce" />
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        Payment Successful
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Your Ad Boost is Confirmed!
      </h1>

      <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
        Thank you! Your payment has been received via PayHere. Your promotion is now queued and activating across search feeds.
      </p>

      {/* Order Badge Box */}
      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500">Order Reference</span>
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            {orderId}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Promotion Status</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" /> Active & Ranked
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/listings"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl"
        >
          <Eye className="h-4 w-4" /> Explore Active Listings
        </Link>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Home className="h-4 w-4" /> Go to Dashboard
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Verified PayHere Transaction</span>
      </div>
    </div>
  );
}

export default function PromotionSuccessPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950">
      <Suspense fallback={<div className="text-slate-500">Loading receipt...</div>}>
        <PromotionSuccessContent />
      </Suspense>
    </div>
  );
}
