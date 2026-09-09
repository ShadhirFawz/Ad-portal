"use client";

import { useState, useRef, useEffect, useId } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  LayoutList,
  RotateCcw,
  Check,
  Tag,
  DollarSign,
  Package,
  Sparkles,
} from "lucide-react";

export interface HorizontalFilterState {
  search: string;
  status?: string; // "ALL" | "ACTIVE" | "SOLD" | "DRAFT"
  condition: string;
  pricingType: string;
  listingType: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

export const DEFAULT_HORIZONTAL_FILTERS: HorizontalFilterState = {
  search: "",
  status: "ALL",
  condition: "",
  pricingType: "",
  listingType: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt,desc",
};

interface StatusOption {
  value: string;
  label: string;
  colorClass?: string;
  dotColor?: string;
  count?: number;
}

interface HorizontalFilterBarProps {
  filters: HorizontalFilterState;
  onChange: (newFilters: HorizontalFilterState) => void;
  onReset: () => void;
  showStatusFilter?: boolean;
  statusOptions?: StatusOption[];
  showLayoutToggle?: boolean;
  layout?: "grid" | "row";
  onLayoutChange?: (layout: "grid" | "row") => void;
  totalCount?: number;
  filteredCount?: number;
  searchPlaceholder?: string;
  accentColor?: "emerald" | "rose";
}

const CONDITION_OPTIONS = [
  { value: "", label: "All Conditions" },
  { value: "NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
  { value: "POOR", label: "Poor" },
  { value: "REFURBISHED", label: "Refurbished" },
];

const PRICING_OPTIONS = [
  { value: "", label: "All Pricing" },
  { value: "FIXED", label: "Fixed Price" },
  { value: "NEGOTIABLE", label: "Negotiable" },
  { value: "FREE", label: "Free" },
  { value: "CONTACT_FOR_PRICE", label: "Contact for Price" },
];

const LISTING_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "ITEM", label: "Physical Items" },
  { value: "SERVICE", label: "Services" },
];

const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Newest First" },
  { value: "createdAt,asc", label: "Oldest First" },
  { value: "price,asc", label: "Price: Low to High" },
  { value: "price,desc", label: "Price: High to Low" },
  { value: "viewCount,desc", label: "Most Viewed" },
  { value: "favoriteCount,desc", label: "Most Favorited" },
];

