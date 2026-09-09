"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getMyFavorites } from "@/lib/api/listings";
import type { Listing } from "@/types/listing";
import ListingCard from "@/components/listings/ListingCard";
import HorizontalFilterBar, {
  HorizontalFilterState,
  DEFAULT_HORIZONTAL_FILTERS,
} from "@/components/listings/HorizontalFilterBar";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from "lucide-react";

const PAGE_SIZE = 14;

export default function FavoritesPage() {
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();

  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [layout, setLayout] = useState<"grid" | "row">("grid");

  const [filters, setFilters] = useState<HorizontalFilterState>(
    DEFAULT_HORIZONTAL_FILTERS
  );

  // Debounced search / price filter values for API requests
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(filters.minPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(filters.maxPrice);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setDebouncedMinPrice(filters.minPrice);
      setDebouncedMaxPrice(filters.maxPrice);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters.search, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/favorites");
      return;
    }
  }, [user, loading, router]);

  const fetchFavorites = useCallback(
    async (page: number) => {
      if (!user) return;
      setFavoritesLoading(true);
      try {
        const result = await getMyFavorites(accessToken, {
          page,
          size: PAGE_SIZE,
          search: debouncedSearch,
          condition: filters.condition,
          pricingType: filters.pricingType,
          listingType: filters.listingType,
          minPrice: debouncedMinPrice,
          maxPrice: debouncedMaxPrice,
          sortBy: filters.sortBy,
        });

        setFavorites(result.content ?? []);
        setTotalPages(result.totalPages ?? 0);
        setTotalElements(result.totalElements ?? 0);
        setCurrentPage(page);
      } catch (err) {
        console.error("Failed to load favorites:", err);
      } finally {
        setFavoritesLoading(false);
      }
    },
    [
      user,
      accessToken,
      filters.condition,
      filters.pricingType,
      filters.listingType,
      filters.sortBy,
      debouncedSearch,
      debouncedMinPrice,
      debouncedMaxPrice,
    ]
  );

  // Re-fetch from page 0 whenever any filter changes
  useEffect(() => {
    if (user) {
      fetchFavorites(0);
    }
  }, [user, fetchFavorites]);

  const handlePageChange = (page: number) => {
    if (page < 0 || (totalPages > 0 && page >= totalPages) || page === currentPage) {
      return;
    }
    fetchFavorites(page);
  };

  const handleFilterChange = (newFilters: HorizontalFilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_HORIZONTAL_FILTERS);
  };

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    Boolean(filters.condition) ||
    Boolean(filters.pricingType) ||
    Boolean(filters.listingType) ||
    Boolean(filters.minPrice || filters.maxPrice) ||
    filters.sortBy !== "createdAt,desc";

  if (loading || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-20 min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          Loading your favorites...
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-emerald-500" />
          <span>Explore All Ads</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs">
              <Heart className="w-7 h-7 fill-rose-500/20 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  My Favorites
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {totalElements} {totalElements === 1 ? "Saved Ad" : "Saved Ads"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Listings you have marked as favorites to keep track of prices, availability, and updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Filter Bar */}
      <HorizontalFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        showStatusFilter={false}
        showLayoutToggle={true}
        layout={layout}
        onLayoutChange={setLayout}
        totalCount={totalElements}
        filteredCount={favorites.length}
        searchPlaceholder="Search saved favorites by title, city, category..."
        accentColor="rose"
      />

      {/* Favorites Content */}
      {favoritesLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Loading your favorites…
          </p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="space-y-6">
          {layout === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {favorites.map((listing) => (
                <ListingCard key={listing.id} listing={listing} layout="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {favorites.map((listing) => (
                <ListingCard key={listing.id} listing={listing} layout="row" />
              ))}
            </div>
          )}

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-6">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || favoritesLoading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-rose-500 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePageChange(i)}
                  disabled={favoritesLoading}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${i === currentPage
                      ? "bg-rose-600 text-white shadow-md shadow-rose-500/25"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || favoritesLoading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-rose-500 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : hasActiveFilters ? (
        <div className="glass-panel p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No matching favorites found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              None of your saved favorites match the current filters. Try changing or resetting your search and filters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-outline text-xs px-4 py-2 inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Heart className="w-8 h-8 fill-rose-500/20 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Favorites Saved Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              When exploring ads on Marketplace, click the heart icon on any listing to save it to your favorites and easily access it here anytime.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/listings"
              className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Marketplace Ads</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
