"use client";

import { useState, FormEvent, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getRootCategories } from "@/lib/api/categories";
import type { Category } from "@/types/category";
import { Gavel, Phone, UserRoundCheck } from "lucide-react";

const POPULAR_TERMS = [
  "iPhone 15",
  "Toyota Aqua",
  "Apartment Colombo",
  "MacBook Pro",
  "Land Kandy",
  "Honda Vezel",
];

export default function DashboardHero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    getRootCategories()
      .then((data) => {
        if (mounted) setCategories(data ?? []);
      })
      .catch(() => { });
    return () => {
      mounted = false;
    };
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter categories matching the typed keyword
  const suggestedCategories = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase();
    return categories
      .filter((c) => c.name.toLowerCase().includes(query))
      .slice(0, 5);
  }, [searchTerm, categories]);

  const submitSearch = (term?: string, catSlug?: string) => {
    const params = new URLSearchParams();
    const query = (term ?? searchTerm).trim();
    const category = catSlug !== undefined ? catSlug : selectedCategory;

    if (query) params.set("search", query);
    if (category) params.set("category", category);
    setSuggestOpen(false);
    router.push(`/listings?${params.toString()}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitSearch();
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-slate-50/70 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors">
      {/* Subtle radial ambient highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[48rem] h-[24rem] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl"
      />

      {/* ── Top-right logo ─────────────────────────────────────────── */}
      <div className="pointer-events-none absolute top-0 right-2 sm:top-7 sm:right-8 lg:top-9 lg:right-10 z-20">
        <Link
          href="/"
          aria-label="Wudo home"
          className="pointer-events-auto inline-flex items-center group"
        >
          {/* Light mode logo */}
          <Image
            src="/Wudo_logo_light.png"
            alt="Wudo"
            width={800}
            height={1200}
            priority
            className="h-14 sm:h-16 lg:h-20 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity dark:hidden"
          />
          {/* Dark mode logo */}
          <Image
            src="/Wudo_logo_dark.png"
            alt="Wudo"
            width={800}
            height={1200}
            priority
            className="h-14 sm:h-16 lg:h-20 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity hidden dark:block"
          />
        </Link>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12 sm:pb-14">
        {/* Eyebrow badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60">
            Sri Lanka
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Verified Community Marketplace
          </span>
        </div>

        {/* Main Headline */}
        <div className="mt-5 max-w-3xl space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Find what you need.
            <br />
            <span className="text-slate-400 dark:text-slate-500 font-bold">
              Sell what you don&apos;t.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Direct trades, active auctions, and verified local listings with
            transparent pricing and zero hidden fees.
          </p>
        </div>

        {/* Search Bar Container */}
        <div ref={wrapperRef} className="relative mt-8 sm:mt-10 max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-stretch rounded-2xl bg-white dark:bg-slate-900 border border-slate-300/90 dark:border-slate-700/80 shadow-lg shadow-slate-900/5 dark:shadow-black/20 focus-within:border-indigo-600 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all overflow-hidden p-1 sm:p-1.5 gap-1.5"
          >
            {/* Category Select Dropdown */}
            <div className="relative sm:w-48 shrink-0 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/40">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="w-full h-full bg-transparent pl-3.5 pr-8 py-3 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer appearance-none truncate"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  backgroundSize: "14px",
                }}
              >
                <option
                  value=""
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  All Categories
                </option>
                {categories.map((c) => (
                  <option
                    key={c.id}
                    value={c.slug}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Input */}
            <div className="relative flex-1 flex items-center px-3 py-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                placeholder="Search phones, vehicles, property, jobs..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none py-2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 sm:px-7 py-3 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors shadow-sm cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Real-time Category Match Dropdown */}
          {suggestOpen && suggestedCategories.length > 0 && (
            <div className="absolute z-30 left-0 right-0 mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Matching Categories
                </p>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {suggestedCategories.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => submitSearch(undefined, c.slug)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Explore
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Popular searches inline text */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm">
          <span className="text-slate-400 dark:text-slate-500 font-medium">
            Popular:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {POPULAR_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => submitSearch(term)}
                className="px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/70 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200/60 dark:border-slate-700/50 transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Market signals & Quick CTAs */}
        <div className="mt-10 pt-6 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[8px] sm:text-sm text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-5 h-5 rounded-[5px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <UserRoundCheck className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Verified Profiles
              </span>
            </span>

            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-5 h-5 rounded-[5px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <Gavel className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Live Bidding
              </span>
            </span>

            <span className="inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-5 h-5 rounded-[5px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <Phone className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Direct Contact
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/listings/new"
              className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline underline-offset-4 transition-colors"
            >
              Post an Ad
            </Link>
            <span
              className="text-slate-300 dark:text-slate-700"
              aria-hidden="true"
            >
              |
            </span>
            <Link
              href="/listings"
              className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}