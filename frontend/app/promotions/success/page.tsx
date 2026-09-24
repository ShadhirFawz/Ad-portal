"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Home,
  ShieldCheck,
  CheckCircle,
  Loader2,
  Download,
  Printer,
  FileText,
  Receipt,
} from "lucide-react";
import { confirmBoostPayment } from "@/lib/api/boosts";
import type { AdBoost } from "@/types/boost";
import { useAuth } from "@/providers/AuthProvider";
import { downloadInvoicePdf, printInvoicePdf, generateAndSaveInvoice } from "@/services/invoice-service";

function PromotionSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const paymentId = searchParams.get("payment_id") || searchParams.get("payhere_payment_id") || null;
  const { user } = useAuth();

  const [boost, setBoost] = useState<AdBoost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [invoiceSaved, setInvoiceSaved] = useState(false);

  useEffect(() => {
    async function confirm() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const confirmedBoost = await confirmBoostPayment(orderId, paymentId);
        setBoost(confirmedBoost);

        // Safely generate and archive PDF invoice to Supabase Storage in background
        try {
          await generateAndSaveInvoice(confirmedBoost, user);
          setInvoiceSaved(true);
        } catch (storageErr) {
          console.warn("Invoice archive note:", storageErr);
        }
      } catch (err) {
        console.warn("Payment confirmation notice:", err);
      } finally {
        setLoading(false);
      }
    }

    confirm();
  }, [orderId, paymentId, user]);

  const handleDownloadInvoice = async () => {
    if (!boost) return;
    try {
      setIsGeneratingPdf(true);
      await downloadInvoicePdf(boost, user);
    } catch (err) {
      console.error("Failed to download PDF invoice:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (!boost) return;
    try {
      setIsPrinting(true);
      await printInvoicePdf(boost, user);
    } catch (err) {
      console.error("Failed to print invoice:", err);
    } finally {
      setIsPrinting(false);
    }
  };

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
        Thank you! Your payment has been received and verified. Your promotion is now active across marketplace feeds.
      </p>

      {/* Order Badge Box */}
      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500">Order Reference</span>
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
            {orderId || "BOOST-PROMO"}
          </span>
        </div>

        {boost?.listingTitle && (
          <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500">Listing</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
              {boost.listingTitle}
            </span>
          </div>
        )}

        {boost?.boostType && (
          <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500">Promotion Package</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {boost.boostType.replace("_", " ")} ({boost.durationDays} Days)
            </span>
          </div>
        )}

        {boost?.amount !== undefined && boost?.amount !== null && (
          <div className="flex items-center justify-between border-b border-slate-100 py-3 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500">Amount Paid</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {boost.currency || "LKR"}{" "}
              {Number(boost.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Promotion Status</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-3.5 w-3.5" /> Active & Ranked
              </>
            )}
          </span>
        </div>
      </div>

      {/* PDF Invoice Download & Print Section */}
      {boost && (
        <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4.5 dark:border-slate-800 dark:bg-slate-900/60 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official Proof of Payment
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {invoiceSaved
                    ? "Print-standard PDF invoice archived to Supabase Cloud"
                    : "Official tax invoice with security seals & verification badge"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintInvoice}
                disabled={isPrinting || isGeneratingPdf}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                {isPrinting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Printer className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {boost?.listingSlug || boost?.listingId ? (
          <Link
            href={`/listings/${boost.listingSlug || boost.listingId}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl"
          >
            View Promoted Ad
          </Link>
        ) : (
          <Link
            href="/listings"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl"
          >
            Explore Active Listings
          </Link>
        )}

        <Link
          href="/subscriptions"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Receipt className="h-4 w-4" /> My Subscriptions
        </Link>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Home className="h-4 w-4" /> Dashboard
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

