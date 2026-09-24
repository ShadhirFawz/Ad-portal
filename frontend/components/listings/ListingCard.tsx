"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import type { Listing, ListingCardData } from "@/types/listing";
import type { ListingImage } from "@/types/listing-image";
import {
  MapPin,
  Clock,
  Tag,
  Gavel,
  MoreVertical,
  Bookmark,
  Loader2,
  Phone,
  MessageCircle,
  ArrowRight,
  Flame,
  Check,
  ArrowUpCircle,
} from "lucide-react";
import { toggleBookmarkListing } from "@/lib/api/listings";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import {
  SpotlightBadge,
  UrgentBadge,
  PushUpBadge,
  PowerPackBadge,
  UrgentRibbonBadge,
} from "@/components/listings/BoostBadge";

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

function getSpecPills(listing: Listing | ListingCardData, maxItems = 4): string[] {
  const customAttrs = "customAttributes" in listing ? listing.customAttributes : undefined;
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

function getSpecsSummary(listing: Listing | ListingCardData, maxItems = 4): string | null {
  const customAttrs = "customAttributes" in listing ? listing.customAttributes : undefined;
  if (!customAttrs || typeof customAttrs !== "object") return null;

  const entries = Object.entries(customAttrs);
  if (entries.length === 0) return null;

  const values: string[] = [];
  const seen = new Set<string>();

  for (const [key, rawVal] of entries) {
    if (rawVal === null || rawVal === undefined) continue;

    if (typeof rawVal === "boolean") {
      if (rawVal && isValidSpecValue(key)) {
        const cleanKey = key.trim();
        const lowerKey = cleanKey.toLowerCase();
        if (!seen.has(lowerKey)) {
          seen.add(lowerKey);
          values.push(cleanKey);
        }
      }
      continue;
    }

    if (Array.isArray(rawVal)) {
      const validArrayItems = rawVal
        .map((v) => (v !== null && v !== undefined ? String(v).trim() : ""))
        .filter((s) => isValidSpecValue(s));

      for (const item of validArrayItems) {
        const lower = item.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          values.push(item);
          if (values.length >= maxItems) break;
        }
      }
      continue;
    }

    if (typeof rawVal === "object") continue;

    if (!isValidSpecValue(rawVal)) continue;

    const cleanVal = String(rawVal).trim();
    const lowerVal = cleanVal.toLowerCase();

    if (!seen.has(lowerVal)) {
      seen.add(lowerVal);
      values.push(cleanVal);
    }

    if (values.length >= maxItems) break;
  }

  if (values.length === 0) return null;
  return values.join(" | ");
}

