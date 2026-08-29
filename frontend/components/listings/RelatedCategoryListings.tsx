"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getListingsByCategory } from "@/lib/api/listings";
import type { Listing } from "@/types/listing";
import type { CategoryBreadcrumb } from "@/types/category";
import ListingCard from "@/components/listings/ListingCard";
import { Layers, ArrowRight, Compass } from "lucide-react";

interface RelatedCategoryListingsProps {
  rootCategory?: CategoryBreadcrumb;
  categoryBreadcrumbs?: CategoryBreadcrumb[];
  currentListingId: string;
  fallbackCategoryId?: string;
  fallbackCategoryName?: string;
}

export default function RelatedCategoryListings({
  rootCategory,
  categoryBreadcrumbs = [],
  currentListingId,
  fallbackCategoryId,
  fallbackCategoryName,
}: RelatedCategoryListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Target the top-level parent category to fetch all 3 levels, or fallback to current category
  const targetCategoryIdentifier =
    rootCategory?.slug ?? categoryBreadcrumbs[0]?.slug ?? rootCategory?.id ?? categoryBreadcrumbs[0]?.id ?? fallbackCategoryId;
  const targetCategoryName =
    rootCategory?.name ?? categoryBreadcrumbs[0]?.name ?? fallbackCategoryName ?? "Category";

  useEffect(() => {
    let isMounted = true;
    async function fetchRelated() {
      if (!targetCategoryIdentifier) return;
      setLoading(true);
      try {
        // Fetch listings from top-level category (includes all 3 levels recursively)
        const response = await getListingsByCategory(targetCategoryIdentifier, 0, 12);
        if (isMounted) {
          const filtered = (response.content ?? []).filter(
            (item) => item.id !== currentListingId
          );
          setListings(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch related category listings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRelated();
    return () => {
      isMounted = false;
    };
  }, [targetCategoryIdentifier, currentListingId]);

  if (!loading && listings.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Related Catalog</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            More in {targetCategoryName}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            You might also like
          </p>
        </div>

        {targetCategoryIdentifier && (
          <Link
            href={`/listings?category=${targetCategoryIdentifier}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>View all in {targetCategoryName}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* 2-Column Grid with Horizontal Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex h-[130px] sm:h-[140px] rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:p-3 gap-3 animate-pulse"
            >
              <div className="w-28 sm:w-36 md:w-40 h-full rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2.5 py-1">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {listings.map((item) => (
            <ListingCard key={item.id} listing={item} layout="row" />
          ))}
        </div>
      )}
    </section>
  );
}
