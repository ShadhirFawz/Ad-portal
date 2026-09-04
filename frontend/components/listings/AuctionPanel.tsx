"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Gavel,
  Loader2,
  Timer,
  Trophy,
  Users,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  TrendingUp,
  Shield,
  Flame,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getAuction,
  getAuctionSellerView,
  placeBid,
  startAuction,
} from "@/lib/api/auction";
import ProfileAvatar, {
  ParticipantAvatarGroup,
} from "@/components/profile/ProfileAvatar";
import type {
  AuctionPublicResponse,
  AuctionSellerResponse,
} from "@/types/auction";
import type { Listing } from "@/types/listing";

interface AuctionPanelProps {
  listingId: string;
  listing: Listing;
  isOwner: boolean;
  authLoading?: boolean;
  accessToken?: string | null;
  onLoginRequired?: () => void;
}

function normalizeId(id: string | undefined | null) {
  return id?.trim().toLowerCase() ?? "";
}

export function isAuctionEligible(listing: Listing) {
  if (
    listing.pricingType === "FREE" ||
    listing.pricingType === "CONTACT_FOR_PRICE"
  ) {
    return false;
  }

  return listing.negotiable || listing.pricingType === "NEGOTIABLE";
}

function formatAmount(amount: number | null | undefined, currency = "LKR") {
  if (amount == null) return "—";
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function useCountdown(endsAt: string | null, hasEnded: boolean) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!endsAt || hasEnded) {
      setRemainingMs(0);
      return;
    }

    const targetEndsAt = endsAt;

    function tick() {
      const diff = new Date(targetEndsAt).getTime() - Date.now();
      setRemainingMs(Math.max(0, diff));
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt, hasEnded]);

  return useMemo(() => {
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds, isExpired: remainingMs <= 0 };
  }, [remainingMs]);
}

