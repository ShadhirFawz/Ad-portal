"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { getListings } from "@/lib/api/listings";
import { getCategories } from "@/lib/api/categories";
import type { Category } from "@/types/category";
import type { Listing } from "@/types/listing";
import ListingSearchResultItem from "@/components/listings/ListingSearchResultItem";

type GlobalListingSearchProps = {
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
};

const MIN_CHARS = 2;

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

export default function GlobalListingSearch({
  className = "",
  compact = false,
  onNavigate,
}: GlobalListingSearchProps) {
  const router = useRouter();
  const { accessToken } = useAuth();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((data) => {
        if (mounted) {
          setCategories(data.filter((category) => category.active));
        }
      })
      .catch(() => {
        if (mounted) {
          setCategories([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_CHARS) {
      return;
    }

    let mounted = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getListings(
          {
            page: 0,
            size: 12,
            search: trimmed,
            sortBy: "newest",
          },
          undefined,
          accessToken
        );

        if (!mounted) return;
        setResults(response.content ?? []);
      } catch {
        if (!mounted) return;
        setResults([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [query, accessToken]);

  const normalizedQuery = normalizeValue(query);

  const exactMatches = useMemo(() => {
    if (!normalizedQuery) return [];
    return results.filter((item) => {
      const title = normalizeValue(item.title || "");
      const slug = normalizeValue(item.slug || "");
      return title === normalizedQuery || slug === normalizedQuery;
    });
  }, [results, normalizedQuery]);

  const relatedMatches = useMemo(() => {
    const exactIds = new Set(exactMatches.map((item) => item.id));
    return results.filter((item) => !exactIds.has(item.id));
  }, [results, exactMatches]);

  const slugSuggestions = useMemo(() => {
    if (!normalizedQuery) return [];

    const collected = new Set<string>();
    const list: string[] = [];

    const pushSlug = (value?: string | null) => {
      const slug = (value || "").trim().toLowerCase();
      if (!slug) return;
      if (collected.has(slug)) return;
      collected.add(slug);
      list.push(slug);
    };

    [...exactMatches, ...relatedMatches].forEach((item) => {
      const slug = item.slug?.toLowerCase() || "";
      if (slug && slug.includes(normalizedQuery)) {
        pushSlug(slug);
      }
    });

    categories.forEach((category) => {
      const slug = category.slug?.toLowerCase() || "";
      const name = category.name?.toLowerCase() || "";
      if (slug.includes(normalizedQuery) || name.includes(normalizedQuery)) {
        pushSlug(slug);
      }
    });

    return list.slice(0, 8);
  }, [categories, exactMatches, relatedMatches, normalizedQuery]);

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
  };

  const showDropdown = open && query.trim().length >= MIN_CHARS;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          runSearch();
        }}
        className="relative"
      >
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4`} />
        <input
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (value.trim().length < MIN_CHARS) {
              setResults([]);
              setLoading(false);
            }
            setOpen(true);
          }}
          placeholder="Search listings by title, keyword, or slug"
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
            {loading ? (
              <div className="py-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                Searching...
              </div>
            ) : (
              <>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    Exact Matching Listings
                  </p>
                  {exactMatches.length > 0 ? (
                    <div className="space-y-2">
                      {exactMatches.map((listing) => (
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
                      No exact listing match for this term.
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    Related Listings
                  </p>
                  {relatedMatches.length > 0 ? (
                    <div className="space-y-2">
                      {relatedMatches.slice(0, 6).map((listing) => (
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
                      No related listing results found.
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                    Similar Slug Suggestions
                  </p>
                  {slugSuggestions.length > 0 ? (
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
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No similar slugs available.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 px-3 py-2.5">
            <button
              type="button"
              onClick={() => runSearch()}
              className="w-full rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium py-2 hover:opacity-90 transition"
            >
              View all results in Listings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
