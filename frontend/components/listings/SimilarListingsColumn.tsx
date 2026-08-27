"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getListingsByCategory } from "@/lib/api/listings";
import type { Listing } from "@/types/listing";
import type { ListingImage } from "@/types/listing-image";
import { formatListingPrice, formatListingCondition } from "@/lib/format/listing-labels";
import { Sparkles, ArrowRight, MapPin } from "lucide-react";

interface SimilarListingsColumnProps {
  categoryId: string;
  categoryName: string;
  currentListingId: string;
}

export default function SimilarListingsColumn({
  categoryId,
  categoryName,
  currentListingId,
}: SimilarListingsColumnProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchSimilar() {
      if (!categoryId) return;
      setLoading(true);
      try {
        const response = await getListingsByCategory(categoryId, 0, 10);
        if (isMounted) {
          const filtered = (response.content ?? []).filter(
            (item) => item.id !== currentListingId
          );
          setListings(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch similar listings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSimilar();
    return () => {
      isMounted = false;
    };
  }, [categoryId, currentListingId]);

  if (!loading && listings.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Similar Items
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              In {categoryName}
            </p>
          </div>
        </div>

        <Link
          href={`/listings?category=${categoryId}`}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition flex items-center gap-0.5 shrink-0"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Scrollable Container with Horizontal Cards */}
      <div className="max-h-[580px] overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse"
            >
              <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : (
          listings.map((item) => {
            const primaryImage =
              item.primaryImage?.url ??
              item.images?.find((img: ListingImage) => img.primary)?.url ??
              item.images?.[0]?.url;

            const locationText = [item.city, item.district].filter(Boolean).join(", ");

            return (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="group flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500/40 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-md transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/50 dark:border-slate-700/50">
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={item.title}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Photo
                    </div>
                  )}

                  {item.condition && item.condition !== "NOT_APPLICABLE" && (
                    <span className="absolute bottom-1 left-1 rounded bg-slate-900/80 px-1 py-0.5 text-[9px] font-semibold text-white backdrop-blur-xs">
                      {formatListingCondition(item.condition)}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2 leading-snug transition-colors">
                    {item.title}
                  </h3>

                  <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatListingPrice(item)}
                  </div>

                  {locationText && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{locationText}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
