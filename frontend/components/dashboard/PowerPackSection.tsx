"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { FaCrown } from "react-icons/fa";
import type { Listing } from "@/types/listing";
import PowerPackCard from "./PowerPackCard";

interface PowerPackSectionProps {
  listings: Listing[];
  loading?: boolean;
}

export default function PowerPackSection({
  listings,
  loading = false,
}: PowerPackSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticScroll = useRef(false);

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const maxIndex = Math.max(0, listings.length - 1);

  const scrollToSlide = useCallback((target: number) => {
    const container = scrollRef.current;
    const slide = slideRefs.current[target];
    if (!container || !slide) return;

    isProgrammaticScroll.current = true;
    container.scrollTo({
      left: slide.offsetLeft,
      behavior: "smooth",
    });
    setIndex(target);

    window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  }, []);

  const nextSlide = useCallback(() => {
    scrollToSlide(index >= maxIndex ? 0 : index + 1);
  }, [index, maxIndex, scrollToSlide]);

  const prevSlide = useCallback(() => {
    scrollToSlide(index <= 0 ? maxIndex : index - 1);
  }, [index, maxIndex, scrollToSlide]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isProgrammaticScroll.current) return;
      if (container.clientWidth === 0) return;

      const center = container.scrollLeft + container.clientWidth / 2;

      let bestIdx = 0;
      let bestDist = Infinity;

      slideRefs.current.forEach((slide, i) => {
        if (!slide) return;
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const dist = Math.abs(center - slideCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      });

      setIndex((prev) => (prev === bestIdx ? prev : bestIdx));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset scroll position when the listings change
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ left: 0, behavior: "auto" });
    setIndex(0);
  }, [listings]);

  // Auto-advance
  useEffect(() => {
    if (isHovered || maxIndex <= 0 || loading) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isHovered, maxIndex, loading, nextSlide]);

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-56 bg-slate-100 dark:bg-slate-850 rounded-3xl animate-pulse" />
      </section>
    );
  }

  if (listings.length === 0) return null;

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="space-y-3.5"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <FaCrown className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Power Pack
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-700 dark:text-violet-300 text-[10px] font-extrabold uppercase tracking-wide">
                Top ads
              </span>
            </div>
          </div>
        </div>

        {/* Navigation & Link */}
        <div className="flex items-center gap-2">
          {maxIndex > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Power Pack"
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Power Pack"
                className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <Link
            href="/promotions"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 ml-2"
          >
            <span>Learn More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Native horizontal snap slider */}
      <div className="-mx-4 sm:-mx-6 lg:mx-0">
        <div
          ref={scrollRef}
          className="
            flex gap-4
            overflow-x-auto snap-x snap-mandatory scroll-smooth
            px-4 sm:px-6 lg:px-0
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            overscroll-x-contain
          "
        >
          {listings.map((listing, i) => (
            <div
              key={listing.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="w-full shrink-0 snap-center"
            >
              <PowerPackCard listing={listing} />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          {listings.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to power pack slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${index === i
                ? "w-6 bg-violet-600"
                : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-violet-300"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}