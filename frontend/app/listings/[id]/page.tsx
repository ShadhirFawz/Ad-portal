"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { getListing, toggleFavoriteListing } from "@/lib/api/listings";
import ListingImageGallery from "@/components/listings/ListingImageGallery";
import ListingBreadcrumb from "@/components/listings/ListingBreadcrumb";
import SimilarListingsColumn from "@/components/listings/SimilarListingsColumn";
import RelatedCategoryListings from "@/components/listings/RelatedCategoryListings";
import LoginModal from "@/components/auth/LoginModal";
import { formatTimeAgo } from "@/lib/format/time-ago";
import {
  formatListingCondition,
  formatListingPrice,
  formatListingStatus,
  formatListingType,
  formatLocationType,
  formatModerationStatus,
  formatPricingType,
} from "@/lib/format/listing-labels";
import type { Listing } from "@/types/listing";
import {
  Clock,
  Eye,
  Heart,
  MapPin,
  Package,
  Pencil,
  Phone,
  Shield,
  Tag,
  User,
  Loader2,
} from "lucide-react";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </dt>
      <dd className="font-semibold text-slate-800 dark:text-slate-200 mt-1 text-sm">
        {value}
      </dd>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function ListingDetailsPage() {
  const routeParams = useParams();
  const listingId =
    typeof routeParams?.id === "string"
      ? routeParams.id
      : Array.isArray(routeParams?.id)
        ? routeParams.id[0]
        : "";

  const { user, accessToken, loading: authLoading } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    if (authLoading) return;

    let isMounted = true;

    async function fetchListing() {
      try {
        setLoading(true);
        setError(null);
        const data = await getListing(listingId, accessToken);
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
  }, [listingId, accessToken, authLoading]);

  const refetchListing = async () => {
    if (!listingId) return;
    try {
      const data = await getListing(listingId, accessToken);
      setListing(data);
    } catch {
      // keep existing listing on refresh failure
    }
  };

  const handleToggleFavorite = async () => {
    if (!listing) return;
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    if (favoriting) return;

    const previousIsFavorited = Boolean(listing.isFavorited);
    const previousCount = listing.favoriteCount;
    const newIsFavorited = !previousIsFavorited;
    const newCount = newIsFavorited
      ? previousCount + 1
      : Math.max(0, previousCount - 1);

    // Optimistic UI update
    setListing((prev) =>
      prev
        ? {
          ...prev,
          isFavorited: newIsFavorited,
          favoriteCount: newCount,
        }
        : null
    );

    setFavoriting(true);
    try {
      const res = await toggleFavoriteListing(accessToken, listing.id);
      setListing((prev) =>
        prev
          ? {
            ...prev,
            isFavorited: res.isFavorited,
            favoriteCount: res.favoriteCount,
          }
          : null
      );
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      // Revert optimistic update
      setListing((prev) =>
        prev
          ? {
            ...prev,
            isFavorited: previousIsFavorited,
            favoriteCount: previousCount,
          }
          : null
      );
    } finally {
      setFavoriting(false);
    }
  };

  if (loading && !listing) {
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
            {error ||
              "The listing you are looking for does not exist or may have been removed."}
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
  const isLoggedIn = Boolean(user);

  const locationParts = [listing.city, listing.district, listing.province].filter(
    Boolean
  );
  const locationString = locationParts.join(", ");

  const customAttributeEntries = Object.entries(listing.customAttributes ?? {}).filter(
    ([key, value]) => key.trim() && value !== null && value !== undefined && value !== ""
  );

  const listedAgo = formatTimeAgo(listing.createdAt);
  const updatedAgo = formatTimeAgo(listing.updatedAt);
  const publishedAgo = formatTimeAgo(listing.publishedAt);

  return (
    <>
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        {/* Breadcrumb & owner actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <ListingBreadcrumb
            breadcrumbs={listing.categoryBreadcrumbs}
            fallbackCategoryName={listing.categoryName}
            fallbackCategoryId={listing.categoryId}
            currentTitle={listing.title}
          />

          {isOwner && (
            <Link
              href={`/listings/${listing.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs transition"
            >
              <Pencil className="w-3.5 h-3.5" />
              Manage Photos &amp; Edit
            </Link>
          )}
        </div>

        {/* Header & Seller Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Image Gallery */}
          <div className="w-full lg:col-span-5 xl:col-span-4 lg:sticky lg:top-18">
            <ListingImageGallery images={listing.images} title={listing.title} />
          </div>

          {/* Header and Seller Contact */}
          <div className="w-full lg:col-span-7 xl:col-span-5 space-y-4">
            {/* Header */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {listing.condition && listing.condition !== "NOT_APPLICABLE" && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {formatListingCondition(listing.condition)}
                  </span>
                )}
                <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {formatListingType(listing.listingType)}
                </span>
                {listing.status !== "ACTIVE" && (
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${listing.status === "DRAFT"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : listing.status === "SOLD"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                  >
                    {formatListingStatus(listing.status)}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatListingPrice(listing)}
                  </span>
                  {listing.negotiable && listing.pricingType !== "FREE" && (
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300">
                      Negotiable
                    </span>
                  )}
                </div>

                {/* Favorite Action Button with Spinner */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={favoriting}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs min-w-[80px] justify-center ${listing.isFavorited
                      ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/40 dark:hover:bg-rose-950/30"
                    }`}
                  aria-label={listing.isFavorited ? "Remove from favorites" : "Save to favorites"}
                >
                  {favoriting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Heart
                        className={`w-4 h-4 transition-transform duration-200 ${listing.isFavorited
                            ? "fill-rose-500 text-rose-500 scale-110"
                            : "text-slate-400 group-hover:scale-110"
                          }`}
                      />
                      <span>{listing.isFavorited ? "Saved" : "Save"}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                {/* Location and Date - Always together on same line */}
                <div className="flex items-center gap-x-5 gap-y-1 flex-wrap">
                  {locationString && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{locationString}</span>
                    </div>
                  )}
                  {updatedAgo ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Updated {updatedAgo}</span>
                    </div>
                  ) : publishedAgo ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Published {publishedAgo}</span>
                    </div>
                  ) : listedAgo ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Listed {listedAgo}</span>
                    </div>
                  ) : null}
                </div>

                {/* Views and Favorites Counts - Always on their own line */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{listing.viewCount.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart
                      className={`h-3.5 w-3.5 shrink-0 ${listing.isFavorited ? "fill-rose-500 text-rose-500" : "text-slate-400"
                        }`}
                    />
                    <span>{listing.favoriteCount.toLocaleString()} favorites</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Contact */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-400 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                  {listing.sellerUsername
                    ? listing.sellerUsername.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Listed By
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    @{listing.sellerUsername || "Seller"}
                  </p>
                </div>
              </div>

              {isLoggedIn ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Seller Mobile
                  </p>
                  {listing.sellerPhoneNumber ? (
                    <a
                      href={`tel:${listing.sellerPhoneNumber}`}
                      className="inline-flex items-center gap-2 text-lg font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <Phone className="w-5 h-5 shrink-0" />
                      {listing.sellerPhoneNumber}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Seller has not provided a mobile number.
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30 p-4 space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sign in to view the seller&apos;s mobile number and get in
                    touch directly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLoginModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition"
                  >
                    Sign in to Contact Seller
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Similar Items */}
          <div className="w-full lg:col-span-12 xl:col-span-3 xl:sticky xl:top-18">
            <SimilarListingsColumn
              categoryId={listing.categoryId}
              categorySlug={listing.categoryBreadcrumbs?.[listing.categoryBreadcrumbs.length - 1]?.slug}
              categoryName={listing.categoryName}
              currentListingId={listing.id}
            />
          </div>
        </div>

        <div className="space-y-6 mt-6 lg:mt-8">
          {/* Full Screen Width Description */}
          <SectionCard title="Description" icon={Tag}>
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
              {listing.description}
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Listing details */}
            <SectionCard title="Listing Details" icon={Package}>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <DetailRow label="Category" value={listing.categoryName} />
                <DetailRow
                  label="Offering Type"
                  value={formatListingType(listing.listingType)}
                />
                <DetailRow
                  label="Condition"
                  value={formatListingCondition(listing.condition)}
                />
                <DetailRow
                  label="Pricing Type"
                  value={formatPricingType(listing.pricingType)}
                />
                <DetailRow label="Currency" value={listing.currency} />
                <DetailRow
                  label="Total Quantity"
                  value={listing.quantity?.toLocaleString()}
                />
                <DetailRow
                  label="Available Quantity"
                  value={(
                    listing.availableQuantity ?? listing.quantity
                  )?.toLocaleString()}
                />
                <DetailRow
                  label="Listing Status"
                  value={formatListingStatus(listing.status)}
                />
                {isOwner && (
                  <DetailRow
                    label="Moderation"
                    value={formatModerationStatus(listing.moderationStatus)}
                  />
                )}
              </dl>
            </SectionCard>

            {/* Location */}
            <SectionCard title="Location &amp; Delivery" icon={MapPin}>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <DetailRow
                  label="Coverage"
                  value={formatLocationType(listing.locationType)}
                />
                {listing.locationType !== "ONLINE" && (
                  <>
                    <DetailRow label="City" value={listing.city} />
                    <DetailRow label="District" value={listing.district} />
                    <DetailRow label="Province" value={listing.province} />
                    <DetailRow label="Postal Code" value={listing.postalCode} />
                  </>
                )}
              </dl>
            </SectionCard>

            {/* Custom attributes */}
            {customAttributeEntries.length > 0 && (
              <div className="md:col-span-2">
                <SectionCard title="Additional information" icon={Shield}>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                    {customAttributeEntries.map(([key, value]) => (
                      <DetailRow
                        key={key}
                        label={key}
                        value={String(value)}
                      />
                    ))}
                  </dl>
                </SectionCard>
              </div>
            )}
          </div>

          {/* Related Listings */}
          <RelatedCategoryListings
            rootCategory={listing.categoryBreadcrumbs?.[0]}
            categoryBreadcrumbs={listing.categoryBreadcrumbs}
            currentListingId={listing.id}
            fallbackCategoryId={listing.categoryId}
            fallbackCategoryName={listing.categoryName}
          />
        </div>
      </main>

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={refetchListing}
        title="Sign in to contact seller"
        description="Log in to view the seller's mobile number and connect directly."
      />
    </>
  );
}