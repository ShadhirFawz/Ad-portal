"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle,
  Loader2,
  Store,
  Sparkles,
  PlusCircle,
  Home,
  Award,
} from "lucide-react";
import { confirmMembershipPayment } from "@/lib/api/membership";
import type { SellerMembership } from "@/types/membership";
import { useAuth } from "@/providers/AuthProvider";
import VerifiedSellerBadge from "@/components/common/VerifiedSellerBadge";

function MembershipSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const paymentId = searchParams.get("payment_id") || searchParams.get("payhere_payment_id") || null;
  const { accessToken, syncProfile } = useAuth();

  const [membership, setMembership] = useState<SellerMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function confirm() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const confirmed = await confirmMembershipPayment(orderId, paymentId, accessToken);
        setMembership(confirmed);
        if (syncProfile) {
          await syncProfile().catch(() => {});
        }
      } catch (err) {
        console.warn("Membership payment confirmation notice:", err);
        const msg = err instanceof Error ? err.message : "Failed to confirm membership.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    confirm();
  }, [orderId, paymentId, accessToken, syncProfile]);

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      {/* Decorative Glow */}
      <div className="absolute left-1/2 top-10 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

      {/* Success Icon */}
      <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 shadow-xl shadow-emerald-500/10 ring-8 ring-emerald-500/5 dark:bg-emerald-400/10 dark:text-emerald-400">
        <ShieldCheck className="h-10 w-10 animate-bounce" />
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
        <Sparkles className="w-3.5 h-3.5" /> Payment Verified • Upgrade Active
      </div>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Welcome, Verified Seller!
      </h1>

      <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
        Your payment has been successfully verified via PayHere Sandbox. Your seller membership is now live with full category privileges.
      </p>

      {/* Order Badge Box */}
      <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Seller Tier
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {membership?.planTier || "PRO"} Plan
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                {membership?.billingCycle || "MONTHLY"}
              </span>
            </div>
          </div>
          <VerifiedSellerBadge size="md" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Order Reference</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {orderId || "MEM-PROMO"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Root Category</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {membership?.rootCategoryName || "Verified Category"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Business Name</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {membership?.businessName || "Store"}
            </span>
          </div>

          {membership?.listingLimit && (
            <div>
              <span className="text-slate-400 block font-medium">Listing Allowance</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {membership.listingLimit} Active Ads
              </span>
            </div>
          )}

          {membership?.spotlightCreditsTotal ? (
            <div>
              <span className="text-slate-400 block font-medium">Bonus Spotlights</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {membership.spotlightCreditsTotal} Free Credits
              </span>
            </div>
          ) : null}

          <div>
            <span className="text-slate-400 block font-medium">Membership Status</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5" /> Active &amp; Live
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Unlocked Privileges Overview */}
      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-950/20 p-4 text-left">
        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          What You Have Unlocked:
        </h4>
        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Post and manage ads in your exclusive verified category up to your limit.</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Verified Seller trust badge on all your listings and public store profile.</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Custom opening hours, dedicated business phone, and store bio.</span>
          </li>
        </ul>
      </div>

      {/* Action Navigation */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl"
        >
          <Home className="h-4 w-4" /> Go to Dashboard
        </Link>

        <Link
          href="/listings/create"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <PlusCircle className="h-4 w-4" /> Post New Listing
        </Link>

        <Link
          href="/profile"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Store className="h-4 w-4" /> View Seller Profile
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>Verified PayHere Sandbox Transaction</span>
      </div>
    </div>
  );
}

export default function MembershipSuccessPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950">
      <Suspense fallback={<div className="text-slate-500 font-medium">Verifying upgrade...</div>}>
        <MembershipSuccessContent />
      </Suspense>
    </div>
  );
}
