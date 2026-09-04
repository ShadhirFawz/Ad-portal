"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Listing, ListingCardData } from "@/types/listing";
import type { ListingImage } from "@/types/listing-image";
import { MapPin, Clock, Tag, Gavel, MoreVertical, Bookmark, Loader2 } from "lucide-react";
import { toggleBookmarkListing } from "@/lib/api/listings";
import { useAuth } from "@/providers/AuthProvider";

interface ListingCardProps {
  listing: Listing | ListingCardData;
  href?: string;
  className?: string;
  layout?: "grid" | "row";
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

export default function ListingCard({
  listing,
  href,
  className = "",
  layout = "grid",
}: ListingCardProps) {
  const { accessToken } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    "isBookmarked" in listing ? (listing.isBookmarked ?? false) : false
  );
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
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

  const handleBookmark = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!accessToken) return;
      if (bookmarking) return;
      setMenuOpen(false);
      setBookmarking(true);
      try {
        const idOrSlug = listing.slug || String(listing.id);
        const result = await toggleBookmarkListing(accessToken, idOrSlug);
        setIsBookmarked(result.isBookmarked);
      } catch {
        // silently fail
      } finally {
        setBookmarking(false);
      }
    },
    [accessToken, bookmarking, listing]
  );

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const resolvedPrimaryImage =
    listing.primaryImage?.url
      ? listing.primaryImage
      : listing.images?.find((image: ListingImage) => image.primary) ??
      (listing.images && listing.images.length > 0
        ? [...listing.images].sort(
          (a, b) => a.displayOrder - b.displayOrder
        )[0]
        : null);

  const targetHref = href ?? `/listings/${listing.slug || listing.id}`;

  const formatPrice = () => {
    if (listing.pricingType === "FREE") return "Free";
    if (listing.pricingType === "CONTACT_FOR_PRICE") return "Contact for Price";
    const currency = listing.currency ?? "LKR";
    const formattedAmount =
      typeof listing.price === "number"
        ? listing.price.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
        : listing.price;
    return `${currency} ${formattedAmount}`;
  };

  const formatCondition = (condition?: string) => {
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
  };

  const locationText = [listing.district, listing.province]
    .filter(Boolean)
    .join(", ");

  const conditionLabel = formatCondition(listing.condition);
  const timeAgoStr = formatTimeAgo(
    ("publishedAt" in listing && listing.publishedAt
      ? listing.publishedAt
      : listing.createdAt) as string
  );

  /** Shared dropdown content */
  const MenuDropdown = () => (
    <div className="absolute right-0 top-8 min-w-[140px] rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      {accessToken ? (
        <button
          type="button"
          onClick={handleBookmark}
          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
        >
          <Bookmark
            className={`w-4 h-4 shrink-0 ${
              isBookmarked
                ? "fill-slate-800 text-slate-800 dark:fill-slate-100 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400"
            }`}
          />
          <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
        </button>
      ) : (
        <Link
          href="/auth/login"
          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
        >
          <Bookmark className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Bookmark</span>
        </Link>
      )}
    </div>
  );

  if (layout === "row") {
    return (
      <article
        className={`group relative flex overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-500/30 w-full ${className}`}
      >
        {/* Live Auction Badge - Top Right Corner of Card */}
        {listing.hasActiveAuction && (
          <div className="absolute top-0 right-0 z-20 pointer-events-none">
            <div className="flex items-center gap-1 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg">
              <Gavel className="w-3 h-3 shrink-0" />
              Live Auction
            </div>
          </div>
        )}

        {/* Ellipsis Menu - Row layout */}
        <div
          ref={menuRef}
          className={`absolute z-30 ${listing.hasActiveAuction ? "top-9 right-2" : "top-2 right-2"}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <button
            type="button"
            aria-label="More options"
            onClick={handleMenuToggle}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-600 backdrop-blur-sm shadow-sm transition-all duration-150 hover:bg-white hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            {bookmarking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MoreVertical className="w-3.5 h-3.5" />
            )}
          </button>
          {menuOpen && <MenuDropdown />}
        </div>

        <Link href={targetHref} className="flex w-full">
          {/* Thumbnail Container */}
          <div className="relative shrink-0 w-28 sm:w-36 md:w-40 self-stretch overflow-hidden bg-slate-100 dark:bg-slate-800">
            {resolvedPrimaryImage?.url ? (
              <Image
                src={resolvedPrimaryImage.url}
                alt={listing.title}
                fill
                sizes="(max-width: 640px) 112px, 160px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 p-2 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 stroke-[1.5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">No Photo</span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 pointer-events-none z-10">
              {conditionLabel && (
                <span className="rounded bg-slate-900/85 px-1 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md shadow-xs">
                  {conditionLabel}
                </span>
              )}
              {listing.pricingType === "FREE" && (
                <span className="rounded bg-emerald-600/90 px-1 py-0.5 text-[9px] font-bold text-white backdrop-blur-md shadow-xs">
                  Free
                </span>
              )}
              {listing.negotiable && listing.pricingType !== "FREE" && (
                <span className="rounded bg-emerald-600/90 px-1 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md shadow-xs">
                  Negotiable
                </span>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3 gap-1 min-w-0">
            {/* Top Details */}
            <div className="space-y-0.5 min-w-0">
              {/* Category and Status Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {listing.categoryName && (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-slate-600 dark:text-slate-400 max-w-[140px] truncate">
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{listing.categoryName}</span>
                  </span>
                )}
                {listing.status && listing.status !== "ACTIVE" && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${listing.status === "DRAFT"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : listing.status === "SOLD"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                  >
                    {listing.status}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="line-clamp-1 sm:line-clamp-2 text-xs sm:text-sm font-semibold tracking-tight text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400 leading-snug break-words">
                {listing.title}
              </h3>

              {/* Description */}
              {"description" in listing && listing.description && (
                <p className="line-clamp-1 sm:line-clamp-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug break-words hidden xs:block">
                  {listing.description}
                </p>
              )}
            </div>

            {/* Bottom Row: Price & Metadata */}
            <div className="flex flex-col gap-0.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              {/* Price - Now on its own line */}
              <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatPrice()}
              </span>

              {/* Address and Time - Separate line */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                {locationText ? (
                  <span className="flex items-center gap-0.5 truncate max-w-[160px] sm:max-w-[200px]">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{locationText}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">Nationwide</span>
                )}
                {timeAgoStr && (
                  <span className="flex items-center gap-0.5 shrink-0">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{timeAgoStr}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Grid Layout
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-500/30 h-full w-full ${className}`}
    >
      {/* Ellipsis Menu - Grid layout */}
      <div
        ref={menuRef}
        className="absolute top-2 right-2 z-30"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <button
          type="button"
          aria-label="More options"
          onClick={handleMenuToggle}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-slate-600 backdrop-blur-sm shadow-sm transition-all duration-150 hover:bg-white hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          {bookmarking ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MoreVertical className="w-3.5 h-3.5" />
          )}
        </button>
        {menuOpen && <MenuDropdown />}
      </div>

      <Link href={targetHref} className="flex flex-col h-full">
        {/* Media Thumbnail */}
        <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
          {resolvedPrimaryImage?.url ? (
            <Image
              src={resolvedPrimaryImage.url}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 p-3 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 stroke-[1.5]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 pointer-events-none z-10">
            {conditionLabel && (
              <span className="rounded bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md shadow-xs">
                {conditionLabel}
              </span>
            )}
            {listing.negotiable && listing.pricingType !== "FREE" && (
              <span className="rounded bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md shadow-xs">
                Negotiable
              </span>
            )}
          </div>

          {/* Live Auction Badge */}
          {listing.hasActiveAuction && (
            <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
              <div className="flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-[9px] font-bold text-white shadow-lg backdrop-blur-sm">
                <Gavel className="w-3 h-3 shrink-0" />
                Live Auction
              </div>
            </div>
          )}

          {/* Category Tag */}
          {listing.categoryName && (
            <div className="absolute bottom-2 left-2 pointer-events-none z-10 max-w-[85%]">
              <span className="block truncate rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 backdrop-blur-md shadow-xs dark:bg-slate-950/85 dark:text-slate-300">
                {listing.categoryName}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-3 space-y-1.5">
          <div className="space-y-1">
            {/* Price & Status */}
            <div className="flex items-baseline justify-between gap-1.5">
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
                {formatPrice()}
              </span>
              {listing.status && listing.status !== "ACTIVE" && (
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${listing.status === "DRAFT"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    : listing.status === "SOLD"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                >
                  {listing.status}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 min-h-[2.5rem] text-xs sm:text-sm font-semibold text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400 break-words leading-snug">
              {listing.title}
            </h3>

            {/* Description */}
            {"description" in listing && listing.description && (
              <p className="line-clamp-2 min-h-[2.5rem] text-[11px] text-slate-500 dark:text-slate-400 leading-normal break-words">
                {listing.description}
              </p>
            )}
          </div>

          {/* Footer Metadata - Replaced username with time ago */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400 mt-auto">
            {locationText ? (
              <span className="flex items-center gap-1 truncate max-w-[130px]">
                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">{locationText}</span>
              </span>
            ) : (
              <span className="text-slate-400">Nationwide</span>
            )}
            {timeAgoStr && (
              <span className="flex items-center gap-0.5 shrink-0">
                <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                <span>{timeAgoStr}</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}