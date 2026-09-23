"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Crown,
  Star,
  Flame,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Receipt,
  Zap,
  RotateCw,
  Tag,
  MapPin,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  Layers,
} from "lucide-react";
import type { AdBoost, BoostType } from "@/types/boost";
import type { ListingSubscriptionGroup } from "./ListingPromotionsModal";

interface SubscriptionCardProps {
  group: ListingSubscriptionGroup;
  onOpenReceipt: (orderId?: string | null) => void;
  onOpenPromotionsModal?: (group: ListingSubscriptionGroup) => void;
}

export default function SubscriptionCard({
  group,
  onOpenReceipt,
  onOpenPromotionsModal,
}: SubscriptionCardProps) {
  const [copied, setCopied] = useState(false);

  const hasMultiplePromotions = group.promotions.length > 1;
  const primaryPromotion = group.promotions[0];

  const getBoostTypeDetails = (type: BoostType) => {
    switch (type) {
      case "POWER_PACK":
        return {
          title: "Power Pack",
          subtitle: "Spotlight + Urgent + Push Up VIP Boost",
          icon: Crown,
          accentBg: "bg-purple-500/10 dark:bg-purple-400/10",
          accentText: "text-purple-600 dark:text-purple-400",
          badgeBg: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
          bannerGradient: "from-purple-600 via-indigo-600 to-purple-800",
          glow: "hover:shadow-purple-500/15",
        };
      case "SPOTLIGHT":
        return {
          title: "Spotlight",
          subtitle: "Pinned to top of search results",
          icon: Star,
          accentBg: "bg-amber-500/10 dark:bg-amber-400/10",
          accentText: "text-amber-600 dark:text-amber-400",
          badgeBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
          bannerGradient: "from-amber-500 via-yellow-500 to-amber-600",
          glow: "hover:shadow-amber-500/15",
        };
      case "URGENT":
        return {
          title: "Urgent",
          subtitle: "High-priority red badge & ribbon",
          icon: Flame,
          accentBg: "bg-rose-500/10 dark:bg-rose-400/10",
          accentText: "text-rose-600 dark:text-rose-400",
          badgeBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
          bannerGradient: "from-rose-600 via-red-600 to-rose-700",
          glow: "hover:shadow-rose-500/15",
        };
      case "PUSH_UP":
        return {
          title: "Push Up",
          subtitle: "Refreshed to top of search feeds",
          icon: TrendingUp,
          accentBg: "bg-teal-500/10 dark:bg-teal-400/10",
          accentText: "text-teal-600 dark:text-teal-400",
          badgeBg: "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30",
          bannerGradient: "from-teal-600 via-emerald-600 to-teal-700",
          glow: "hover:shadow-teal-500/15",
        };
      default:
        return {
          title: type,
          subtitle: "Promotional Boost",
          icon: Zap,
          accentBg: "bg-slate-500/10",
          accentText: "text-slate-600",
          badgeBg: "bg-slate-500/15 text-slate-700 border-slate-500/30",
          bannerGradient: "from-slate-700 to-slate-900",
          glow: "",
        };
    }
  };

  const now = new Date().getTime();

  // Find nearest expiring promotion
  const sortedByExpiry = [...group.promotions].sort(
    (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
  );
  const nearestPromotion = sortedByExpiry[0] || primaryPromotion;

  const start = new Date(nearestPromotion.startsAt).getTime();
  const expiry = new Date(nearestPromotion.expiresAt).getTime();
  const isCurrentlyActive = nearestPromotion.boostStatus === "ACTIVE" && now >= start && now <= expiry;
  const isScheduled = nearestPromotion.boostStatus === "SCHEDULED" || (nearestPromotion.boostStatus === "ACTIVE" && now < start);

  let remainingText = "";
  let progressPercentage = 0;

  if (isCurrentlyActive) {
    const remainingMs = expiry - now;
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    remainingText = days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`;
    const totalDuration = expiry - start;
    const elapsed = now - start;
    progressPercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  } else if (isScheduled) {
    const tillStartMs = start - now;
    const days = Math.floor(tillStartMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((tillStartMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    remainingText = days > 0 ? `Starts in ${days}d ${hours}h` : `Starts in ${hours}h`;
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nearestPromotion.orderId) {
      navigator.clipboard.writeText(nearestPromotion.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const typeConfig = getBoostTypeDetails(nearestPromotion.boostType);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90 ${typeConfig.glow}`}
    >
      {/* Top Banner */}
      {hasMultiplePromotions ? (
        /* Multi-Promotion Banner */
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 px-5 py-2.5 text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-300" />
            <span className="text-xs font-black uppercase tracking-wider">
              {group.promotions.length} Active Promotions
            </span>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold">
            Multi-Boosted
          </span>
        </div>
      ) : (
        /* Single Promotion Banner */
        <div
          className={`flex items-center justify-between bg-gradient-to-r ${typeConfig.bannerGradient} px-5 py-2.5 text-white`}
        >
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider">
              {typeConfig.title}
            </span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
              {nearestPromotion.durationDays} Days
            </span>
          </div>

          {isCurrentlyActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              <Clock className="h-3 w-3" /> Scheduled Queue
            </span>
          )}
        </div>
      )}

      <div className="flex-1 p-5">
        {/* Listing Visual Header (Photo + Price + Meta) */}
        <div className="flex gap-4">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
            {group.listingImageUrl ? (
              <Image
                src={group.listingImageUrl}
                alt={group.listingTitle}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100px, 120px"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 p-2 text-center">
                <Tag className="h-6 w-6 mb-1 opacity-50" />
                <span className="text-[10px] font-medium leading-tight">No Photo</span>
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="flex flex-1 flex-col justify-between min-w-0">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                {group.listingCategory && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium dark:bg-slate-800">
                    {group.listingCategory}
                  </span>
                )}
                {group.listingLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {group.listingLocation}
                  </span>
                )}
              </div>

              <Link
                href={`/listings/${group.listingSlug || group.listingId}`}
                className="mt-1.5 block font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 line-clamp-2 transition-colors"
                title={group.listingTitle}
              >
                {group.listingTitle}
              </Link>
            </div>

            {/* Price & Link */}
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {group.listingCurrency || "LKR"}{" "}
                {group.listingPrice !== undefined && group.listingPrice !== null
                  ? group.listingPrice.toLocaleString()
                  : "N/A"}
              </span>

              <Link
                href={`/listings/${group.listingSlug || group.listingId}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
              >
                View Ad <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Promotion Badges row if Multi-Promotions exist */}
        {hasMultiplePromotions && (
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {group.promotions.map((promo) => {
                const pConfig = getBoostTypeDetails(promo.boostType);
                const PIcon = pConfig.icon;
                return (
                  <span
                    key={promo.id}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${pConfig.badgeBg}`}
                  >
                    <PIcon className="h-3 w-3" />
                    <span>{pConfig.title}</span>
                    <span className="opacity-70">({promo.durationDays}d)</span>
                  </span>
                );
              })}
            </div>

            {/* Modal Trigger Button for Multi-Promotions */}
            {onOpenPromotionsModal && (
              <button
                type="button"
                onClick={() => onOpenPromotionsModal(group)}
                className="mt-2.5 flex w-full items-center justify-between rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-emerald-500" />
                  View All {group.promotions.length} Promotion Timelines
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Schedule & Due Date Progress Section */}
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                {hasMultiplePromotions
                  ? `Next expiry: ${remainingText}`
                  : remainingText}
              </span>
            </span>

            {isCurrentlyActive && (
              <span className="font-semibold text-slate-400 text-[11px]">
                {progressPercentage}% elapsed
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {isCurrentlyActive && (
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {/* Due dates */}
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-2.5 text-[11px] dark:border-slate-800">
            <div>
              <span className="text-slate-400 block">Starts</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                {formatDateTime(nearestPromotion.startsAt)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-400 block">
                {hasMultiplePromotions ? "Nearest Due" : "Due Expiry"}
              </span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">
                {formatDateTime(nearestPromotion.expiresAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Order Info & Paid amount snippet */}
        <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">
              {nearestPromotion.orderId || "BOOST-PROMO"}
            </span>
            {nearestPromotion.orderId && (
              <button
                type="button"
                onClick={handleCopyOrder}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Copy Order ID"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          <div className="font-bold text-slate-800 dark:text-slate-200">
            {hasMultiplePromotions ? (
              <span>
                Total: LKR{" "}
                {group.promotions
                  .reduce((sum, p) => sum + (p.amount || 0), 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            ) : (
              <span>
                Paid: {nearestPromotion.currency || "LKR"}{" "}
                {(nearestPromotion.amount || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900/80">
        <button
          type="button"
          onClick={() =>
            hasMultiplePromotions && onOpenPromotionsModal
              ? onOpenPromotionsModal(group)
              : onOpenReceipt(nearestPromotion.orderId || nearestPromotion.id)
          }
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Receipt className="h-3.5 w-3.5 text-slate-500" />
          {hasMultiplePromotions ? "All Receipts" : "Receipt Details"}
        </button>

        <Link
          href={`/listings/${group.listingId}/boost`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>{hasMultiplePromotions ? "Add / Extend Boost" : "Extend Boost"}</span>
        </Link>
      </div>
    </div>
  );
}
