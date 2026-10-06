"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";
import type { Listing } from "@/types/listing";
import {
  MapPin,
  Clock,
  Bookmark,
  Star,
  Flame,
  Crown,
  Loader2,
  Share2,
  Gavel,
  Check,
  MoreVertical,
} from "lucide-react";
import { toggleBookmarkListing } from "@/lib/api/listings";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import ShareListingModal from "@/components/listings/ShareListingModal";
import VerifiedSellerBadge from "@/components/common/VerifiedSellerBadge";

interface DashboardListingCardProps {
  listing: Listing;
  className?: string;
  layout?: "row" | "grid";
}

/* ── Bookmark cache helpers ────────────────────────────────────────────────
   Stores a local set of bookmarked listing keys so the visual fill survives
   remounts / navigations even when the parent's cached listing object has a
   stale `isBookmarked` value. Server values still take priority when present. */
const BOOKMARK_CACHE_KEY = "wudo_bookmarked_listing_keys";

function getCachedBookmarks(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(BOOKMARK_CACHE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function persistCachedBookmarks(keys: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      BOOKMARK_CACHE_KEY,
      JSON.stringify(Array.from(keys))
    );
  } catch {
    // ignore quota / privacy errors
  }
}

function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

function formatPrice(price: number, currency = "LKR"): string {
  return `${currency} ${Number(price || 0).toLocaleString("en-US")}`;
}

const INVALID_SPEC_VALUES = new Set([
  "true", "false", "yes", "no", "y", "n", "t", "f",
  "has", "got", "present", "available", "is available", "not available",
  "included", "includes", "including", "not included", "exists", "existing",
  "have", "having", "with", "without",
  "none", "nil", "n/a", "na", "null", "undefined", "unknown", "other",
  "any", "all", "not applicable", "not specified", "unspecified",
  "ok", "okay", "good", "fine", "normal", "standard", "default",
  "sample", "test", "demo", "something", "etc", "item", "product", "value",
]);

function isValidSpecValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "boolean" || typeof val === "number") return false;
  if (typeof val !== "string") return false;

  const clean = val.trim();
  if (clean.length < 2 || clean.length > 40) {
    if (!/^[SMLX]$/i.test(clean)) return false;
  }

  const lower = clean.toLowerCase();
  if (INVALID_SPEC_VALUES.has(lower)) return false;
  if (!/\p{L}/u.test(clean)) return false;
  if (/^[^a-zA-Z0-9\p{L}]+$/u.test(clean)) return false;

  return true;
}

function getSpecPills(listing: Listing, maxItems = 3): string[] {
  const customAttrs = listing.customAttributes;
  if (!customAttrs || typeof customAttrs !== "object") return [];

  const entries = Object.entries(customAttrs);
  const result: string[] = [];
  const seen = new Set<string>();

  for (const [key, rawVal] of entries) {
    if (rawVal === null || rawVal === undefined) continue;

    if (typeof rawVal === "boolean") {
      if (rawVal && isValidSpecValue(key)) {
        const cleanKey = key.trim();
        if (!seen.has(cleanKey.toLowerCase())) {
          seen.add(cleanKey.toLowerCase());
          result.push(cleanKey);
        }
      }
      continue;
    }

    if (typeof rawVal === "string" && isValidSpecValue(rawVal)) {
      const cleanVal = rawVal.trim();
      if (!seen.has(cleanVal.toLowerCase())) {
        seen.add(cleanVal.toLowerCase());
        result.push(cleanVal);
      }
    }

    if (result.length >= maxItems) break;
  }

  return result;
}

function formatCondition(condition?: string): string | null {
  switch (condition) {
    case "NEW": return "Brand New";
    case "LIKE_NEW": return "Like New";
    case "GOOD": return "Good";
    case "FAIR": return "Fair";
    case "POOR": return "For Parts";
    case "REFURBISHED": return "Refurbished";
    case "NOT_APPLICABLE": return null;
    default: return condition ?? null;
  }
}

