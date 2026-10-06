"use client";

import Link from "next/link";
import Image from "next/image";
import type { Listing, ListingCardData } from "@/types/listing";
import {
  MapPin,
  Clock,
  ArrowRight,
  Tag,
  Check,
  Gavel,
} from "lucide-react";
import { FaCrown } from "react-icons/fa";
import VerifiedSellerBadge from "@/components/common/VerifiedSellerBadge";

interface PowerPackCardProps {
  listing: Listing | ListingCardData;
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

export default function PowerPackCard({ listing }: PowerPackCardProps) {
  const primaryImage =
    listing.primaryImage?.url ||
    (listing.images && listing.images.length > 0
      ? listing.images.find((img) => img.primary)?.url || listing.images[0]?.url
      : null);

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

  const conditionLabel = formatCondition(listing.condition);
  const specPills = getSpecPills(listing, 4);
  const locationText = [listing.district, listing.province].filter(Boolean).join(", ") || listing.city || "Sri Lanka";
  const timeAgoStr = formatTimeAgo(
    ("publishedAt" in listing && listing.publishedAt
      ? listing.publishedAt
      : listing.createdAt) as string
  );

  const targetHref = `/listings/${listing.slug || listing.id}`;

  return (
    <Link
      href={targetHref}
      className="group relative flex flex-col sm:flex-row items-stretch rounded-3xl border-2 border-violet-500/30 hover:border-violet-500/60 bg-linear-to-r from-violet-500/5 via-purple-500/5 to-slate-900/5 dark:from-violet-950/30 dark:via-slate-900 dark:to-slate-900/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Left: Wide Thumbnail Showcase with Crown Badge & Condition */}
      <div className="relative w-full sm:w-72 lg:w-80 h-48 sm:h-auto min-h-[190px] shrink-0 bg-slate-900 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-4 text-center">
            <Image
              src="/Wudo_watermark.png"
              alt="Wudo"
              width={160}
              height={40}
              priority
              className="h-8 w-auto object-contain mx-auto opacity-60"
            />
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              No image
            </span>
          </div>
        )}

        {/* Top Power Pack Crown Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-violet-700 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-violet-400/30 z-10">
          <FaCrown className="w-3.5 h-3.5 text-amber-300" />
          <span>TOP AD</span>
        </div>

        {/* Meta Labels (Condition / Negotiable) on Hero Photo */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 z-10 pointer-events-none">
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

        {/* Image count */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium z-10">
            {listing.images.length} photos
          </div>
        )}
      </div>

      {/* Right: Rich Details Body */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between space-y-2.5">
        <div className="space-y-2">
          {/* Category, Live Auction & Verified Tag */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {listing.categoryName && (
                <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800/60 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-violet-700 dark:text-violet-300">
                  <Tag className="w-3 h-3 text-violet-500 shrink-0" />
                  <span className="truncate max-w-[160px]">{listing.categoryName}</span>
                </span>
              )}
              {listing.sellerRole === "VERIFIED_SELLER" && (
                <VerifiedSellerBadge size="xs" />
              )}
            </div>

            {listing.hasActiveAuction && (
              <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                <Gavel className="w-3 h-3 shrink-0" />
                Live Auction
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug">
            {listing.title}
          </h3>

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
            <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-0.5">
              {listing.description}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base sm:text-lg md:text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatPrice()}
            </div>
            <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {locationText && (
                <span className="flex items-center gap-0.5 truncate max-w-[140px]">
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

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition-all group-hover:translate-x-0.5">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
