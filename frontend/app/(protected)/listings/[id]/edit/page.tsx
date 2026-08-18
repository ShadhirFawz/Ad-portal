"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getListing, publishListing } from "@/lib/api/listings";
import ListingImageUploader from "@/components/listings/ListingImageUploader";
import type { Listing } from "@/types/listing";
import type { ListingImage } from "@/types/listing-image";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditListingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;

  const router = useRouter();
  const { user, accessToken, loading } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [fetching, setFetching] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (!listingId) return;

    let isMounted = true;

    async function loadData() {
      try {
        setFetching(true);
        setError(null);
        const data = await getListing(listingId);
        if (isMounted) {
          setListing(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load listing."
          );
        }
      } finally {
        if (isMounted) {
          setFetching(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [listingId, user, loading, router]);

  const handleImagesChange = (updatedImages: ListingImage[]) => {
    setListing((prev) => (prev ? { ...prev, images: updatedImages } : null));
  };

  const handlePublish = async () => {
    if (!accessToken || !listing) return;

    setPublishing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await publishListing(accessToken, listing.id);
      setListing(updated);
      setSuccessMessage("Listing published successfully!");
      // Briefly show message then navigate to public listing page
      setTimeout(() => {
        router.push(`/listings/${listing.id}`);
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish listing. Ensure at least one primary image is set."
      );
    } finally {
      setPublishing(false);
    }
  };

  if (loading || fetching) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Loading listing...
          </p>
        </div>
      </main>
    );
  }

  if (error && !listing) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <h2 className="font-bold text-lg mb-2">Error Loading Listing</h2>
          <p className="text-sm">{error}</p>
          <div className="mt-4">
            <Link
              href="/profile"
              className="text-sm font-semibold underline hover:no-underline"
            >
              Back to My Profile
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!listing) return null;

  const isDraft = listing.status === "DRAFT";

  return (
    <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Manage Listing Photos
            </h1>
            <span
              className={`
                px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                ${
                  listing.status === "DRAFT"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                    : listing.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }
              `}
            >
              {listing.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {listing.title} • Category: {listing.categoryName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/listings/${listing.id}`}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            Preview Listing
          </Link>
          {isDraft && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition flex items-center gap-2"
            >
              {publishing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Listing"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 dark:text-rose-400 hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 text-sm font-medium">
          {successMessage}
        </div>
      )}

      {/* Draft Guidance Notice */}
      {isDraft && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 text-slate-700 dark:text-slate-300 text-sm flex items-start gap-3">
          <span className="text-xl">📸</span>
          <div className="space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white">
              Listing Step 2: Upload Images & Set Primary Photo
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload at least 1 high quality image before publishing. The first uploaded photo is automatically made the primary cover photo, or you can pick any photo as primary and drag to reorder.
            </p>
          </div>
        </div>
      )}

      {/* Image Uploader Component */}
      <section className="bg-white dark:bg-slate-900/70 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <ListingImageUploader
          listingId={listing.id}
          initialImages={listing.images}
          onChange={handleImagesChange}
        />
      </section>

      {/* Bottom Publish Bar for Draft */}
      {isDraft && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ready to go live?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Make sure your cover photo and details look accurate.
            </p>
          </div>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 disabled:opacity-50 transition"
          >
            {publishing ? "Publishing..." : "Publish Listing Now"}
          </button>
        </div>
      )}
    </main>
  );
}
