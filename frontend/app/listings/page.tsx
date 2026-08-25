"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Layers, Plus, Sparkles, Filter } from "lucide-react";

function ListingsContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  const [listings, setListings] = useState<Listing[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CategoryBreadcrumb[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [allCats, listingsData] = await Promise.all([
          getCategories(),
          categoryId
            ? getListingsByCategory(categoryId, 0, 24)
            : getListings(0, 24),
        ]);

        if (!isMounted) return;

        setListings(listingsData.content ?? []);
        setTotalCount(listingsData.totalElements ?? 0);

        if (categoryId) {
          // Find selected category
          const found = allCats.find((c) => c.id === categoryId);
          if (found) {
            setCurrentCategory(found);
          } else {
            try {
              const fetched = await getCategory(categoryId);
              if (isMounted) setCurrentCategory(fetched);
            } catch {
              if (isMounted) setCurrentCategory(null);
            }
          }

          // Fetch breadcrumbs
          try {
            const crumbs = await getCategoryBreadcrumbs(categoryId);
            if (isMounted) setBreadcrumbs(crumbs);
          } catch {
            if (isMounted) {
              setBreadcrumbs(found ? [{ id: found.id, name: found.name, slug: found.slug, level: found.level }] : []);
            }
          }

          // Filter immediate subcategories
          const subs = allCats.filter((c) => c.parentId === categoryId && c.active);
          setSubcategories(subs);
        } else {
          setCurrentCategory(null);
          setBreadcrumbs([]);
          // Show root categories as quick filter
          setSubcategories(allCats.filter((c) => !c.parentId && c.active));
        }
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <ListingBreadcrumb
        breadcrumbs={breadcrumbs}
        currentTitle={currentCategory ? currentCategory.name : undefined}
      />

      {/* Category Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-10 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {currentCategory
                ? `Category Level ${currentCategory.level + 1}`
                : "Marketplace Catalog"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {currentCategory ? currentCategory.name : "Explore All Listings"}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {currentCategory?.description ||
              "Discover great deals, services, and quality items posted by verified users across all categories."}
          </p>

          <div className="flex items-center gap-4 pt-2 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{totalCount} {totalCount === 1 ? "Listing" : "Listings"} available</span>
            </span>
            {currentCategory && (
              <Link
                href="/listings"
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition"
              >
                Clear Category Filter
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories Filter Chips */}
      {subcategories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>{currentCategory ? "Subcategories" : "Popular Categories"}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/listings?category=${sub.id}`}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>{sub.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading listings...
          </p>
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-12 text-center shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="text-5xl">📦</div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No Listings Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {currentCategory
              ? `There are currently no active listings in "${currentCategory.name}" or its subcategories.`
              : "No active listings are currently available in the marketplace."}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/listings/new"
              className="btn-primary text-xs px-4 py-2.5 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Post the First Ad</span>
            </Link>
            {currentCategory && (
              <Link
                href="/listings"
                className="btn-secondary text-xs px-4 py-2.5 inline-block"
              >
                Browse All Listings
              </Link>
            )}
          </div>
        </div>
      )}
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
