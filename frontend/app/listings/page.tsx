"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getListings, getListingsByCategory } from "@/lib/api/listings";
import {
  getCategories,
  getCategory,
  getCategoryBreadcrumbs,
} from "@/lib/api/categories";
import type { Listing } from "@/types/listing";
import type { Category, CategoryBreadcrumb } from "@/types/category";
import ListingCard from "@/components/listings/ListingCard";
import ListingBreadcrumb from "@/components/listings/ListingBreadcrumb";
import {
  Layers,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  ChevronRight as ChevronRightSm,
} from "lucide-react";

// ─── Filter state ──────────────────────────────────────────────────────────────
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

// ─── Sidebar Accordion Section ─────────────────────────────────────────────────
function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between py-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

// ─── Radio/check filter pill ───────────────────────────────────────────────────
function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
        active
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/40"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────
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
          <button type="button" onClick={() => onChange(0)} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">1</button>
          {pages[0] > 1 && <span className="text-slate-400 text-xs px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            p === current
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
          <button type="button" onClick={() => onChange(total - 1)} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">{total}</button>
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

// ─── Category tree node ────────────────────────────────────────────────────────
function CategoryTreeNode({
  cat,
  allCats,
  depth = 0,
  activeCategoryId,
}: {
  cat: Category;
  allCats: Category[];
  depth?: number;
  activeCategoryId: string | null;
}) {
  const children = allCats.filter((c) => c.parentId === cat.id && c.active);
  const [expanded, setExpanded] = useState(false);
  const isActive = cat.id === activeCategoryId;

  return (
    <div>
      <div className="flex items-center gap-1">
        {children.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0"
          >
            <ChevronRightSm
              className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <Link
          href={`/listings?category=${cat.id}`}
          className={`flex-1 truncate py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            isActive
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
          style={{ paddingLeft: `${depth * 10 + 8}px` }}
        >
          {cat.name}
        </Link>
      </div>
      {expanded && children.length > 0 && (
        <div className="ml-4 mt-0.5 border-l border-slate-200 dark:border-slate-800 pl-1.5 space-y-0.5">
          {children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              cat={child}
              allCats={allCats}
              depth={depth + 1}
              activeCategoryId={activeCategoryId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function ListingsContent() {
  const router = useRouter();
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

  // derived: client-side filtered + sorted subset of current page
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
      case "price_asc": return a.price - b.price;
      case "price_desc": return b.price - a.price;
      case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
          const found = allCats.find((c) => c.id === categoryId) ?? null;
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
    return () => { isMounted = false; };
  }, [categoryId]);

  // Page navigation (API-paginated)
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

  // Commit search from input
  const commitSearch = () => setFilters((f) => ({ ...f, search: pendingSearch }));

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value }));

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPendingSearch("");
  };

  const rootCategories = allCategories.filter((c) => !c.parentId && c.active);

  // ─── Sidebar content (shared between desktop and mobile) ──────────────────
  const sidebarContent = (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="listing-search"
          type="text"
          placeholder="Search listings…"
          value={pendingSearch}
          onChange={(e) => setPendingSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commitSearch()}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
        />
        {pendingSearch && (
          <button
            type="button"
            onClick={() => { setPendingSearch(""); setFilters((f) => ({ ...f, search: "" })); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {pendingSearch !== filters.search && (
        <button
          type="button"
          onClick={commitSearch}
          className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
        >
          Apply Search
        </button>
      )}

      {/* Sort */}
      <FilterSection title="Sort By" defaultOpen>
        {[
          { label: "Newest First", value: "newest" },
          { label: "Oldest First", value: "oldest" },
          { label: "Price: Low → High", value: "price_asc" },
          { label: "Price: High → Low", value: "price_desc" },
        ].map(({ label, value }) => (
          <FilterPill
            key={value}
            label={label}
            active={filters.sortBy === value}
            onClick={() => setFilters((f) => ({ ...f, sortBy: value }))}
          />
        ))}
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition" defaultOpen>
        {[
          { label: "Brand New", value: "NEW" },
          { label: "Like New", value: "LIKE_NEW" },
          { label: "Good", value: "GOOD" },
          { label: "Fair", value: "FAIR" },
          { label: "For Parts / Poor", value: "POOR" },
        ].map(({ label, value }) => (
          <FilterPill
            key={value}
            label={label}
            active={filters.condition === value}
            onClick={() => setFilter("condition", value)}
          />
        ))}
      </FilterSection>

      {/* Listing Type */}
      <FilterSection title="Listing Type">
        {[
          { label: "Items / Products", value: "ITEM" },
          { label: "Services", value: "SERVICE" },
        ].map(({ label, value }) => (
          <FilterPill
            key={value}
            label={label}
            active={filters.listingType === value}
            onClick={() => setFilter("listingType", value)}
          />
        ))}
      </FilterSection>

      {/* Pricing Type */}
      <FilterSection title="Pricing">
        {[
          { label: "Fixed Price", value: "FIXED" },
          { label: "Negotiable", value: "NEGOTIABLE" },
          { label: "Free", value: "FREE" },
          { label: "Contact for Price", value: "CONTACT_FOR_PRICE" },
        ].map(({ label, value }) => (
          <FilterPill
            key={value}
            label={label}
            active={filters.pricingType === value}
            onClick={() => setFilter("pricingType", value)}
          />
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
          />
          <span className="text-slate-400 text-xs shrink-0">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
          />
        </div>
      </FilterSection>

      {/* Category Tree */}
      <FilterSection title="Categories" defaultOpen={false}>
        <div className="space-y-0.5">
          <Link
            href="/listings"
            className={`flex items-center py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              !categoryId
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            All Categories
          </Link>
          {rootCategories.map((cat) => (
            <CategoryTreeNode
              key={cat.id}
              cat={cat}
              allCats={allCategories}
              activeCategoryId={categoryId}
            />
          ))}
        </div>
      </FilterSection>

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center justify-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Clear All Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      )}
    </div>
  );

  return (
    <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

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
              className={`p-2.5 transition-all ${viewLayout === "row" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout("grid")}
              title="Grid layout"
              className={`p-2.5 transition-all ${viewLayout === "grid" ? "bg-emerald-600 text-white" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
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

        {/* ─── Sidebar ──────────────────────────────────────────────────── */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-20">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                Filters
              </span>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-bold rounded-full bg-emerald-600 text-white px-2 py-0.5">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            {sidebarContent}
          </div>
        </aside>

        {/* ─── Mobile Filters Drawer ────────────────────────────────────── */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Filters</span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        )}

        {/* ─── Listing Results ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <div className="w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading listings…</p>
            </div>
          ) : sortedListings.length > 0 ? (
            <>
              {viewLayout === "row" ? (
                <div className="space-y-3">
                  {sortedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} layout="row" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
              <div className="text-5xl">📦</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {activeFilterCount > 0 ? "No Matches Found" : "No Listings Found"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeFilterCount > 0
                  ? "No listings match your current filters. Try adjusting or clearing them."
                  : currentCategory
                  ? `No active listings in "${currentCategory.name}" or its subcategories.`
                  : "No active listings are currently available."}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="btn-secondary text-xs px-4 py-2.5 inline-flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/listings/new"
                  className="btn-primary text-xs px-4 py-2.5 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Post the First Ad
                </Link>
                {currentCategory && (
                  <Link href="/listings" className="btn-secondary text-xs px-4 py-2.5 inline-block">
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
