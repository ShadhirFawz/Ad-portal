"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getListings, getListingsByCategory } from "@/lib/api/listings";
import { getCategories, getCategory, getCategoryBreadcrumbs } from "@/lib/api/categories";
import type { Listing } from "@/types/listing";
import type { Category, CategoryBreadcrumb } from "@/types/category";
import ListingCard from "@/components/listings/ListingCard";
import ListingBreadcrumb from "@/components/listings/ListingBreadcrumb";
import FilterSidebar from "@/components/listings/FilterSidebar";
import {
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
} from "lucide-react";

interface Filters {
  search: string;
  condition: string;
  pricingType: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  condition: "",
  pricingType: "",
  listingType: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "newest",
};

const PAGE_SIZE = 8;

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;

  const pages = Array.from({ length: Math.min(total, 7) }, (_, i) => {
    if (total <= 7) return i;
    if (current <= 3) return i;
    if (current >= total - 4) return total - 7 + i;
    return current - 3 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 0}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages[0] > 0 && (
        <>
          <button type="button" onClick={() => onChange(0)} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            1
          </button>
          {pages[0] > 1 && <span className="text-slate-400 text-xs px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${p === current
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
        >
          {p + 1}
        </button>
      ))}

      {pages[pages.length - 1] < total - 1 && (
        <>
          {pages[pages.length - 1] < total - 2 && <span className="text-slate-400 text-xs px-1">…</span>}
          <button
            type="button"
            onClick={() => onChange(total - 1)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {total}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total - 1}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CategoryBreadcrumb[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [pendingSearch, setPendingSearch] = useState("");
  const [viewLayout, setViewLayout] = useState<"row" | "grid">("row");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredListings = allListings.filter((l) => {
    if (
      filters.search &&
      !l.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !(l.description ?? "").toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    if (filters.condition && l.condition !== filters.condition) return false;
    if (filters.pricingType && l.pricingType !== filters.pricingType) return false;
    if (filters.listingType && l.listingType !== filters.listingType) return false;
    if (filters.minPrice && l.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && l.price > Number(filters.maxPrice)) return false;
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (filters.sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const activeFilterCount = [
    filters.search,
    filters.condition,
    filters.pricingType,
    filters.listingType,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  const rootCategories = allCategories.filter((c) => !c.parentId && c.active);

  // Fetch data from API
  useEffect(() => {
    let isMounted = true;
    setCurrentPage(0);

    async function loadData() {
      setLoading(true);
      try {
        const [allCats, listingsPage] = await Promise.all([
          getCategories(),
          categoryId
            ? getListingsByCategory(categoryId, 0, PAGE_SIZE)
            : getListings(0, PAGE_SIZE),
        ]);

        if (!isMounted) return;

        setAllCategories(allCats);
        setAllListings(listingsPage.content ?? []);
        setTotalElements(listingsPage.totalElements ?? 0);
        setTotalPages(listingsPage.totalPages ?? 0);

        if (categoryId) {
          const found = allCats.find((c) => c.id === categoryId || c.slug === categoryId) ?? null;
          setCurrentCategory(found);

          if (!found) {
            try {
              const fetched = await getCategory(categoryId);
              if (isMounted) setCurrentCategory(fetched);
            } catch {
              if (isMounted) setCurrentCategory(null);
            }
          }

          try {
            const crumbs = await getCategoryBreadcrumbs(categoryId);
            if (isMounted) setBreadcrumbs(crumbs);
          } catch {
            if (isMounted) setBreadcrumbs([]);
          }
        } else {
          setCurrentCategory(null);
          setBreadcrumbs([]);
        }
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  const goToPage = useCallback(
    async (page: number) => {
      if (page < 0 || page >= totalPages) return;
      setLoading(true);
      setCurrentPage(page);
      try {
        const result = categoryId
          ? await getListingsByCategory(categoryId, page, PAGE_SIZE)
          : await getListings(page, PAGE_SIZE);
        setAllListings(result.content ?? []);
        setTotalElements(result.totalElements ?? 0);
        setTotalPages(result.totalPages ?? 0);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("Failed to load page:", err);
      } finally {
        setLoading(false);
      }
    },
    [categoryId, totalPages]
  );

  const commitSearch = () => setFilters((f) => ({ ...f, search: pendingSearch }));

  const handleFilterChange = <K extends keyof Omit<Filters, "search">>(
    key: K,
    value: Filters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPendingSearch("");
  };

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Breadcrumb */}
      <ListingBreadcrumb
        breadcrumbs={breadcrumbs}
        currentTitle={currentCategory?.name}
      />

      {/* Page Header */}
      <div className="mt-4 mb-6 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentCategory ? currentCategory.name : "Explore All Listings"}
          </h1>
          {currentCategory?.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {currentCategory.description}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {loading ? "Loading…" : `${totalElements} listing${totalElements !== 1 ? "s" : ""} found`}
            {activeFilterCount > 0 && ` · ${sortedListings.length} after filters`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Layout toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewLayout("row")}
              title="Row layout"
              className={`p-2.5 transition-all ${viewLayout === "row"
                ? "bg-emerald-600 text-white"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("grid")}
              title="Grid layout"
              className={`p-2.5 transition-all ${viewLayout === "grid"
                ? "bg-emerald-600 text-white"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:border-emerald-500 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <Link
            href="/listings/new"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Post Listing</span>
          </Link>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-6 items-start">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
          <FilterSidebar
            searchQuery={pendingSearch}
            onSearchChange={setPendingSearch}
            onSearchSubmit={commitSearch}
            filters={{
              condition: filters.condition,
              pricingType: filters.pricingType,
              listingType: filters.listingType,
              sortBy: filters.sortBy,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
            }}
            onFilterChange={handleFilterChange}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
            categories={allCategories}
            currentCategoryId={categoryId}
            rootCategories={rootCategories}
          />
        </aside>

        {/* Mobile Filters Drawer */}
        {mobileFiltersOpen && (
          <FilterSidebar
            isMobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
            searchQuery={pendingSearch}
            onSearchChange={setPendingSearch}
            onSearchSubmit={commitSearch}
            filters={{
              condition: filters.condition,
              pricingType: filters.pricingType,
              listingType: filters.listingType,
              sortBy: filters.sortBy,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
            }}
            onFilterChange={handleFilterChange}
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
            categories={allCategories}
            currentCategoryId={categoryId}
            rootCategories={rootCategories}
          />
        )}

        {/* Listing Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <div className="w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Loading listings…
              </p>
            </div>
          ) : sortedListings.length > 0 ? (
            <>
              {viewLayout === "row" ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                  {sortedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} layout="row" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {sortedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} layout="grid" />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <Pagination
                current={currentPage}
                total={totalPages}
                onChange={goToPage}
              />
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 text-center shadow-sm space-y-4 max-w-lg mx-auto">
              <Package className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeFilterCount > 0 ? "No Matches Found" : "No Listings Found"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeFilterCount > 0
                  ? "No listings match your current filters. Try adjusting or clearing them."
                  : currentCategory
                    ? `No active listings in found for "${currentCategory.name}"`
                    : "No active listings are currently available."}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition inline-flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/listings/new"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Post an Ad
                </Link>
                {currentCategory && (
                  <Link
                    href="/listings"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:border-emerald-500 transition inline-block"
                  >
                    Browse All
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-7xl w-full mx-auto px-4 py-16 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </main>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}