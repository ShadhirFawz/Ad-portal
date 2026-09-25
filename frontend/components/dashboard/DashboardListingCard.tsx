"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import type { Listing } from "@/types/listing";
import {
  MapPin,
  Clock,
  Bookmark,
  Star,
  Flame,
  Crown,
  TrendingUp,
  Tag,
  Loader2,
} from "lucide-react";
import { toggleBookmarkListing } from "@/lib/api/listings";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";

interface DashboardListingCardProps {
  listing: Listing;
  className?: string;
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

export default function DashboardListingCard({
  listing,
  className = "",
}: DashboardListingCardProps) {
  const { user, accessToken } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [bookmarked, setBookmarked] = useState<boolean>(
    Boolean(listing.isBookmarked)
  );
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleBookmarkToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!user || !accessToken) {
        toastError("Sign in Required", "Please log in to save bookmarks.");
        return;
      }

      setBookmarkLoading(true);
      try {
        const res = await toggleBookmarkListing(listing.id, accessToken);
        setBookmarked(res.isBookmarked);
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
    [user, accessToken, listing.id, toastError, toastSuccess]
  );

  const primaryImage =
    listing.primaryImage?.url ||
    (listing.images && listing.images.length > 0
      ? listing.images.find((img) => img.primary)?.url || listing.images[0]?.url
      : null);

  const targetHref = `/listings/${listing.slug || listing.id}`;

  return (
    <Link
      href={targetHref}
      className={`group relative flex flex-row items-stretch rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 overflow-hidden h-[126px] ${className}`}
    >
      {/* Left: Rectangular Thumbnail Image */}
      <div className="relative w-32 sm:w-36 shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 130px, 150px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
            <Tag className="w-6 h-6" />
          </div>
        )}

        {/* Promotion Mini Badge Overlays on Image */}
        {listing.isSpotlight && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-extrabold tracking-wide uppercase flex items-center gap-1 shadow-sm">
            <Star className="w-2.5 h-2.5 fill-white" />
            <span>Spotlight</span>
          </div>
        )}
        {!listing.isSpotlight && listing.isUrgent && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[9px] font-extrabold tracking-wide uppercase flex items-center gap-1 shadow-sm">
            <Flame className="w-2.5 h-2.5 fill-white" />
            <span>Urgent</span>
          </div>
        )}
      </div>

      {/* Right: Content Details */}
      <div className="flex-1 p-2.5 sm:p-3 flex flex-col justify-between min-w-0">
        {/* Top: Category & Bookmark */}
        <div className="flex items-start justify-between gap-1">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-md truncate max-w-[120px]">
            {listing.categoryName || "General"}
          </span>

          <button
            type="button"
            onClick={handleBookmarkToggle}
            aria-label={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
            disabled={bookmarkLoading}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            {bookmarkLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            ) : (
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  bookmarked
                    ? "fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400"
                    : ""
                }`}
              />
            )}
          </button>
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
          {listing.title}
        </h3>

        {/* Price & Negotiable */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
            {formatPrice(listing.price, listing.currency)}
          </span>
          {listing.negotiable && (
            <span className="text-[9px] font-medium text-slate-400 uppercase">
              (Nego)
            </span>
          )}
        </div>

        {/* Bottom: Location & Time */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-0.5 border-t border-slate-100 dark:border-slate-800/80">
          <span className="flex items-center gap-1 truncate max-w-[110px]">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{listing.city || listing.district || "Sri Lanka"}</span>
          </span>
          <span className="flex items-center gap-0.5 shrink-0">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formatTimeAgo(listing.createdAt)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
