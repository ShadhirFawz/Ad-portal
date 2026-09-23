"use client";

import React from "react";
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
} from "lucide-react";
import type { AdBoost, BoostType } from "@/types/boost";

interface SubscriptionCardProps {
  boost: AdBoost;
  onOpenReceipt: (orderId?: string | null) => void;
}

export default function SubscriptionCard({
  boost,
  onOpenReceipt,
}: SubscriptionCardProps) {
  const getBoostTypeDetails = (type: BoostType) => {
    switch (type) {
      case "POWER_PACK":
        return {
          title: "Power Pack",
          subtitle: "Spotlight + Urgent + Push Up VIP Boost",
          icon: Crown,
          accentBg: "bg-purple-500/10 dark:bg-purple-400/10",
          accentText: "text-purple-600 dark:text-purple-400",
          accentBorder: "border-purple-500/30",
          badgeBg: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
          glow: "hover:shadow-purple-500/10",
        };
      case "SPOTLIGHT":
        return {
          title: "Spotlight",
          subtitle: "Top-of-feed pinned placement",
          icon: Star,
          accentBg: "bg-amber-500/10 dark:bg-amber-400/10",
          accentText: "text-amber-600 dark:text-amber-400",
          accentBorder: "border-amber-500/30",
          badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
          glow: "hover:shadow-amber-500/10",
        };
      case "URGENT":
        return {
          title: "Urgent",
          subtitle: "High-priority red badge & highlight",
          icon: Flame,
          accentBg: "bg-rose-500/10 dark:bg-rose-400/10",
          accentText: "text-rose-600 dark:text-rose-400",
          accentBorder: "border-rose-500/30",
          badgeBg: "bg-gradient-to-r from-rose-600 to-red-600 text-white",
          glow: "hover:shadow-rose-500/10",
        };
      case "PUSH_UP":
        return {
          title: "Push Up",
          subtitle: "Refreshed to top of search results",
          icon: TrendingUp,
          accentBg: "bg-teal-500/10 dark:bg-teal-400/10",
          accentText: "text-teal-600 dark:text-teal-400",
          accentBorder: "border-teal-500/30",
          badgeBg: "bg-gradient-to-r from-teal-600 to-emerald-600 text-white",
          glow: "hover:shadow-teal-500/10",
        };
      default:
        return {
          title: type,
          subtitle: "Promotional Boost",
          icon: Zap,
          accentBg: "bg-slate-500/10",
          accentText: "text-slate-600 dark:text-slate-400",
          accentBorder: "border-slate-500/30",
          badgeBg: "bg-slate-800 text-white",
          glow: "",
        };
    }
  };

  const typeConfig = getBoostTypeDetails(boost.boostType);
  const TypeIcon = typeConfig.icon;

  // Calculate remaining time and progress
  const now = new Date().getTime();
  const start = new Date(boost.startsAt).getTime();
  const expiry = new Date(boost.expiresAt).getTime();
  const isCurrentlyActive = boost.boostStatus === "ACTIVE" && now >= start && now <= expiry;
  const isScheduled = boost.boostStatus === "SCHEDULED" || (boost.boostStatus === "ACTIVE" && now < start);
  const isExpired = boost.boostStatus === "EXPIRED" || (boost.boostStatus === "ACTIVE" && now > expiry);

  let remainingText = "";
  let progressPercentage = 0;

  if (isCurrentlyActive) {
    const remainingMs = expiry - now;
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      remainingText = `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      remainingText = `${hours}h ${minutes}m remaining`;
    } else {
      const minutes = Math.max(1, Math.floor(remainingMs / (1000 * 60)));
      remainingText = `${minutes}m remaining (expiring soon)`;
    }

    const totalDuration = expiry - start;
    const elapsed = now - start;
    progressPercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  } else if (isScheduled) {
    const tillStartMs = start - now;
    const days = Math.floor(tillStartMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((tillStartMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    remainingText = days > 0 ? `Starts in ${days}d ${hours}h` : `Starts in ${hours}h`;
  } else if (isExpired) {
    remainingText = "Completed / Expired";
    progressPercentage = 100;
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

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90 ${typeConfig.glow}`}
    >
      {/* Top row: Boost type badge & Status */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${typeConfig.accentBorder} ${typeConfig.accentBg} ${typeConfig.accentText}`}
            >
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {typeConfig.title}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {boost.durationDays} Days
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{typeConfig.subtitle}</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div>
            {isCurrentlyActive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Active
              </span>
            ) : isScheduled ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                <Clock className="h-3 w-3" /> Scheduled
              </span>
            ) : isExpired ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                <CheckCircle2 className="h-3 w-3" /> Expired
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                <XCircle className="h-3 w-3" /> {boost.boostStatus}
              </span>
            )}
          </div>
        </div>

        {/* Listing Title & Link */}
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-900/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Promoted Listing
          </span>
          <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
            {boost.listingTitle}
          </h3>
          <Link
            href={`/listings/${boost.listingSlug || boost.listingId}`}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View Live Listing <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Schedule & Due Date Information */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5" /> Start Date
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatDateTime(boost.startsAt)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5" /> Expiry Due Date
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatDateTime(boost.expiresAt)}
            </span>
          </div>

          {/* Progress / Remaining Time bar if active */}
          {isCurrentlyActive && (
            <div className="mt-3 pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">{remainingText}</span>
                <span className="text-slate-400">{progressPercentage}% elapsed</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {isScheduled && (
            <div className="mt-2 rounded-xl bg-sky-500/10 p-2.5 text-center text-xs font-semibold text-sky-700 dark:text-sky-300">
              {remainingText}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onOpenReceipt(boost.orderId || boost.id)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Receipt className="h-3.5 w-3.5 text-slate-500" />
          Receipt / Order
        </button>

        <Link
          href={`/listings/${boost.listingId}/boost`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {isExpired ? "Boost Again" : "Extend Boost"}
        </Link>
      </div>
    </div>
  );
}