export default function DashboardListingCard({
  listing,
  className = "",
  layout = "row",
}: DashboardListingCardProps) {
  const { user, accessToken } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const listingKey = listing.slug || String(listing.id);

  // Initial bookmark state: prefer the server value when defined,
  // otherwise fall back to the local cache so the fill survives remounts.
  const [bookmarked, setBookmarked] = useState<boolean>(() => {
    if (typeof listing.isBookmarked === "boolean") {
      return listing.isBookmarked;
    }
    return getCachedBookmarks().has(listingKey);
  });
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync bookmark state whenever the listing prop or its server value changes.
  // Also keeps the local cache aligned with the server's truth.
  useEffect(() => {
    if (typeof listing.isBookmarked === "boolean") {
      setBookmarked(listing.isBookmarked);
      const cache = getCachedBookmarks();
      if (listing.isBookmarked) {
        cache.add(listingKey);
      } else {
        cache.delete(listingKey);
      }
      persistCachedBookmarks(cache);
      return;
    }
    // Server did not provide a value — use the cache
    setBookmarked(getCachedBookmarks().has(listingKey));
  }, [listing.id, listing.isBookmarked, listingKey]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleBookmarkToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user || !accessToken) {
        toastError("Sign in Required", "Please log in to save bookmarks.");
        return;
      }

      setBookmarkLoading(true);
      setMenuOpen(false);
      try {
        const res = await toggleBookmarkListing(accessToken, listingKey);
        setBookmarked(res.isBookmarked);

        // Update local cache so the visual survives remounts
        const cache = getCachedBookmarks();
        if (res.isBookmarked) {
          cache.add(listingKey);
        } else {
          cache.delete(listingKey);
        }
        persistCachedBookmarks(cache);

        toastSuccess(
          res.isBookmarked ? "Listing Bookmarked" : "Bookmark Removed",
          res.isBookmarked
            ? "Saved to your bookmarks for quick access."
            : "Removed from your bookmarks."
        );
      } catch (err) {
        toastError(
          "Action Failed",
          err instanceof Error ? err.message : "Failed to update bookmark."
        );
      } finally {
        setBookmarkLoading(false);
      }
    },
    [user, accessToken, listingKey, toastError, toastSuccess]
  );

  const primaryImage =
    listing.primaryImage?.url ||
    (listing.images && listing.images.length > 0
      ? listing.images.find((img) => img.primary)?.url || listing.images[0]?.url
      : null);

  const targetHref = `/listings/${listing.slug || listing.id}`;

  const conditionLabel = formatCondition(listing.condition);
  const specPills = getSpecPills(listing, 3);
  const locationText =
    listing.city || listing.district || listing.province || "Sri Lanka";

  /** Left-side stacked badges on the image (promotion + condition + negotiable) */
  const LeftBadgeStack = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={`absolute ${compact ? "top-1.5 left-1.5" : "top-2 left-2"
        } flex flex-col gap-1 z-10 pointer-events-none max-w-[65%]`}
    >
      {listing.isSpotlight && listing.isUrgent ? (
        <div
          className={`w-fit ${compact ? "px-1.5" : "px-2"
            } py-0.5 rounded-md bg-violet-700 text-white text-[9px] font-extrabold tracking-wide uppercase flex items-center gap-1 shadow-sm border border-violet-400/30`}
        >
          <Crown className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
          <span>Power Pack</span>
        </div>
      ) : listing.isSpotlight ? (
        <div
          className={`w-fit ${compact ? "px-1.5" : "px-2"
            } py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-extrabold tracking-wide uppercase flex items-center gap-1 shadow-sm`}
        >
          <Star className="w-2.5 h-2.5 fill-white" />
          <span>Spotlight</span>
        </div>
      ) : listing.isUrgent ? (
        <div
          className={`w-fit ${compact ? "px-1.5" : "px-2"
            } py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-extrabold tracking-wide uppercase flex items-center gap-1 shadow-sm`}
        >
          <Flame className="w-2.5 h-2.5 fill-white" />
          <span>Urgent</span>
        </div>
      ) : null}

      {conditionLabel && (
        <span className="w-fit rounded bg-slate-900/85 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md shadow-xs">
          {conditionLabel}
        </span>
      )}

      {listing.negotiable && listing.pricingType !== "FREE" && (
        <span className="w-fit rounded bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md shadow-xs">
          Negotiable
        </span>
      )}
    </div>
  );

  /** Grid-only: share + bookmark stacked vertically in the image's top-right */
  const ImageTopRightActions = () => (
    <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShareModalOpen(true);
        }}
        aria-label="Share listing"
        title="Share listing"
        className="p-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 shadow-sm transition-colors cursor-pointer"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={handleBookmarkToggle}
        aria-label={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
        title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
        disabled={bookmarkLoading}
        className="p-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
      >
        {bookmarkLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 dark:text-slate-400" />
        ) : (
          <Bookmark
            className={`w-3.5 h-3.5 ${bookmarked
                ? "fill-slate-800 text-slate-800 dark:fill-slate-100 dark:text-slate-100"
                : ""
              }`}
          />
        )}
      </button>
    </div>
  );

  /** Row-only: dropdown menu content */
  const RowMenuDropdown = () => (
    <div className="absolute right-0 top-8 min-w-[150px] rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(false);
          setShareModalOpen(true);
        }}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60 cursor-pointer"
      >
        <Share2 className="w-4 h-4 shrink-0 text-slate-500 dark:text-slate-400" />
        <span>Share</span>
      </button>

      <button
        type="button"
        onClick={handleBookmarkToggle}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60 cursor-pointer"
      >
        <Bookmark
          className={`w-4 h-4 shrink-0 ${bookmarked
              ? "fill-slate-800 text-slate-800 dark:fill-slate-100 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400"
            }`}
        />
        <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
      </button>
    </div>
  );

  // ── Vertical Grid Layout ─────────────────────────────────────────────────
  if (layout === "grid") {
    return (
      <>
        <Link
          href={targetHref}
          className={`group relative flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-md transition-all duration-200 overflow-hidden h-full ${className}`}
        >
          {/* Top Image */}
          <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={listing.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                <Image
                  src="/Wudo_watermark.png"
                  alt="Wudo"
                  width={160}
                  height={40}
                  priority
                  className="h-10 w-auto object-contain mx-auto opacity-70"
                />
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  No image
                </span>
              </div>
            )}

            <LeftBadgeStack />
            <ImageTopRightActions />

            {listing.hasActiveAuction && (
              <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
                <div className="flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md">
                  <Gavel className="w-2.5 h-2.5 shrink-0" />
                  <span>Auction</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Content Body */}
          <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 gap-2">
            <div className="space-y-1.5">
              <span className="inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md truncate max-w-full">
                {listing.categoryName || "General"}
              </span>

              <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                {listing.title}
              </h3>

              {specPills.length > 0 ? (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {specPills.map((pill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-0.5 rounded bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 px-1.5 py-0.5 text-[9px] font-medium text-slate-700 dark:text-slate-300"
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                      <span className="truncate max-w-[80px]">{pill}</span>
                    </span>
                  ))}
                </div>
              ) : listing.description ? (
                <p className="line-clamp-2 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {listing.description}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5 pt-1 mt-auto">
              {/* Price row + icon-only verified badge (grid) */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {formatPrice(listing.price, listing.currency)}
                </span>
                {listing.sellerRole === "VERIFIED_SELLER" && (
                  <VerifiedSellerBadge size="xs" showText={false} />
                )}
              </div>

              {/* Location & Time Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1 truncate max-w-[55%]">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{locationText}</span>
                </span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatTimeAgo(listing.createdAt)}</span>
                </span>
              </div>
            </div>
          </div>
        </Link>
        <ShareListingModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          listing={listing}
        />
      </>
    );
  }

  // ── Horizontal Row Layout ─────────────────────────────────────────────────
  return (
    <>
      <article
        className={`group relative flex flex-row items-stretch rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 overflow-hidden min-h-[136px] ${className}`}
      >
        {/* Top-right MoreVertical menu (row only) */}
        <div
          ref={menuRef}
          className="absolute top-2 right-2 z-35"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            aria-label="More options"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/85 dark:bg-slate-900/85 text-slate-600 backdrop-blur-sm shadow-sm transition-all duration-150 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer"
          >
            {bookmarkLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MoreVertical className="w-3.5 h-3.5" />
            )}
          </button>
          {menuOpen && <RowMenuDropdown />}
        </div>

        <Link
          href={targetHref}
          className="flex flex-row items-stretch w-full flex-1 min-h-0"
        >
          {/* Left: Rectangular Thumbnail Image */}
          <div className="relative w-32 sm:w-36 shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={listing.title}
                fill
                sizes="(max-width: 768px) 130px, 150px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center">
                <Image
                  src="/Wudo_watermark.png"
                  alt="Wudo"
                  width={160}
                  height={40}
                  priority
                  className="h-8 w-auto object-contain mx-auto opacity-70"
                />
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 opacity-60">
                  No image
                </span>
              </div>
            )}

            <LeftBadgeStack compact />

            {listing.hasActiveAuction && (
              <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none">
                <div className="flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-md">
                  <Gavel className="w-2.5 h-2.5 shrink-0" />
                  <span>Auction</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Content Details */}
          <div className="flex-1 p-2.5 sm:p-3 pr-10 flex flex-col justify-between min-w-0">
            {/* Top: Category + Verified badge (with text) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {listing.categoryName && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                  {listing.categoryName}
                </span>
              )}
              {listing.sellerRole === "VERIFIED_SELLER" && (
                <VerifiedSellerBadge size="xs" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
              {listing.title}
            </h3>

            {/* Spec pill summary or description snippet */}
            {specPills.length > 0 ? (
              <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                {specPills.join(" · ")}
              </p>
            ) : listing.description ? (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {listing.description}
              </p>
            ) : null}

            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {formatPrice(listing.price, listing.currency)}
              </span>
            </div>

            {/* Bottom: Location & Time */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-0.5 border-t border-slate-100 dark:border-slate-800/80">
              <span className="flex items-center gap-1 truncate max-w-[110px]">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{locationText}</span>
              </span>
              <span className="flex items-center gap-0.5 shrink-0">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatTimeAgo(listing.createdAt)}</span>
              </span>
            </div>
          </div>
        </Link>
      </article>
      <ShareListingModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        listing={listing}
      />
    </>
  );
}