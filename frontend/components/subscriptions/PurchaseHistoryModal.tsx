"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Receipt,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  CreditCard,
  Crown,
  Star,
  Flame,
  TrendingUp,
  Download,
  Filter,
  ShieldCheck,
} from "lucide-react";
import type { AdBoost, BoostType } from "@/types/boost";

interface PurchaseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  boosts: AdBoost[];
  selectedOrderId?: string | null;
}

export default function PurchaseHistoryModal({
  isOpen,
  onClose,
  boosts,
  selectedOrderId,
}: PurchaseHistoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "COMPLETED" | "PENDING" | "CANCELLED">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(selectedOrderId || null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter transactions
  const filteredBoosts = boosts.filter((b) => {
    const matchesSearch =
      (b.orderId && b.orderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.listingTitle && b.listingTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.payherePaymentId && b.payherePaymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.boostType && b.boostType.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "COMPLETED") {
      return b.paymentStatus === "COMPLETED" || b.boostStatus === "ACTIVE" || b.boostStatus === "EXPIRED";
    }
    if (statusFilter === "PENDING") {
      return b.paymentStatus === "PENDING" || b.boostStatus === "PENDING_PAYMENT";
    }
    if (statusFilter === "CANCELLED") {
      return b.paymentStatus === "CANCELLED" || b.paymentStatus === "FAILED" || b.boostStatus === "CANCELLED";
    }
    return true;
  });

  // Calculate totals
  const completedBoosts = boosts.filter(
    (b) => b.paymentStatus === "COMPLETED" || b.boostStatus === "ACTIVE" || b.boostStatus === "EXPIRED"
  );
  const totalSpend = completedBoosts.reduce((sum, b) => sum + (b.amount || 0), 0);

  const getBoostTypeInfo = (type: BoostType) => {
    switch (type) {
      case "POWER_PACK":
        return {
          name: "Power Pack",
          icon: Crown,
          color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/30",
        };
      case "SPOTLIGHT":
        return {
          name: "Spotlight",
          icon: Star,
          color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
        };
      case "URGENT":
        return {
          name: "Urgent",
          icon: Flame,
          color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
        };
      case "PUSH_UP":
        return {
          name: "Push Up",
          icon: TrendingUp,
          color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/30",
        };
      default:
        return {
          name: type,
          icon: CreditCard,
          color: "text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/30",
        };
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Purchase History & Invoices
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {boosts.length} {boosts.length === 1 ? "Order" : "Orders"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed transaction records, receipts, and order summaries for ad promotions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Overview Banner inside Modal */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Invested
            </span>
            <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              LKR {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed Orders
            </span>
            <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
              {completedBoosts.length}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Payment Gateway
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Verified PayHere</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID, listing title, or payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { key: "ALL", label: "All" },
                { key: "COMPLETED", label: "Completed" },
                { key: "PENDING", label: "Pending" },
                { key: "CANCELLED", label: "Cancelled" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === filter.key
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Records List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredBoosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                <Receipt className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No purchase records found
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                {searchQuery || statusFilter !== "ALL"
                  ? "Try clearing or adjusting your search filters to find transactions."
                  : "You haven't made any promotion purchases yet. Boost an ad to increase your views and inquiries!"}
              </p>
            </div>
          ) : (
            filteredBoosts.map((boost) => {
              const typeInfo = getBoostTypeInfo(boost.boostType);
              const TypeIcon = typeInfo.icon;
              const isExpanded = expandedOrderId === (boost.orderId || boost.id);

              const isSuccess =
                boost.paymentStatus === "COMPLETED" ||
                boost.boostStatus === "ACTIVE" ||
                boost.boostStatus === "EXPIRED";
              const isPending =
                boost.paymentStatus === "PENDING" || boost.boostStatus === "PENDING_PAYMENT";

              return (
                <div
                  key={boost.id}
                  className={`rounded-2xl border transition-all duration-200 ${
                    isExpanded
                      ? "border-emerald-500/50 bg-emerald-50/20 dark:border-emerald-500/30 dark:bg-emerald-950/10 shadow-md"
                      : "border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Transaction Row Summary */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 cursor-pointer"
                    onClick={() =>
                      setExpandedOrderId(isExpanded ? null : boost.orderId || boost.id)
                    }
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${typeInfo.color}`}
                      >
                        <TypeIcon className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {typeInfo.name} ({boost.durationDays} Days)
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isSuccess
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : isPending
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {isSuccess ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : isPending ? (
                              <Clock className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {boost.paymentStatus || (isSuccess ? "PAID" : "PENDING")}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          Ad: <span className="font-semibold">{boost.listingTitle}</span>
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                          <span>{formatDate(boost.createdAt)}</span>
                          {boost.orderId && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{boost.orderId}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {boost.currency || "LKR"}{" "}
                        {(boost.amount || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                        {isExpanded ? "Hide Details" : "View Receipt"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Receipt Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/60 rounded-b-2xl animate-in slide-in-from-top-1 duration-150">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Order info */}
                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Order Reference</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {boost.orderId || "BOOST-REF"}
                              </span>
                              {boost.orderId && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(boost.orderId!, boost.id);
                                  }}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title="Copy Order ID"
                                >
                                  {copiedId === boost.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {boost.payherePaymentId && (
                            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-slate-800">
                              <span className="text-slate-500 dark:text-slate-400">PayHere Payment ID</span>
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {boost.payherePaymentId}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Transaction Date</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {formatDate(boost.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Payment Method</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {boost.paymentMethod || "PayHere Gateway (Card / Wallet)"}
                            </span>
                          </div>
                        </div>

                        {/* Promotion schedule info */}
                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Promotion Starts</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {formatDate(boost.startsAt)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Promotion Due / Expiry</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {formatDate(boost.expiresAt)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Target Listing</span>
                            <Link
                              href={`/listings/${boost.listingSlug || boost.listingId}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline max-w-[200px] truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {boost.listingTitle} <ExternalLink className="h-3 w-3 shrink-0" />
                            </Link>
                          </div>

                          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Total Charged</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {boost.currency || "LKR"}{" "}
                              {(boost.amount || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom actions on receipt */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          <span>Official Digital Receipt • All taxes included</span>
                        </div>

                        <Link
                          href={`/listings/${boost.listingSlug || boost.listingId}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
                        >
                          View Listing <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/90">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredBoosts.length} of {boosts.length} total records
          </span>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
