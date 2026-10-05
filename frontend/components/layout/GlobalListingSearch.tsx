"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, X } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getCategories } from "@/lib/api/categories";
import type { Category } from "@/types/category";
import type { Listing } from "@/types/listing";
import ListingSearchResultItem from "@/components/listings/ListingSearchResultItem";

type GlobalListingSearchProps = {
  className?: string;
  compact?: boolean;
  variant?: "default" | "expanded" | string;
  onNavigate?: () => void;
};

const MIN_CHARS = 2;
const DEBOUNCE_MS = 350;
const SUGGESTION_COUNT = 4;

const PLACEHOLDER_POOL = [
  "Good condition laptop near Colombo",
  "Automatic car under 5 million",
  "Furnished apartment for short stays",
  "iPhone with warranty, no scratches",
  "Dell or HP laptop for office use",
  "Suzuki every, low mileage, negotiable",
  "Brand new gaming PC for streaming",
  "Wedding photographer in Kandy",
  "Samsung TV 55 inch, boxed",
  "Land for sale, close to main road",
  "Toyota Aqua with service records",
  "Air conditioner installation service",
  "Study desk for small bedroom",
  "Original branded shoes, size 42",
  "Solar panel kit for home use",
];

const SUGGESTION_POOL = [
  "Gaming laptop under 200k",
  "Honda Vezel 2016 unregistered",
  "iPhone 15 Pro max, unused",
  "3 bedroom house with garden",
  "Suzuki Swift, auto, well maintained",
  "Photographer for a small wedding",
  "Sofa set, less than 1 year used",
  "Samsung Galaxy S23, boxed",
  "Toyota Prius with full service history",
  "Dell XPS for graphic design work",
  "Apartment in Colombo, sea view",
  "Washing machine, front load, used",
  "Standing desk with adjustable height",
  "Canon DSLR with two lenses",
  "Motorcycle 150cc, low mileage",
  "Furnished annex for rent in Nugegoda",
  "Refrigerator, double door, working",
  "Office chair, ergonomic, mesh back",
  "PlayStation 5 with two controllers",
  "Solar inverter for home backup",
  "Treadmill, barely used, boxed",
  "Baby stroller, clean, no damage",
  "Electric guitar, hard case included",
  "Smart watch, sealed, warranty",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  if (arr.length <= count) return [...arr];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export default function GlobalListingSearch({
  className = "",
  compact = false,
  onNavigate,
}: GlobalListingSearchProps) {
  const router = useRouter();
  const { accessToken } = useAuth();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [placeholder, setPlaceholder] = useState<string>("Search listings with AI…");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPlaceholder(pickRandom(PLACEHOLDER_POOL, 1)[0] ?? "Search listings with AI…");
      setSuggestions(pickRandom(SUGGESTION_POOL, SUGGESTION_COUNT));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((data) => {
        if (mounted) setCategories(data.filter((c) => c.active));
      })
      .catch(() => {
        if (mounted) setCategories([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_CHARS) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/semantic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed, limit: 12 }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Search request failed");

        const data = await res.json();
        setResults(data.results ?? []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, accessToken]);

  const runSearch = useCallback(
    (value?: string) => {
      const term = (typeof value === "string" ? value : query).trim();
      if (!term) return;
      const params = new URLSearchParams();
      params.set("search", term);
      router.push(`/listings?${params.toString()}`);
      setOpen(false);
      onNavigate?.();
    },
    [query, router, onNavigate]
  );

  const clearInput = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    abortRef.current?.abort();
  };

  const applySuggestion = (value: string) => {
    setQuery(value);
    setOpen(true);
    inputRef.current?.focus();
  };

  const slugSuggestions = (() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    const seen = new Set<string>();
    const list: string[] = [];
    categories.forEach((cat) => {
      const slug = cat.slug?.toLowerCase() ?? "";
      const name = cat.name?.toLowerCase() ?? "";
      if ((slug.includes(q) || name.includes(q)) && slug && !seen.has(slug)) {
        seen.add(slug);
        list.push(slug);
      }
    });
    return list.slice(0, 6);
  })();

  const hasQuery = query.trim().length >= MIN_CHARS;
  const showDropdown = open && (hasQuery || suggestions.length > 0);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            if (value.trim().length >= MIN_CHARS) setLoading(true);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition ${compact ? "py-2.5" : "py-2.5"}`}
        />
        {query && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="absolute z-70 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          <div className="max-h-104 overflow-y-auto p-3 space-y-3">
            {/* Suggestions */}
            {!hasQuery && suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Try asking the AI
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applySuggestion(s)}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                    >
                      <Search className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results for typed query */}
            {hasQuery && (
              <>
                {loading ? (
                  <div className="py-5 flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Finding best matches with AI…</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className="h-3 w-3 text-emerald-500" />
                        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          AI Search Results
                        </p>
                      </div>
                      {results.length > 0 ? (
                        <div className="space-y-2">
                          {results.map((listing) => (
                            <ListingSearchResultItem
                              key={listing.id}
                              listing={listing}
                              href={`/listings/${listing.slug || listing.id}`}
                              onNavigate={() => {
                                setOpen(false);
                                onNavigate?.();
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          No semantically similar listings found.
                        </p>
                      )}
                    </div>

                    {slugSuggestions.length > 0 && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                          Browse Category
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {slugSuggestions.map((slug) => (
                            <button
                              key={slug}
                              type="button"
                              onClick={() => runSearch(slug)}
                              className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
                            >
                              {slug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {hasQuery && (
            <div className="border-t border-slate-200 dark:border-slate-800 px-3 py-2.5">
              <button
                type="button"
                onClick={() => runSearch()}
                className="w-full rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium py-2 hover:opacity-90 transition"
              >
                View all results in Listings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}