function SellerBidTable({
  bids,
  currency,
}: {
  bids: AuctionSellerResponse["bids"];
  currency: string;
}) {
  if (bids.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No bids received yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-950/50 text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 font-semibold">Bidder</th>
            <th className="px-4 py-3 font-semibold">Amount</th>
            <th className="px-4 py-3 font-semibold">Time</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid) => {
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

            const bidderCardContent = (
              <>
                <ProfileAvatar
                  avatarUrl={bid.bidderAvatarUrl}
                  firstName={bid.bidderFirstName}
                  username={bid.bidderUsername}
                  size={28}
                  alt={displayName}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {displayName}
                  </span>
                  {subtitle && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate -mt-0.5">
                      {subtitle}
                    </span>
                  )}
                </div>
                {bid.isWinning && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 px-1.5 py-0.5 rounded-md ml-1 shrink-0"
                    title="Highest / Winning Bid"
                  >
                    <Trophy className="w-3 h-3 text-amber-500" />
                    Winner
                  </span>
                )}
              </>
            );

            return (
              <tr
                key={bid.bidId}
                className={`border-t border-slate-100 dark:border-slate-800 ${
                  bid.isWinning
                    ? "bg-emerald-50/60 dark:bg-emerald-950/25"
                    : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                } transition-colors`}
              >
                <td className="px-4 py-3">
                  {profileTarget ? (
                    <Link
                      href={profileTarget}
                      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/50 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all group max-w-full shadow-2xs cursor-pointer"
                      title={`View ${displayName}'s profile`}
                    >
                      {bidderCardContent}
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 max-w-full">
                      {bidderCardContent}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {formatAmount(bid.amount, currency)}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                  {new Date(bid.placedAt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AuctionPanel({
  listingId,
  listing,
  isOwner,
  authLoading = false,
  accessToken,
  onLoginRequired,
}: AuctionPanelProps) {
  const eligible = isAuctionEligible(listing);
  const isLoggedIn = Boolean(accessToken);

  const [auction, setAuction] = useState<AuctionPublicResponse | null>(null);
  const [sellerView, setSellerView] = useState<AuctionSellerResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showBidHistory, setShowBidHistory] = useState(false);

  const floorPrice =
    listing.minimumOfferPrice != null
      ? listing.minimumOfferPrice
      : listing.price;

  const loadAuction = useCallback(async () => {
    if (authLoading) {
      return;
    }

    try {
      setError(null);
      const publicData = await getAuction(listingId, accessToken);
      setAuction(publicData);

      if (isOwner && accessToken && publicData) {
        const sellerData = await getAuctionSellerView(listingId, accessToken);
        setSellerView(sellerData);
      } else {
        setSellerView(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load auction details."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, authLoading, isOwner, listingId]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    setLoading(true);
    loadAuction();
  }, [authLoading, loadAuction]);

  const hasEnded = auction?.hasEnded ?? false;
  const isActive = auction?.status === "ACTIVE" && !hasEnded;
  const countdown = useCountdown(auction?.endsAt ?? null, hasEnded);

  async function handleStartAuction() {
    if (!accessToken) {
      onLoginRequired?.();
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      const started = await startAuction(listingId, accessToken);
      setAuction(started);
      const sellerData = await getAuctionSellerView(listingId, accessToken);
      setSellerView(sellerData);
      setSuccessMessage("24-hour auction started successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start auction."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePlaceBid() {
    if (!accessToken) {
      onLoginRequired?.();
      return;
    }

    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid bid amount.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      await placeBid(listingId, amount, accessToken);
      setBidAmount("");
      setSuccessMessage("Bid placed successfully.");
      await loadAuction();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid.");
    } finally {
      setActionLoading(false);
    }
  }

  // Hide from visitors when there is nothing to show yet.
  if (!authLoading && !isOwner && !auction) {
    return null;
  }

  if (authLoading || loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-center gap-3 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Loading auction...
          </span>
        </div>
      </div>
    );
  }

  if (!auction && isOwner && !eligible) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-900/80 border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Gavel className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Auction
          </h3>
          <span className="ml-auto text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Inactive
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          Enable negotiable pricing or switch to Negotiable to start an auction.
        </p>
        <Link
          href={`/listings/${listing.id}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium transition border border-emerald-200 dark:border-emerald-800"
        >
          Edit Listing
        </Link>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/30 dark:to-slate-900/80 border border-amber-200/60 dark:border-amber-800/40 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Start Auction
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          Launch a 24-hour auction. Starting bid:{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {formatAmount(floorPrice, listing.currency)}
          </span>
        </p>
        {error && (
          <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-lg mb-3">
            {error}
          </div>
        )}
        <button
          type="button"
          onClick={handleStartAuction}
          disabled={actionLoading || listing.status !== "ACTIVE"}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-60 text-white text-sm font-semibold transition-all shadow-sm hover:shadow"
        >
          {actionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Gavel className="w-4 h-4" />
              Start 24-Hour Auction
            </>
          )}
        </button>
        {listing.status !== "ACTIVE" && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 text-center">
            Only active listings can start an auction.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/90 dark:to-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header with live indicator */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isActive
              ? 'bg-emerald-100 dark:bg-emerald-900/50'
              : hasEnded
                ? 'bg-slate-100 dark:bg-slate-800'
                : 'bg-amber-100 dark:bg-amber-900/50'
              }`}>
              <Gavel className={`w-4 h-4 ${isActive
                ? 'text-emerald-600 dark:text-emerald-400'
                : hasEnded
                  ? 'text-slate-500 dark:text-slate-400'
                  : 'text-amber-600 dark:text-amber-400'
                }`} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                {hasEnded ? "Auction Ended" : "Live Auction"}
              </h3>
              {isActive && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    Bidding open
                  </span>
                </div>
              )}
            </div>
          </div>

          {isActive && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
              <Timer className="w-3 h-3 text-amber-500" />
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {String(countdown.hours).padStart(2, "0")}:
                {String(countdown.minutes).padStart(2, "0")}:
                {String(countdown.seconds).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-3">
        {/* Hero price area */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                {hasEnded ? (
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Flame className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {hasEnded ? "Winning Bid" : "Current Highest"}
                </p>
              </div>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {formatAmount(auction.currentHighestBid, listing.currency)}
              </p>
            </div>
            {auction.participantCount > 0 && (
              <div className="text-right space-y-1.5">
                <div className="flex items-center gap-1 justify-end">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {auction.participantCount}
                  </span>
                </div>
                <div className="flex justify-end">
                  <ParticipantAvatarGroup
                    participants={auction.latestBidders.map((bidder) => ({
                      id: bidder.bidderId,
                      avatarUrl: bidder.avatarUrl,
                      initial: bidder.initial,
                    }))}
                    totalCount={auction.participantCount}
                    size={28}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
              Minimum Bid
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {formatAmount(
                auction.currentHighestBid != null
                  ? auction.currentHighestBid
                  : floorPrice,
                listing.currency
              )}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
              {hasEnded ? "Total Bids" : "Bids"}
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {auction.participantCount}
            </p>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {successMessage}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}

        {/* Bid section */}
        {isActive && !isOwner && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
            {isLoggedIn ? (
              <>
                {auction.userHasBid && auction.userCurrentBid != null && (
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Your current bid:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {formatAmount(auction.userCurrentBid, listing.currency)}
                    </span>
                    <span className="text-emerald-500">●</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Leading
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
                      {listing.currency}
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`${formatAmount(
                        auction.currentHighestBid ?? floorPrice,
                        ''
                      ).trim()}`}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePlaceBid}
                    disabled={actionLoading || !bidAmount}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm hover:shadow"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Gavel className="w-3.5 h-3.5" />
                        Bid
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                  Enter amount above minimum to place your bid
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Sign in to join this auction
                </p>
                <button
                  type="button"
                  onClick={onLoginRequired}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow"
                >
                  <Users className="w-3.5 h-3.5" />
                  Sign in to Bid
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ended state */}
        {hasEnded && (
          <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/30 p-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Auction closed
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {auction.participantCount} participant{auction.participantCount === 1 ? "" : "s"} joined this auction.
            </p>
          </div>
        )}

        {/* Seller bid history */}
        {isOwner && sellerView && sellerView.bids.length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowBidHistory(!showBidHistory)}
              className="w-full flex items-center justify-between py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors border-t border-slate-100 dark:border-slate-800 pt-3"
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Bid History ({sellerView.bids.length})
              </span>
              {showBidHistory ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {showBidHistory && (
              <div className="mt-2">
                <SellerBidTable bids={sellerView.bids} currency={listing.currency} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export helper for tests or page-level checks
export { normalizeId };