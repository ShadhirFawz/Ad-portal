"use client";

import Link from "next/link";
import Image from "next/image";
import type { Listing, ListingCardData } from "@/types/listing";
import type { ListingImage } from "@/types/listing-image";
import { MapPin, Clock, Tag, Eye } from "lucide-react";

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

  const locationText = [listing.city, listing.district, listing.province]
    .filter(Boolean)
    .join(", ");

  const conditionLabel = formatCondition(listing.condition);
  const timeAgoStr = formatTimeAgo(
    ("publishedAt" in listing && listing.publishedAt
      ? listing.publishedAt
      : listing.createdAt) as string
  );

  // ─── Horizontal Row Layout ───────────────────────────────────────────────────
  if (layout === "row") {
    return (
      <article
        className={`group relative flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-500/30 dark:hover:shadow-black/40 min-h-[175px] sm:min-h-[190px] w-full ${className}`}
      >
        <Link href={targetHref} className="flex w-full min-h-0">
          {/* Definite Thumbnail Container with Aspect Ratio Guard */}
          <div className="relative shrink-0 w-36 sm:w-44 md:w-52 self-stretch overflow-hidden bg-slate-100 dark:bg-slate-800">
            {resolvedPrimaryImage?.url ? (
              <Image
                src={resolvedPrimaryImage.url}
                alt={listing.title}
                fill
                sizes="(max-width: 640px) 144px, 208px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 p-2 text-center">
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
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">No Photo</span>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
              {conditionLabel && (
                <span className="rounded-md bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md shadow-xs">
                  {conditionLabel}
                </span>
              )}
              {listing.pricingType === "FREE" && (
                <span className="rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-xs">
                  Free
                </span>
              )}
              {listing.negotiable && listing.pricingType !== "FREE" && (
                <span className="rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md shadow-xs">
                  Negotiable
                </span>
              )}
            </div>
          </div>

          {/* Content Area - Fixed Flex Column with Space Management */}
          <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 gap-2 min-w-0">
            {/* Top Details */}
            <div className="space-y-1.5">
              {/* Category and Status Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {listing.categoryName && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{listing.categoryName}</span>
                  </span>
                )}
                {listing.status && listing.status !== "ACTIVE" && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      listing.status === "DRAFT"
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

              {/* Title with Uniform Line Clamp & Height */}
              <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400 leading-snug break-words">
                {listing.title}
              </h3>

              {/* Description Excerpt with Safe Height Clamping */}
              {"description" in listing && listing.description && (
                <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed break-words hidden sm:block">
                  {listing.description}
                </p>
              )}
            </div>

            {/* Bottom Row: Definite Price & Metadata Baseline */}
            <div className="flex items-end justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
              <span className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                {formatPrice()}
              </span>

              <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-slate-400 dark:text-slate-500 flex-wrap justify-end">
                {locationText ? (
                  <span className="flex items-center gap-1 truncate max-w-[130px] sm:max-w-[160px]">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{locationText}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Nationwide</span>
                )}
                {"viewCount" in listing && listing.viewCount != null && (
                  <span className="flex items-center gap-0.5 shrink-0 hidden xs:inline-flex">
                    <Eye className="w-3 h-3" />
                    {listing.viewCount}
                  </span>
                )}
                {timeAgoStr && (
                  <span className="flex items-center gap-1 shrink-0">
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

  // ─── Grid Layout (Vertical Card) ─────────────────────────────────────────────
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/5 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-500/30 dark:hover:shadow-black/40 h-full w-full ${className}`}
    >
      <Link href={targetHref} className="flex flex-col h-full">
        {/* Media Thumbnail Container with Fixed 4/3 Aspect Ratio */}
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
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 p-4 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 stroke-[1.5]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-60">No image available</span>
            </div>
          )}

          {/* Badges Top Left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none z-10">
            {conditionLabel && (
              <span className="rounded-md bg-slate-900/85 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-xs">
                {conditionLabel}
              </span>
            )}
            {listing.negotiable && listing.pricingType !== "FREE" && (
              <span className="rounded-md bg-emerald-600/90 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-xs">
                Negotiable
              </span>
            )}
          </div>

          {/* Category Tag Bottom Left */}
          {listing.categoryName && (
            <div className="absolute bottom-3 left-3 pointer-events-none z-10 max-w-[85%]">
              <span className="block truncate rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 backdrop-blur-md shadow-xs dark:bg-slate-950/85 dark:text-slate-300">
                {listing.categoryName}
              </span>
            </div>
          )}
        </div>

        {/* Card Body with Definite Space Management */}
        <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
          <div className="space-y-1.5">
            {/* Price & Status Row */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
                {formatPrice()}
              </span>
              {listing.status && listing.status !== "ACTIVE" && (
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    listing.status === "DRAFT"
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

            {/* Title with Consistent 2-Line Height */}
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400 break-words leading-snug">
              {listing.title}
            </h3>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400 mt-auto">
            {locationText ? (
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{locationText}</span>
              </span>
            ) : (
              <span className="text-slate-400">Nationwide</span>
            )}
            {listing.sellerUsername && (
              <span className="truncate max-w-[110px] text-slate-400 dark:text-slate-500">
                @{listing.sellerUsername}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
