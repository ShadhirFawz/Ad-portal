"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import type { Listing } from "@/types/listing";
import DashboardListingCard from "./DashboardListingCard";

interface SpotlightSectionProps {
  listings: Listing[];
  loading?: boolean;
}

export default function SpotlightSection({
  listings,
  loading = false,
}: SpotlightSectionProps) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Group listings in pairs for 2-column, 1-row layout
  const pairs: Listing[][] = [];
  for (let i = 0; i < listings.length; i += 2) {
    pairs.push(listings.slice(i, i + 2));
  }

  const maxIndex = Math.max(0, pairs.length - 1);

  const nextSlide = useCallback(() => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isHovered || maxIndex <= 0 || loading) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isHovered, maxIndex, loading, nextSlide]);

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-slate-100 dark:bg-slate-850 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-100 dark:bg-slate-850 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (listings.length === 0) return null;

  const currentPair = pairs[index] || [];

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="space-y-3.5"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Star className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Spotlight Listings
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wide">
                Pinned Top
              </span>
            </div>
          </div>
        </div>

        {/* Navigation & Link */}
        <div className="flex items-center gap-2">
          {maxIndex > 0 && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Spotlight pair"
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Spotlight pair"
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <Link
            href="/promotions"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 ml-2"
          >
            <span>Promote Ad</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2 Cards in 2 Columns x 1 Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300">
        {currentPair.map((listing) => (
          <DashboardListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Pagination Dots */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          {pairs.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to spotlight slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === i
                  ? "w-6 bg-amber-500"
                  : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-amber-300"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
