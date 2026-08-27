"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, X, ChevronDown, ChevronRight as ChevronRightSm, Search } from "lucide-react";
import type { Category } from "@/types/category";

// ─── Filter Section Accordion ─────────────────────────────────────────────────
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

// ─── Filter Pill ──────────────────────────────────────────────────────────────
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

// ─── Category Tree Node ────────────────────────────────────────────────────────
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

// ─── Filter Sidebar Props ─────────────────────────────────────────────────────
interface FilterSidebarProps {
  // Search
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  
  // Filters
  filters: {
    condition: string;
    pricingType: string;
    listingType: string;
    sortBy: string;
    minPrice: string;
    maxPrice: string;
  };
  onFilterChange: <K extends keyof FilterSidebarProps["filters"]>(
    key: K,
    value: FilterSidebarProps["filters"][K]
  ) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
  
  // Categories
  categories: Category[];
  currentCategoryId: string | null;
  rootCategories: Category[];
  
  // Mobile drawer state
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FilterSidebar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  filters,
  onFilterChange,
  activeFilterCount,
  onClearFilters,
  categories,
  currentCategoryId,
  rootCategories,
  isMobileOpen = false,
  onMobileClose,
}: FilterSidebarProps) {
  // Shared content that both desktop and mobile use
  const content = (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id="listing-search"
          type="text"
          placeholder="Search listings…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              // Don't clear all filters, just the search
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {searchQuery && searchQuery !== filters.search && (
        <button
          type="button"
          onClick={onSearchSubmit}
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
            onClick={() => onFilterChange("sortBy", value)}
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
            onClick={() => onFilterChange("condition", value)}
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
            onClick={() => onFilterChange("listingType", value)}
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
            onClick={() => onFilterChange("pricingType", value)}
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
            onChange={(e) => onFilterChange("minPrice", e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
          />
          <span className="text-slate-400 text-xs shrink-0">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange("maxPrice", e.target.value)}
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
              !currentCategoryId
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
              allCats={categories}
              activeCategoryId={currentCategoryId}
            />
          ))}
        </div>
      </FilterSection>

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClearFilters}
          className="w-full py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center justify-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          Clear All Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      )}
    </div>
  );

  // If this is the mobile drawer
  if (isMobileOpen) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onMobileClose}
        />
        <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto p-5">
          <div className="flex items-center justify-between mb-5">
            <span className="font-bold text-slate-900 dark:text-white text-sm">Filters</span>
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  // Desktop sidebar - only rendered when isMobileOpen is false
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm h-[calc(100vh-120px)] overflow-y-auto sticky top-20">
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
      {content}
    </div>
  );
}