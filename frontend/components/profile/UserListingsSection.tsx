"use client";

import { useState } from "react";
import { getListingsByUsername } from "@/lib/api/listings";
import type { Listing } from "@/types/listing";
import ListingCard from "@/components/listings/ListingCard";
import { Package, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

interface UserListingsSectionProps {
  username: string;
  initialListings: Listing[];
  initialTotalPages: number;
  initialTotalElements: number;
  pageSize?: number;
}

export default function UserListingsSection({
  username,
  initialListings,
  initialTotalPages,
  initialTotalElements,
  pageSize = 8,
}: UserListingsSectionProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalElements, setTotalElements] = useState(initialTotalElements);
  const [loading, setLoading] = useState(false);

  const handlePageChange = async (newPage: number) => {
    if (newPage < 0 || (totalPages > 0 && newPage >= totalPages) || newPage === currentPage) {
      return;
    }
    setLoading(true);
    setCurrentPage(newPage);
    try {
      const result = await getListingsByUsername(username, newPage, pageSize);
      setListings(result.content ?? []);
      setTotalPages(result.totalPages ?? 0);
      setTotalElements(result.totalElements ?? 0);
    } catch (err) {
      console.error("Failed to load user listings page:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Active Listings
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {totalElements} active listing{totalElements !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Mini Pagination Header Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || loading}
              aria-label="Previous Page"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || loading}
              aria-label="Next Page"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Loading listings…
          </p>
        </div>
      ) : listings.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} layout="grid" />
            ))}
          </div>

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || loading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePageChange(i)}
                  disabled={loading}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    i === currentPage
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || loading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-10 text-center space-y-3">
          <Package className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Active Listings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            This seller does not have any active listings published right now.
          </p>
        </div>
      )}
    </section>
  );
}
