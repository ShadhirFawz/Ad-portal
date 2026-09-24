"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Layers,
  Crown,
  Star,
  Flame,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Receipt,
  Plus,
  Tag,
  MapPin,
  Copy,
  Check,
  Zap,
  Radio,
  CalendarClock,
} from "lucide-react";
import type { AdBoost, BoostType } from "@/types/boost";

export interface ListingSubscriptionGroup {
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  listingImageUrl?: string | null;
  listingPrice?: number | null;
  listingCurrency?: string | null;
  listingCategory?: string | null;
  listingLocation?: string | null;
  promotions: AdBoost[];
}

interface ListingPromotionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: ListingSubscriptionGroup | null;
  onOpenReceipt: (orderId?: string | null) => void;
}

export default function ListingPromotionsModal({
  isOpen,
  onClose,
  group,
  onOpenReceipt,
}: ListingPromotionsModalProps) {
  const [copiedOrderId, setCopiedOrderId] = React.useState<string | null>(null);

  if (!isOpen || !group) return null;

  const handleCopy = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const getBoostTypeDetails = (type: BoostType) => {
    switch (type) {
      case "POWER_PACK":
        return {
          title: "Power Pack",
          subtitle: "Spotlight + Urgent + Push Up VIP",
          icon: Crown,
          iconColor: "text-purple-600 dark:text-purple-400",
          badgeBg:
            "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60",
        };
      case "SPOTLIGHT":
        return {
          title: "Spotlight",
          subtitle: "Pinned to top of search feeds",
          icon: Star,
          iconColor: "text-amber-500 dark:text-amber-400",
          badgeBg:
            "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
        };
      case "URGENT":
        return {
          title: "Urgent",
          subtitle: "High-priority red badge & ribbon",
          icon: Flame,
          iconColor: "text-rose-600 dark:text-rose-400",
          badgeBg:
            "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60",
        };
      case "PUSH_UP":
        return {
          title: "Push Up",
          subtitle: "Bumped to top of search results",
          icon: TrendingUp,
          iconColor: "text-teal-600 dark:text-teal-400",
          badgeBg:
            "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60",
        };
      default:
        return {
          title: type,
          subtitle: "Promotional Boost",
          icon: Zap,
          iconColor: "text-slate-500 dark:text-slate-400",
          badgeBg:
            "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
        };
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const now = new Date().getTime();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative flex flex-col max-h-[90vh] w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Active Promotions for Listing
                </h2>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {group.promotions.length} Boosts
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All simultaneous promotion packages running on this ad
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

        {/* Listing Anchor Banner inside Modal */}
        <div className="flex items-center gap-4 border-b border-slate-100 bg-slate-50/70 p-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
            {group.listingImageUrl ? (
              <Image
                src={group.listingImageUrl}
                alt={group.listingTitle}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 text-[10px]">
                No Photo
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-sm text-slate-900 dark:text-white">
              {group.listingTitle}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {group.listingCurrency || "LKR"}{" "}
                {group.listingPrice !== undefined && group.listingPrice !== null
                  ? group.listingPrice.toLocaleString()
                  : "N/A"}
              </span>
              {group.listingCategory && (
                <span className="text-slate-400">• {group.listingCategory}</span>
              )}
              {group.listingLocation && (
                <span className="flex items-center gap-0.5 text-slate-400">
                  <MapPin className="h-3 w-3" /> {group.listingLocation}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/listings/${group.listingSlug || group.listingId}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
          >
            View Ad <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Individual Promotions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {group.promotions.map((promo) => {
            const typeInfo = getBoostTypeDetails(promo.boostType);
            const TypeIcon = typeInfo.icon;

            const start = new Date(promo.startsAt).getTime();
            const expiry = new Date(promo.expiresAt).getTime();
            const isActive = promo.boostStatus === "ACTIVE" && now >= start && now <= expiry;
            const isScheduled = promo.boostStatus === "SCHEDULED" || (promo.boostStatus === "ACTIVE" && now < start);

            let remainingText = "";
            let progressPercentage = 0;

            if (isActive) {
              const remainingMs = expiry - now;
              const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
              const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              remainingText = days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`;
              const total = expiry - start;
              const elapsed = now - start;
              progressPercentage = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
            } else if (isScheduled) {
              const tillStart = start - now;
              const days = Math.floor(tillStart / (1000 * 60 * 60 * 24));
              const hours = Math.floor((tillStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              remainingText = days > 0 ? `Starts in ${days}d ${hours}h` : `Starts in ${hours}h`;
            }

            return (
              <div key={promo.id} className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* Promo Header — icon badge + status chip, no gradient */}
                <div className="flex items-center gap-2 px-4 pt-3.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold ${typeInfo.badgeBg}`}
                  >
                    <TypeIcon className={`h-3.5 w-3.5 shrink-0 ${typeInfo.iconColor}`} />
                    <span>{typeInfo.title}</span>
                    <span className="opacity-60 font-normal">· {promo.durationDays}d</span>
                  </span>

                  <div className="ml-auto">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <Radio className="h-3.5 w-3.5 animate-pulse" /> Live Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 dark:border-sky-800/50 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
                        <CalendarClock className="h-3.5 w-3.5" /> Scheduled
                      </span>
                    )}
                  </div>
                </div>

                {/* Promo Body */}
                <div className="p-4 space-y-3 text-xs">
                  {/* Progress & Countdown */}
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{remainingText}</span>
                    </span>
                    {isActive && (
                      <span className="text-slate-400 text-[11px] font-normal">
                        {progressPercentage}% elapsed
                      </span>
                    )}
                  </div>

                  {isActive && (
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  )}

                  {/* Dates Row */}
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Starts</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatDateTime(promo.startsAt)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 block">Due Expiry</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatDateTime(promo.expiresAt)}
                      </span>
                    </div>
                  </div>

                  {/* Order reference & Receipt Action */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Order:</span>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        {promo.orderId || "BOOST-PROMO"}
                      </span>
                      {promo.orderId && (
                        <button
                          type="button"
                          onClick={(e) => handleCopy(promo.orderId!, e)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Copy Order ID"
                        >
                          {copiedOrderId === promo.orderId ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenReceipt(promo.orderId || promo.id);
                      }}
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Receipt className="h-3 w-3" /> View Receipt
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/90">
          <Link
            href={`/listings/${group.listingId}/boost`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Extend / Add Another Boost</span>
          </Link>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
