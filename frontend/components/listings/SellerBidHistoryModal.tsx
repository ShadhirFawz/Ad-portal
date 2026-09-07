"use client";

import { useEffect, useId } from "react";
import Link from "next/link";
import {
  Gavel,
  Trophy,
  X,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import type { AuctionBidDetail } from "@/types/auction";

interface SellerBidHistoryModalProps {
  open: boolean;
  onClose: () => void;
  bids: AuctionBidDetail[];
  currency?: string;
  listingTitle?: string;
  currentHighestBid?: number | null;
  hasEnded?: boolean;
}

function formatAmount(amount: number | null | undefined, currency = "LKR") {
  if (amount == null) return "—";
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function SellerBidHistoryModal({
  open,
  onClose,
  bids,
  currency = "LKR",
  listingTitle,
  currentHighestBid,
  hasEnded = false,
}: SellerBidHistoryModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const totalBids = bids.length;
  const highestBid =
    currentHighestBid ??
    (bids.length > 0
      ? Math.max(...bids.map((b) => b.amount))
      : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        aria-label="Close bid history dialog"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="relative px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id={titleId}
                  className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  Auction Bid History
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {totalBids} {totalBids === 1 ? "Bid" : "Bids"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {listingTitle ? (
                  <span>
                    Listing: <strong className="font-semibold text-slate-700 dark:text-slate-300">{listingTitle}</strong>
                  </span>
                ) : (
                  "Confidential full bidder list visible only to you as the seller."
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Stats Summary Bar */}
        <div className="px-5 py-3 sm:px-6 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              {hasEnded ? "Winning Bid" : "Current Highest"}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{formatAmount(highestBid, currency)}</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Auction Status
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-sm">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasEnded
                    ? "bg-slate-400"
                    : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span>{hasEnded ? "Closed" : "Active / Live"}</span>
            </div>
          </div>

          <div className="hidden sm:block space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Privacy Mode
            </span>
            <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 text-xs mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Seller-only Access</span>
            </div>
          </div>
        </div>

        {/* Scrollable Bid List */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-3">
          {bids.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Gavel className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No bids recorded yet
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bids submitted by prospective buyers will show up here in real time with their profile details and timestamps.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/60 shadow-xs">
              {bids.map((bid, index) => {
                const profileTarget = bid.bidderUsername
                  ? `/profile/${encodeURIComponent(bid.bidderUsername)}`
                  : bid.bidderId
                    ? `/profile/${encodeURIComponent(bid.bidderId)}`
                    : null;

                const displayName =
                  bid.bidderFirstName ||
                  (bid.bidderUsername ? `@${bid.bidderUsername}` : "Bidder");

                const subtitle =
                  bid.bidderFirstName && bid.bidderUsername
                    ? `@${bid.bidderUsername}`
                    : bid.bidderLastName
                      ? bid.bidderLastName
                      : null;

                const isHighest = bid.isWinning || index === 0;

                return (
                  <div
                    key={bid.bidId}
                    className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isHighest
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {/* Bidder info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5 shrink-0 text-center">
                        #{index + 1}
                      </span>

                      {profileTarget ? (
                        <Link
                          href={profileTarget}
                          className="inline-flex items-center gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition group min-w-0"
                          title={`View ${displayName}'s profile`}
                        >
                          <ProfileAvatar
                            avatarUrl={bid.bidderAvatarUrl}
                            firstName={bid.bidderFirstName}
                            username={bid.bidderUsername}
                            size={36}
                            alt={displayName}
                          />
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                {displayName}
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </div>
                            {subtitle && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                {subtitle}
                              </span>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <div className="inline-flex items-center gap-3 min-w-0">
                          <ProfileAvatar
                            avatarUrl={bid.bidderAvatarUrl}
                            firstName={bid.bidderFirstName}
                            username={bid.bidderUsername}
                            size={36}
                            alt={displayName}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                              {displayName}
                            </span>
                            {subtitle && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                {subtitle}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {isHighest && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md ml-1 shrink-0">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          {hasEnded ? "Winner" : "Highest"}
                        </span>
                      )}
                    </div>

                    {/* Price and Time */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 pl-8 sm:pl-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="whitespace-nowrap">
                          {new Date(bid.placedAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatAmount(bid.amount, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-4">
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Only you can see this complete bidding record.</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
