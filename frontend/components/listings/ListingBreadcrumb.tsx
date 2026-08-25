"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { CategoryBreadcrumb } from "@/types/category";

interface ListingBreadcrumbProps {
  breadcrumbs?: CategoryBreadcrumb[] | null;
  fallbackCategoryName?: string;
  fallbackCategoryId?: string;
  currentTitle?: string;
  className?: string;
}

export default function ListingBreadcrumb({
  breadcrumbs,
  fallbackCategoryName,
  fallbackCategoryId,
  currentTitle,
  className = "",
}: ListingBreadcrumbProps) {
  // Normalize items to render
  let items: { id?: string; name: string; slug?: string }[] = [];

  if (breadcrumbs && breadcrumbs.length > 0) {
    items = breadcrumbs.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
    }));
  } else if (fallbackCategoryName) {
    items = [
      {
        id: fallbackCategoryId,
        name: fallbackCategoryName,
      },
    ];
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1.5">
        {/* Home */}
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            title="Go to Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>

        {/* All Listings link */}
        <li className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
          <Link
            href="/listings"
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
          >
            Listings
          </Link>
        </li>

        {/* Category Hierarchy */}
        {items.map((item, index) => {
          const isLastCategory = index === items.length - 1 && !currentTitle;

          return (
            <li key={item.id ?? index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
              {item.id && !isLastCategory ? (
                <Link
                  href={`/listings?category=${item.id}`}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ) : (
                <span
                  className={
                    isLastCategory
                      ? "font-semibold text-slate-900 dark:text-white"
                      : "font-medium text-slate-700 dark:text-slate-300"
                  }
                >
                  {item.name}
                </span>
              )}
            </li>
          );
        })}

        {/* Current Title (e.g. Listing Title) */}
        {currentTitle && (
          <li className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            <span
              className="truncate max-w-[180px] sm:max-w-[280px] md:max-w-xs text-slate-900 dark:text-white font-semibold"
              title={currentTitle}
            >
              {currentTitle}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
