import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types/listing";
import { MapPin } from "lucide-react";

type ListingSearchResultItemProps = {
  listing: Listing;
  href: string;
  onNavigate?: () => void;
};

function formatPrice(listing: Listing): string {
  if (listing.pricingType === "FREE") return "Free";
  if (listing.pricingType === "CONTACT_FOR_PRICE") return "Contact for Price";
  const currency = listing.currency || "LKR";
  return `${currency} ${Number(listing.price || 0).toLocaleString()}`;
}

function getPrimaryImageUrl(listing: Listing): string | null {
  if (listing.primaryImage?.url) return listing.primaryImage.url;
  if (!listing.images || listing.images.length === 0) return null;
  const first = [...listing.images].sort((a, b) => a.displayOrder - b.displayOrder)[0];
  return first?.url ?? null;
}

function getLocationText(listing: Listing): string {
  return [listing.city, listing.district, listing.province].filter(Boolean).join(", ") || "Location not specified";
}

export default function ListingSearchResultItem({
  listing,
  href,
  onNavigate,
}: ListingSearchResultItemProps) {
  const imageUrl = getPrimaryImageUrl(listing);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {listing.title}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{formatPrice(listing)}</p>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{getLocationText(listing)}</span>
        </div>
      </div>
    </Link>
  );
}