export default function HorizontalFilterBar({
  filters,
  onChange,
  onReset,
  showStatusFilter = false,
  statusOptions,
  showLayoutToggle = true,
  layout = "grid",
  onLayoutChange,
  totalCount,
  filteredCount,
  searchPlaceholder = "Search listings...",
  accentColor = "emerald",
}: HorizontalFilterBarProps) {
  const [pricePopoverOpen, setPricePopoverOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState(filters.minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(filters.maxPrice);

  const pricePopoverRef = useRef<HTMLDivElement>(null);

  // Sync temp price inputs when filters change
  useEffect(() => {
    setTempMinPrice(filters.minPrice);
    setTempMaxPrice(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  // Click outside to close price popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        pricePopoverRef.current &&
        !pricePopoverRef.current.contains(e.target as Node)
      ) {
        setPricePopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApplyPrice = () => {
    onChange({
      ...filters,
      minPrice: tempMinPrice,
      maxPrice: tempMaxPrice,
    });
    setPricePopoverOpen(false);
  };

  const handleClearPrice = () => {
    setTempMinPrice("");
    setTempMaxPrice("");
    onChange({
      ...filters,
      minPrice: "",
      maxPrice: "",
    });
    setPricePopoverOpen(false);
  };

  // Count active non-default filters
  const activeFiltersCount = [
    Boolean(filters.search.trim()),
    Boolean(showStatusFilter && filters.status && filters.status !== "ALL"),
    Boolean(filters.condition),
    Boolean(filters.pricingType),
    Boolean(filters.listingType),
    Boolean(filters.minPrice || filters.maxPrice),
    filters.sortBy !== "createdAt,desc",
  ].filter(Boolean).length;

  const isPriceActive = Boolean(filters.minPrice || filters.maxPrice);

  const accentStyles =
    accentColor === "rose"
      ? {
        activeTab: "bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/40 font-bold",
        activeBadge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        button: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
        ring: "focus:border-rose-500 focus:ring-rose-500/20",
      }
      : {
        activeTab: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/40 font-bold",
        activeBadge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
        ring: "focus:border-emerald-500 focus:ring-emerald-500/20",
      };

  return (
    <div className="space-y-3 w-full">
      {/* Main Filter Bar Card */}
      <div className="p-3 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xs space-y-3">
        {/* Row 1: Search & Primary Selects & Actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                onChange({ ...filters, search: e.target.value })
              }
              placeholder={searchPlaceholder}
              className={`w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition ${accentStyles.ring}`}
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, search: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls Cluster */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* Condition Select */}
            <div className="relative shrink-0">
              <select
                value={filters.condition}
                onChange={(e) =>
                  onChange({ ...filters, condition: e.target.value })
                }
                className={`appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl text-xs font-semibold border cursor-pointer transition ${filters.condition
                    ? `${accentStyles.activeBadge} font-bold border-current`
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  } ${accentStyles.ring}`}
              >
                {CONDITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Pricing Type Select */}
            <div className="relative shrink-0">
              <select
                value={filters.pricingType}
                onChange={(e) =>
                  onChange({ ...filters, pricingType: e.target.value })
                }
                className={`appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl text-xs font-semibold border cursor-pointer transition ${filters.pricingType
                    ? `${accentStyles.activeBadge} font-bold border-current`
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  } ${accentStyles.ring}`}
              >
                {PRICING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Price Range Popover Trigger */}
            <div className="relative shrink-0" ref={pricePopoverRef}>
              <button
                type="button"
                onClick={() => setPricePopoverOpen((p) => !p)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold border transition cursor-pointer ${isPriceActive
                    ? `${accentStyles.activeBadge} font-bold border-current`
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>
                  {isPriceActive
                    ? `${filters.minPrice || "0"} - ${filters.maxPrice || "Any"}`
                    : "Price"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${pricePopoverOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Price Popover Panel */}
              {pricePopoverOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Price Range
                    </p>
                    {isPriceActive && (
                      <button
                        type="button"
                        onClick={handleClearPrice}
                        className="text-[11px] font-semibold text-rose-500 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={tempMinPrice}
                        onChange={(e) => setTempMinPrice(e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <span className="text-slate-400 text-xs font-bold">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={tempMaxPrice}
                        onChange={(e) => setTempMaxPrice(e.target.value)}
                        className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPricePopoverOpen(false)}
                      className="flex-1 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyPrice}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold shadow-xs ${accentStyles.button}`}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  onChange({ ...filters, sortBy: e.target.value })
                }
                className={`appearance-none pl-3.5 pr-8 py-2.5 rounded-2xl text-xs font-semibold border cursor-pointer transition ${filters.sortBy !== "createdAt,desc"
                    ? `${accentStyles.activeBadge} font-bold border-current`
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  } ${accentStyles.ring}`}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Layout Toggle Button */}
            {showLayoutToggle && onLayoutChange && (
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shrink-0">
                <button
                  type="button"
                  onClick={() => onLayoutChange("grid")}
                  aria-label="Grid View"
                  title="Grid View"
                  className={`p-1.5 rounded-xl transition cursor-pointer ${layout === "grid"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onLayoutChange("row")}
                  aria-label="List View"
                  title="List View"
                  className={`p-1.5 rounded-xl transition cursor-pointer ${layout === "row"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Status Filter Tabs (if applicable) & Listing Type Selector */}
        {showStatusFilter && statusOptions && statusOptions.length > 0 && (
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex-wrap">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto scrollbar-none">
              {statusOptions.map((opt) => {
                const isActive = (filters.status || "ALL") === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onChange({ ...filters, status: opt.value })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isActive
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    {opt.dotColor && (
                      <span
                        className={`w-2 h-2 rounded-full ${opt.dotColor}`}
                      />
                    )}
                    <span>{opt.label}</span>
                    {typeof opt.count === "number" && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            : "bg-slate-200/60 dark:bg-slate-700/60 text-slate-500"
                          }`}
                      >
                        {opt.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Active Filter Chips Bar */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between gap-3 px-1 py-1 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium">Active filters:</span>

            {/* Search chip */}
            {filters.search.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                Search: &ldquo;{filters.search}&rdquo;
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, search: "" })}
                  className="hover:text-rose-500 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Status chip */}
            {showStatusFilter &&
              filters.status &&
              filters.status !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                  Status: {filters.status}
                  <button
                    type="button"
                    onClick={() => onChange({ ...filters, status: "ALL" })}
                    className="hover:text-rose-500 p-0.5 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

            {/* Condition chip */}
            {filters.condition && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                Condition:{" "}
                {
                  CONDITION_OPTIONS.find((c) => c.value === filters.condition)
                    ?.label
                }
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, condition: "" })}
                  className="hover:text-rose-500 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Pricing type chip */}
            {filters.pricingType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                Pricing:{" "}
                {
                  PRICING_OPTIONS.find((p) => p.value === filters.pricingType)
                    ?.label
                }
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, pricingType: "" })}
                  className="hover:text-rose-500 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Listing type chip */}
            {filters.listingType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                Type:{" "}
                {
                  LISTING_TYPE_OPTIONS.find(
                    (t) => t.value === filters.listingType
                  )?.label
                }
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, listingType: "" })}
                  className="hover:text-rose-500 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Price chip */}
            {isPriceActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                Price: ${filters.minPrice || "0"} - ${filters.maxPrice || "Any"}
                <button
                  type="button"
                  onClick={handleClearPrice}
                  className="hover:text-rose-500 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Reset All Button */}
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 ml-1.5 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </button>
          </div>

          {/* Filter Result Counter */}
          {typeof filteredCount === "number" && typeof totalCount === "number" && (
            <p className="text-xs text-slate-400 font-medium shrink-0">
              Showing <strong>{filteredCount}</strong> of {totalCount} items
            </p>
          )}
        </div>
      )}
    </div>
  );
}
