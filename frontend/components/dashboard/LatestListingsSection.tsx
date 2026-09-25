"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import type { Listing } from "@/types/listing";
import DashboardListingCard from "./DashboardListingCard";

interface LatestListingsSectionProps {
  listings: Listing[];
  loading?: boolean;
}

const ITEMS_PER_PAGE = 12; // 3 columns x 4 rows

export default function LatestListingsSection({
  listings,
  loading = false,
}: LatestListingsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);

  // Group listings into pages of 12 items (3 cols x 4 rows)
  const pages: Listing[][] = [];
  for (let i = 0; i < listings.length; i += ITEMS_PER_PAGE) {
    pages.push(listings.slice(i, i + ITEMS_PER_PAGE));
  }

  const totalPages = Math.max(1, pages.length);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1 >= totalPages ? 0 : prev + 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev <= 0 ? totalPages - 1 : prev - 1));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(0);
  }, [listings]);

  const currentListings = pages[currentPage] || [];

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Latest Marketplace Listings
              </h2>
              {listings.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                  {listings.length} items
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fresh items, services, and live auctions added across categories
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={prevPage}
                aria-label="Previous 12 items"
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={nextPage}
                aria-label="Next 12 items"
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Link
            href="/listings"
            className="btn-outline text-xs px-3.5 py-1.5 flex items-center gap-1.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3 Columns x 4 Rows Grid (12 Compact Rectangular Cards per Page) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-[126px] rounded-2xl bg-slate-100 dark:bg-slate-850 animate-pulse border border-slate-200/50 dark:border-slate-800/50"
            />
          ))}
        </div>
      ) : currentListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 transition-all duration-300">
          {currentListings.map((listing) => (
            <DashboardListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Package className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No listings found right now.
          </p>
          <Link href="/listings/new" className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5">
            <span>Post First Listing</span>
          </Link>
        </div>
      )}

      {/* Bottom Horizontal Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i)}
              aria-label={`Go to listings page ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentPage === i
                  ? "w-7 bg-emerald-500"
                  : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-emerald-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
