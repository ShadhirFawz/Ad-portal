"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  ShieldCheck,
  Zap,
  MapPin,
  TrendingUp,
  Tag,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { getRootCategories } from "@/lib/api/categories";
import type { Category } from "@/types/category";

const QUICK_TAGS = [
  { label: "Vehicles", query: "vehicles" },
  { label: "Smartphones", query: "phones" },
  { label: "Laptops", query: "laptops" },
  { label: "Real Estate", query: "property" },
  { label: "Electronics", query: "electronics" },
  { label: "Services", query: "services" },
];

export default function DashboardHero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let isMounted = true;
    getRootCategories()
      .then((data) => {
        if (isMounted) setCategories(data ?? []);
      })
      .catch((err) => {
        console.error("Failed to load hero categories:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    router.push(`/listings?${params.toString()}`);
  };

  const handleQuickTagClick = (tagQuery: string) => {
    router.push(`/listings?search=${encodeURIComponent(tagQuery)}`);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 sm:p-10 lg:p-12 shadow-xl">
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Top Platform Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Verified Local Marketplace</span>
          <span className="text-emerald-400 dark:text-emerald-500">|</span>
          <span>Buy, Sell & Trade</span>
        </div>

        {/* Main Hero Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Discover Quality Listings &amp; Trade with{" "}
            <span className="text-emerald-600 dark:text-emerald-400">Confidence</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect directly with verified local buyers and sellers. Browse authentic deals, live auctions, and promoted items across Sri Lanka.
          </p>
        </div>

        {/* Interactive Search Bar Form */}
        <form
          onSubmit={handleSearch}
          className="mt-6 p-2 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          {/* Category Dropdown */}
          <div className="relative shrink-0 sm:w-44 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700/60 pb-2 sm:pb-0 sm:pr-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                All Categories
              </option>
              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.slug}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 flex items-center px-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
            <input
              type="text"
              placeholder="Search by keywords, model, brand or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            <Link
              href="/listings/new"
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Post Ad</span>
            </Link>
          </div>
        </form>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Popular:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleQuickTagClick(tag.query)}
              className="px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/70 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-800 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 font-medium border border-slate-200/60 dark:border-slate-700/50 transition-colors cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Feature Trust Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-center gap-2.5 p-2 text-left">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Verified Sellers</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Authentic user profiles</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-2 text-left">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Instant Contact</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">WhatsApp &amp; Direct Call</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-2 text-left">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">High Visibility</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Spotlight &amp; Power Pack</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-2 text-left">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Local Deals</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Islandwide discovery</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
