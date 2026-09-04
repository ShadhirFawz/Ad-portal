"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getMyBookmarks } from "@/lib/api/listings";
import type { Listing } from "@/types/listing";
import ListingCard from "@/components/listings/ListingCard";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Lock,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const PAGE_SIZE = 8;

export default function BookmarksPage() {
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();

  const [bookmarks, setBookmarks] = useState<Listing[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
  }, [user, loading, router]);

  const fetchBookmarks = useCallback(
    async (page: number) => {
      if (!user) return;
      setBookmarksLoading(true);
      try {
        const result = await getMyBookmarks(accessToken, page, PAGE_SIZE);
        setBookmarks(result.content ?? []);
        setTotalPages(result.totalPages ?? 0);
        setTotalElements(result.totalElements ?? 0);
        setCurrentPage(page);
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setBookmarksLoading(false);
      }
    },
    [user, accessToken]
  );

  useEffect(() => {
    if (user) {
      fetchBookmarks(0);
    }
  }, [user, fetchBookmarks]);

  const handlePageChange = (page: number) => {
    if (page < 0 || (totalPages > 0 && page >= totalPages) || page === currentPage) {
      return;
    }
    fetchBookmarks(page);
  };

  if (loading || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          Loading bookmarks...
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-emerald-500" />
          <span>Explore All Ads</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  My Bookmarks
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-3 h-3" />
                  Private to you
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Listings you&apos;ve privately saved for later reference. These are invisible to other users.
              </p>
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0 || bookmarksLoading}
              aria-label="Previous Page"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || bookmarksLoading}
              aria-label="Next Page"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bookmarks Content */}
      {bookmarksLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Loading your bookmarks…
          </p>
        </div>
      ) : bookmarks.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing {bookmarks.length} of {totalElements} saved bookmark{totalElements !== 1 ? "s" : ""}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {bookmarks.map((listing) => (
              <ListingCard key={listing.id} listing={listing} layout="grid" />
            ))}
          </div>

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || bookmarksLoading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePageChange(i)}
                  disabled={bookmarksLoading}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${i === currentPage
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || bookmarksLoading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-900 hover:text-slate-900 dark:hover:border-white dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
            <Bookmark className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Bookmarks Saved
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              You haven&apos;t bookmarked any listings yet. While browsing ads, click the <strong>Bookmark</strong> button to privately save listings here for later reference.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/listings"
              className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-1.5 shadow-sm"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