export default function ListingCard({
  listing,
  href,
  className = "",
  layout = "grid",
}: ListingCardProps) {
  const { accessToken } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(
    "isBookmarked" in listing ? Boolean(listing.isBookmarked) : false
  );
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsBookmarked("isBookmarked" in listing ? Boolean(listing.isBookmarked) : false);
  }, [listing.id, (listing as Listing).isBookmarked]);

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
      const prev = isBookmarked;
      try {
        const idOrSlug = listing.slug || String(listing.id);
        const result = await toggleBookmarkListing(accessToken, idOrSlug);
        setIsBookmarked(result.isBookmarked);
        if (result.isBookmarked) {
          toastSuccess("Bookmark Saved", "Listing saved to your bookmarks.");
        } else {
          toastSuccess("Bookmark Removed", "Listing removed from your bookmarks.");
        }
      } catch {
        setIsBookmarked(prev);
        toastError("Action Failed", "Could not update bookmark.");
      } finally {
        setBookmarking(false);
      }
    },
    [accessToken, bookmarking, listing, isBookmarked, toastSuccess, toastError]
  );

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  // Compile sorted list of image URLs
  const sortedImages: string[] =
    listing.images && listing.images.length > 0
      ? [...listing.images]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((img: ListingImage) => img.url)
        .filter(Boolean)
      : listing.primaryImage?.url
        ? [listing.primaryImage.url]
        : [];

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
  const specsSummary = getSpecsSummary(listing);
  const specPills = getSpecPills(listing, 4);
  const timeAgoStr = formatTimeAgo(
    ("publishedAt" in listing && listing.publishedAt
      ? listing.publishedAt
      : listing.createdAt) as string
  );

  const isPowerPack = Boolean(listing.isSpotlight && listing.isUrgent && listing.isPushedUp);
  const isSpotlight = Boolean(listing.isSpotlight);
  const isUrgent = Boolean(listing.isUrgent);
  const isPushedUp = Boolean(listing.isPushedUp);

  // Spotlight hover scrub reveals 2nd image on hover
  const activeSpotlightPhoto =
    isSpotlight && isHovered && sortedImages.length > 1
      ? sortedImages[1]
      : sortedImages[0] ?? null;

  /** Shared dropdown content */
  const MenuDropdown = () => (
    <div className="absolute right-0 top-8 min-w-[140px] rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800 z-50">
      {accessToken ? (
        <button
          type="button"
          onClick={handleBookmark}
          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
        >
          <Bookmark
            className={`w-4 h-4 shrink-0 ${isBookmarked
              ? "fill-slate-800 text-slate-800 dark:fill-slate-100 dark:text-slate-100"
              : "text-slate-500 dark:text-slate-400"
              }`}
          />
          <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
        </button>
      ) : (
        <Link
          href={`/login?redirect=${encodeURIComponent(targetHref)}`}
          className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60"
        >
          <Bookmark className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Bookmark</span>
        </Link>
      )}
    </div>
  );

  // Power pack card
  if (isPowerPack) {
    const mainPhoto = sortedImages[0] ?? null;
    const secondPhoto = sortedImages[1] ?? null;
    const thirdPhoto = sortedImages[2] ?? null;
    const remainingCount = sortedImages.length > 3 ? sortedImages.length - 3 : 0;

    return (
      <article
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 w-full col-span-2 sm:col-span-2 md:col-span-2 xl:col-span-2 border-violet-400/90 dark:border-violet-500/80 bg-white dark:bg-slate-900 shadow-xl shadow-violet-500/10 hover:shadow-violet-500/25 hover:border-violet-500 ring-1 ring-violet-400/30 ${className}`}
      >
        {/* Top Power Pack Banner */}
        <PowerPackBadge />

        {/* Ellipsis Menu */}
        <div
          ref={menuRef}
          className="absolute top-10 right-2 z-35"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            aria-label="More options"
            onClick={handleMenuToggle}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur-md shadow-sm transition-all hover:bg-slate-900 hover:scale-105"
          >
            {bookmarking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <MoreVertical className="w-3.5 h-3.5" />
            )}
          </button>
          {menuOpen && <MenuDropdown />}
        </div>

        {/* Card Body with Multi-Photo Collage */}
        <div className="flex flex-col lg:flex-row flex-1">
          {/* Multi-Photo Collage Section */}
          <Link
            href={targetHref}
            className="relative lg:w-[54%] shrink-0 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden"
          >
            {sortedImages.length >= 3 ? (
              // 3-Image Mosaic Collage
              <div className="grid grid-cols-3 gap-1 h-56 sm:h-64 lg:h-full min-h-[220px] p-1 bg-slate-900/10 dark:bg-slate-950">
                {/* Main Hero Photo (2/3 width) */}
                <div className="relative col-span-2 h-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                  {mainPhoto && (
                    <Image
                      src={mainPhoto}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 1024px) 70vw, 35vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-102"
                      priority
                    />
                  )}
                  {/* Meta Label on Hero */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
                    {conditionLabel && (
                      <span className="rounded-md bg-slate-900/85 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                        {conditionLabel}
                      </span>
                    )}
                    {listing.negotiable && listing.pricingType !== "FREE" && (
                      <span className="rounded-md bg-emerald-600/95 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Stacked 2 Photos */}
                <div className="flex flex-col gap-1 h-full">
                  <div className="relative flex-1 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {secondPhoto && (
                      <Image
                        src={secondPhoto}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 30vw, 15vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="relative flex-1 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {thirdPhoto && (
                      <Image
                        src={thirdPhoto}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 30vw, 15vw"
                        className="object-cover"
                      />
                    )}
                    {remainingCount > 0 && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        +{remainingCount} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : sortedImages.length === 2 ? (
              // 2-Image Split Collage
              <div className="grid grid-cols-2 gap-1 h-56 sm:h-64 lg:h-full min-h-[220px] p-1 bg-slate-900/10 dark:bg-slate-950">
                <div className="relative h-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                  {mainPhoto && (
                    <Image
                      src={mainPhoto}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-102"
                      priority
                    />
                  )}
                  {conditionLabel && (
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      <span className="rounded-md bg-slate-900/85 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                        {conditionLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div className="relative h-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                  {secondPhoto && (
                    <Image
                      src={secondPhoto}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
            ) : (
              // Single Hero Photo
              <div className="relative h-56 sm:h-64 lg:h-full min-h-[220px] overflow-hidden bg-slate-200 dark:bg-slate-800">
                {mainPhoto ? (
                  <Image
                    src={mainPhoto}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-102"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <Tag className="h-10 w-10 opacity-40" />
                  </div>
                )}
                {conditionLabel && (
                  <div className="absolute top-2 left-2 z-10 pointer-events-none">
                    <span className="rounded-md bg-slate-900/85 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-sm">
                      {conditionLabel}
                    </span>
                  </div>
                )}
              </div>
            )}
          </Link>

          {/* Details & In-Feed Action Controls */}
          <div className="lg:w-[46%] p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              {/* Category Tag & Live Auction */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {listing.categoryName && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-violet-700 dark:text-violet-300">
                    <Tag className="w-3 h-3 text-violet-500 shrink-0" />
                    <span className="truncate max-w-[160px]">{listing.categoryName}</span>
                  </span>
                )}
                {listing.hasActiveAuction && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    <Gavel className="w-3 h-3 shrink-0" />
                    Live Auction
                  </span>
                )}
              </div>

              {/* Title */}
              <Link href={targetHref} className="block group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug break-words line-clamp-2">
                  {listing.title}
                </h3>
              </Link>

              {/* Spec Pill Tags */}
              {specPills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {specPills.map((pill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-200"
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                      <span>{pill}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Description Snippet */}
              {"description" in listing && listing.description && (
                <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
                  {listing.description}
                </p>
              )}
            </div>

            {/* Price & In-Feed Action Buttons */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatPrice()}
                </span>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                  {locationText && (
                    <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{locationText}</span>
                    </span>
                  )}
                  {timeAgoStr && (
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{timeAgoStr}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* In-Feed Direct Actions: Call, WhatsApp, View */}
              <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                {listing.sellerPhoneNumber && (
                  <a
                    href={`tel:${listing.sellerPhoneNumber}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
                    title="Call Seller directly"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Call</span>
                  </a>
                )}

                {listing.sellerWhatsappNumber && (
                  <a
                    href={`https://wa.me/${listing.sellerWhatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-xs"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <Link
                  href={targetHref}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white transition shadow-md shadow-violet-500/20"
                >
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Row Layout
  if (layout === "row") {
    const rowCardTheme = isSpotlight
      ? "border-amber-400/90 dark:border-amber-500/80 bg-amber-50 dark:bg-slate-900/90 shadow-md shadow-amber-500/10 hover:border-amber-500 hover:shadow-amber-500/20 ring-1 ring-amber-400/40"
      : isUrgent
        ? "border-rose-400/90 dark:border-rose-500/80 bg-rose-50 dark:bg-slate-900/90 shadow-md shadow-rose-500/10 hover:border-rose-500 hover:shadow-rose-500/20 ring-1 ring-rose-400/40"
        : isPushedUp
          ? "border-emerald-400/90 dark:border-emerald-500/80 bg-emerald-50 dark:bg-slate-900/90 shadow-md shadow-emerald-500/10 hover:border-emerald-500 hover:shadow-emerald-500/20 ring-1 ring-emerald-400/40"
          : "border-slate-200/80 bg-white hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-500/30";

    return (
      <article
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-300 w-full ${rowCardTheme} ${className}`}
      >
        {/* Spotlight corner ribbon */}
        {listing.isSpotlight && <SpotlightBadge />}

        {/* Live Auction Badge */}
        {listing.hasActiveAuction && (
          <div className="absolute top-0 right-0 z-20 pointer-events-none">
            <div className="flex items-center gap-1 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg">
              <Gavel className="w-3 h-3 shrink-0" />
              Live Auction
            </div>
          </div>
        )}

        {/* Ellipsis Menu */}
        <div
          ref={menuRef}
          className={`absolute z-30 ${listing.hasActiveAuction ? "top-9 right-2" : "top-2 right-2"
            }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
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

        <Link href={targetHref} className="flex w-full flex-1 min-h-0">
          {/* Thumbnail Container */}
          <div className="relative shrink-0 w-32 sm:w-44 md:w-48 self-stretch overflow-hidden bg-slate-100 dark:bg-slate-800">
            {activeSpotlightPhoto ? (
              <Image
                src={activeSpotlightPhoto}
                alt={listing.title}
                fill
                sizes="(max-width: 640px) 128px, 192px"
                className="object-cover transition-all duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 p-2 text-center">
                <Tag className="h-6 w-6 stroke-[1.5] opacity-50" />
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">No Photo</span>
              </div>
            )}

            {/* Image-level meta labels */}
            <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10 pointer-events-none">
              {conditionLabel && (
                <span className="rounded bg-slate-900/85 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md shadow-xs">
                  {conditionLabel}
                </span>
              )}
              {listing.pricingType === "FREE" && (
                <span className="rounded bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-md shadow-xs">
                  Free
                </span>
              )}
              {listing.negotiable && listing.pricingType !== "FREE" && (
                <span className="rounded bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-md shadow-xs">
                  Negotiable
                </span>
              )}
            </div>

            {/* Spotlight Photo Count Indicator */}
            {isSpotlight && sortedImages.length > 1 && (
              <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none">
                <span className="rounded bg-slate-950/75 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
                  {sortedImages.length} Photos
                </span>
              </div>
            )}
          </div>

          {/* Content Area Column */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* URGENT divider */}
            {listing.isUrgent && <UrgentBadge />}

            <div className="flex flex-1 flex-col justify-between p-3 gap-1.5 min-w-0">
              <div className="space-y-1 min-w-0">
                {/* Category and Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {listing.categoryName && (
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 max-w-[140px] truncate">
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

                {/* Spec Pills for Spotlight */}
                {isSpotlight && specPills.length > 0 ? (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {specPills.map((pill, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                ) : specsSummary ? (
                  <p className="line-clamp-1 sm:line-clamp-2 text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 leading-snug break-words">
                    {specsSummary}
                  </p>
                ) : "description" in listing && listing.description ? (
                  <p className="line-clamp-1 sm:line-clamp-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug break-words hidden xs:block">
                    {listing.description}
                  </p>
                ) : null}
              </div>

              {/* Bottom Row: Price & Metadata */}
              <div className="flex flex-col gap-0.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm sm:text-base font-black ${isUrgent
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                      }`}
                  >
                    {formatPrice()}
                  </span>
                  {isUrgent && <UrgentRibbonBadge />}
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                  {locationText ? (
                    <span className="flex items-center gap-0.5 truncate max-w-[160px] sm:max-w-[200px]">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{locationText}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">Nationwide</span>
                  )}

                  {/* Freshness Beacon for PushUp */}
                  {isPushedUp ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ArrowUpCircle className="w-4" />
                    </span>
                  ) : timeAgoStr ? (
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{timeAgoStr}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Push-up bottom bar */}
            {listing.isPushedUp && !listing.isSpotlight && <PushUpBadge />}
          </div>
        </Link>
      </article>
    );
  }

  // Grid Layout
  const gridCardTheme = isSpotlight
    ? "border-amber-400/90 dark:border-amber-500/80 bg-amber-50 dark:bg-slate-900/90 shadow-md shadow-amber-500/10 hover:border-amber-500 hover:shadow-amber-500/20 ring-1 ring-amber-400/40"
    : isUrgent
      ? "border-rose-400/90 dark:border-rose-500/80 bg-rose-50 dark:bg-slate-900/90 shadow-md shadow-rose-500/10 hover:border-rose-500 hover:shadow-rose-500/20 ring-1 ring-rose-400/40"
      : isPushedUp
        ? "border-emerald-400/90 dark:border-emerald-500/80 bg-emerald-50 dark:bg-slate-900/90 shadow-md shadow-emerald-500/10 hover:border-emerald-500 hover:shadow-emerald-500/20 ring-1 ring-emerald-400/40"
        : "border-slate-200/80 bg-white hover:border-emerald-500/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-500/30";

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 h-full w-full ${gridCardTheme} ${className}`}
    >
      {/* Ellipsis Menu */}
      <div
        ref={menuRef}
        className={`absolute top-2 z-35 ${listing.isSpotlight ? "left-2" : "right-2"
          }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
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

      {/* SPOTLIGHT corner ribbon */}
      {listing.isSpotlight && <SpotlightBadge />}

      <Link href={targetHref} className="flex flex-col h-full">
        {/* Media Thumbnail */}
        <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
          {activeSpotlightPhoto ? (
            <Image
              src={activeSpotlightPhoto}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 p-3 text-center">
              <Tag className="h-8 w-8 stroke-[1.5] opacity-40" />
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60">No image</span>
            </div>
          )}

          {/* Image-level meta labels */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10 max-w-[80%]">
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

          {/* Spotlight Photo Count Indicator */}
          {isSpotlight && sortedImages.length > 1 && (
            <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
              <span className="rounded bg-slate-950/75 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
                {sortedImages.length} Photos
              </span>
            </div>
          )}
        </div>

        {/* URGENT divider bar */}
        {listing.isUrgent && <UrgentBadge />}

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-3 space-y-2">
          <div className="space-y-1.5">
            {/* Price & Urgent Status */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-base sm:text-lg font-black truncate ${isUrgent
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
                  }`}
              >
                {formatPrice()}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
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
                {isUrgent && <UrgentRibbonBadge />}
              </div>
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 min-h-[2.5rem] text-xs sm:text-sm font-semibold text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400 break-words leading-snug">
              {listing.title}
            </h3>

            {/* Spec Pills for Spotlight */}
            {isSpotlight && specPills.length > 0 ? (
              <div className="flex flex-wrap gap-1 min-h-[1.5rem] items-center">
                {specPills.map((pill, i) => (
                  <span
                    key={i}
                    className="rounded bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            ) : specsSummary ? (
              <p className="line-clamp-2 min-h-[2.5rem] text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-normal break-words">
                {specsSummary}
              </p>
            ) : "description" in listing && listing.description ? (
              <p className="line-clamp-2 min-h-[2.5rem] text-[11px] text-slate-500 dark:text-slate-400 leading-normal break-words">
                {listing.description}
              </p>
            ) : null}
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400 mt-auto">
            {locationText ? (
              <span className="flex items-center gap-1 truncate max-w-[130px]">
                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate">{locationText}</span>
              </span>
            ) : (
              <span className="text-slate-400">Nationwide</span>
            )}

            {/* Freshness Beacon for Push Up */}
            {isPushedUp ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ArrowUpCircle className="w-4" />
              </span>
            ) : timeAgoStr ? (
              <span className="flex items-center gap-0.5 shrink-0">
                <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                <span>{timeAgoStr}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Push-up bottom bar */}
        {listing.isPushedUp && !listing.isSpotlight && <PushUpBadge />}
      </Link>
    </article>
  );
}