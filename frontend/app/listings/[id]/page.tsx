"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getListing } from "@/lib/api/listings";
import ListingImageGallery from "@/components/listings/ListingImageGallery";
import type { Listing } from "@/types/listing";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ListingDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;

  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;

    let isMounted = true;

    async function fetchListing() {
      try {
        setLoading(true);
        setError(null);
        const data = await getListing(listingId);
        if (isMounted) {
          setListing(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load listing details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchListing();

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  if (loading) {
    return (
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Loading listing...
          </p>
        </div>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-4">
          <div className="text-4xl">🔍</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Listing Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {error || "The listing you are looking for does not exist or may have been removed."}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isOwner = user?.id === listing.sellerId;

  const formatPrice = () => {
    if (listing.pricingType === "FREE") return "Free";
    if (listing.pricingType === "CONTACT_FOR_PRICE") return "Contact for Price";
    const currency = listing.currency ?? "LKR";
    return `${currency} ${Number(listing.price).toLocaleString()}`;
  };

  const formatCondition = (cond: string) => {
    switch (cond) {
      case "NEW":
        return "Brand New";
      case "LIKE_NEW":
        return "Like New";
      case "GOOD":
        return "Good Condition";
      case "FAIR":
        return "Fair";
      case "POOR":
        return "For Parts / Poor";
      default:
        return cond;
    }
  };

  const locationString = [listing.city, listing.district, listing.province]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Category / Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-600 transition">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {listing.categoryName}
          </span>
          <span>/</span>
          <span className="truncate max-w-[200px] sm:max-w-xs text-slate-900 dark:text-white font-semibold">
            {listing.title}
          </span>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              href={`/listings/${listing.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Manage Photos & Edit
            </Link>
          </div>
        )}
      </div>

      {/* Main 2-Column Responsive Layout (Section 19) */}
      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Left Column: Image Gallery */}
        <div className="w-full lg:sticky lg:top-8">
          <ListingImageGallery
            images={listing.images}
            title={listing.title}
          />
        </div>

        {/* Right Column: Listing Details */}
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {formatCondition(listing.condition)}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {listing.listingType}
              </span>
              {listing.status && listing.status !== "ACTIVE" && (
                <span
                  className={`
                    rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider
                    ${
                      listing.status === "DRAFT"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }
                  `}
                >
                  {listing.status}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {listing.title}
            </h1>

            {/* Price Section */}
            <div className="flex items-baseline gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {formatPrice()}
              </span>
              {listing.negotiable && listing.pricingType !== "FREE" && (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300">
                  Negotiable
                </span>
              )}
            </div>

            {/* Location & Time Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2">
              {locationString && (
                <div className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{locationString}</span>
                </div>
              )}
              {listing.publishedAt && (
                <div className="flex items-center gap-1">
                  <span>Published:</span>
                  <span>{new Date(listing.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Seller Profile Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
                {listing.sellerUsername ? listing.sellerUsername.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Listed By
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  @{listing.sellerUsername || "Seller"}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition"
              onClick={() => alert(`Contacting seller @${listing.sellerUsername}`)}
            >
              Contact Seller
            </button>
          </div>

          {/* Description Section */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Description
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
              {listing.description}
            </div>
          </div>

          {/* Additional Details Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Listing Details
            </h3>
            <dl className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Category</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {listing.categoryName}
                </dd>
              </div>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Condition</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatCondition(listing.condition)}
                </dd>
              </div>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Available Quantity</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {listing.availableQuantity ?? listing.quantity}
                </dd>
              </div>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <dt className="text-slate-400">Location Type</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {listing.locationType || "Standard"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
