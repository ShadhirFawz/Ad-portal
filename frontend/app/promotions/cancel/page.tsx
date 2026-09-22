"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCcw, Home, HelpCircle } from "lucide-react";

function PromotionCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="relative mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      {/* Cancel Icon */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 shadow-xl shadow-rose-500/10 ring-8 ring-rose-500/5 dark:bg-rose-400/10 dark:text-rose-400">
        <XCircle className="h-10 w-10" />
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Payment Was Cancelled
      </h1>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        Your payment session was cancelled or was not completed. No charges have been applied to your account.
      </p>

      {orderId && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Order reference: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{orderId}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/listings"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <RefreshCcw className="h-4 w-4" /> Try Again from Listings
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Home className="h-4 w-4" /> Return to Home
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <HelpCircle className="h-4 w-4" />
        <span>Need help with PayHere payments? Contact support</span>
      </div>
    </div>
  );
}

export default function PromotionCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950">
      <Suspense fallback={<div className="text-slate-500">Loading details...</div>}>
        <PromotionCancelContent />
      </Suspense>
    </div>
  );
}
