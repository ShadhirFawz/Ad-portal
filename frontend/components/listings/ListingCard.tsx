"use client";

import Link from "next/link";
import Image from "next/image";
import type { Listing, ListingCardData } from "@/types/listing";
import type { ListingImage } from "@/types/listing-image";

interface ListingCardProps {
  listing: Listing | ListingCardData;
  href?: string;
  className?: string;
}

export default function ListingCard({
  listing,
  href,
  className = "",
}: ListingCardProps) {
  // Resolve primary image with fallback hierarchy:
  // 1. Direct primaryImage object
  // 2. Explicit image marked as primary (primary === true)
  // 3. First ordered image by displayOrder
  // 4. null (fallback to placeholder)
  const resolvedPrimaryImage =
    listing.primaryImage?.url
      ? listing.primaryImage
      : listing.images?.find((image: ListingImage) => image.primary) ??
        (listing.images && listing.images.length > 0
          ? [...listing.images].sort(
              (a, b) => a.displayOrder - b.displayOrder
            )[0]
          : null);

  const targetHref = href ?? `/listings/${listing.id}`;

  const formatPrice = () => {
    if (listing.pricingType === "FREE") {
      return "Free";
    }
    if (listing.pricingType === "CONTACT_FOR_PRICE") {
      return "Contact for Price";
    }
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
      case "NEW":
        return "Brand New";
      case "LIKE_NEW":
        return "Like New";
      case "GOOD":
        return "Good Condition";
      case "FAIR":
        return "Fair";
      case "POOR":
        return "For Parts / Poor";
      default:
        return condition ?? null;
    }
  };

  const locationText = [listing.city, listing.district, listing.province]
    .filter(Boolean)
    .join(", ");

  return (
    <article
      className={`
        group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white
        transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-950/5
        dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-500/30 dark:hover:shadow-black/40
        ${className}
      `}
    >
      <Link href={targetHref} className="flex flex-col h-full">
        {/* Media Thumbnail Container */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {resolvedPrimaryImage?.url ? (
            <Image
              src={resolvedPrimaryImage.url}
              alt={listing.title}
              width={400}
              height={300}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wider">
                No image available
              </span>
            </div>
          )}

          {/* Condition / Pricing Tag Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
            {listing.condition && (
              <span className="rounded-md bg-slate-900/80 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm">
                {formatCondition(listing.condition)}
              </span>
            )}
            {listing.negotiable && listing.pricingType !== "FREE" && (
              <span className="rounded-md bg-emerald-600/90 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm">
                Negotiable
              </span>
            )}
          </div>

          {/* Category Tag Overlay */}
          {listing.categoryName && (
            <div className="absolute bottom-3 left-3 pointer-events-none">
              <span className="rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 backdrop-blur-md shadow-sm dark:bg-slate-950/80 dark:text-slate-300">
                {listing.categoryName}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
          <div className="space-y-1.5">
            {/* Price Heading */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatPrice()}
              </span>
              {listing.status && listing.status !== "ACTIVE" && (
                <span
                  className={`
                    rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider
                    ${
                      listing.status === "DRAFT"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : listing.status === "SOLD"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }
                  `}
                >
                  {listing.status}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
              {listing.title}
            </h3>
          </div>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
            {locationText ? (
              <span className="flex items-center gap-1 truncate max-w-45">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 shrink-0 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="truncate">{locationText}</span>
              </span>
            ) : (
              <span className="text-slate-400">Nationwide</span>
            )}

            {listing.sellerUsername && (
              <span className="truncate text-slate-400 dark:text-slate-500">
                @{listing.sellerUsername}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
