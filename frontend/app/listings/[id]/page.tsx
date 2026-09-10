"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { getListing, toggleFavoriteListing, toggleBookmarkListing, markListingAsSold } from "@/lib/api/listings";
import ListingImageGallery from "@/components/listings/ListingImageGallery";
import ListingBreadcrumb from "@/components/listings/ListingBreadcrumb";
import SimilarListingsColumn from "@/components/listings/SimilarListingsColumn";
import RelatedCategoryListings from "@/components/listings/RelatedCategoryListings";
import AuctionPanel from "@/components/listings/AuctionPanel";
import LoginModal from "@/components/auth/LoginModal";
import { useToast } from "@/hooks/useToast";
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
  Bookmark,
  MapPin,
  Package,
  Pencil,
  Phone,
  Shield,
  Tag,
  User,
  Loader2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import WhatsAppIcon from "@/components/common/WhatsAppIcon";

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
  const { success: toastSuccess, error: toastError } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [markSoldModalOpen, setMarkSoldModalOpen] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);
  const [markSoldError, setMarkSoldError] = useState<string | null>(null);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

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
      if (newIsFavorited) {
        toastSuccess("Added to Favorites", "This listing has been added to your favorites.");
      } else {
        toastSuccess("Removed from Favorites", "This listing was removed from your favorites.");
      }
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
      toastError("Action Failed", "Could not update your favorites.");
    } finally {
      setFavoriting(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!listing) return;
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    if (bookmarking) return;

    const previousIsBookmarked = Boolean(listing.isBookmarked);
    const newIsBookmarked = !previousIsBookmarked;

    // Optimistic UI update
    setListing((prev) =>
      prev
        ? {
          ...prev,
          isBookmarked: newIsBookmarked,
        }
        : null
    );

    setBookmarking(true);
    try {
      const res = await toggleBookmarkListing(accessToken, listing.id);
      setListing((prev) =>
        prev
          ? {
            ...prev,
            isBookmarked: res.isBookmarked,
          }
          : null
      );
      if (newIsBookmarked) {
        toastSuccess("Bookmark Added", "Listing saved to your bookmarks.");
      } else {
        toastSuccess("Bookmark Removed", "Listing removed from your bookmarks.");
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      // Revert optimistic update
      setListing((prev) =>
        prev
          ? {
            ...prev,
            isBookmarked: previousIsBookmarked,
          }
          : null
      );
      toastError("Action Failed", "Could not update your bookmarks.");
    } finally {
      setBookmarking(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!listing || !accessToken) return;
    setMarkingSold(true);
    setMarkSoldError(null);
    try {
      const updated = await markListingAsSold(accessToken, listing.id);
      setListing(updated);
      setMarkSoldModalOpen(false);
      toastSuccess("Listing Marked as Sold", "Status has been updated to sold.");
    } catch (err) {
      console.error("Failed to mark listing as sold:", err);
      const msg = err instanceof Error ? err.message : "Failed to mark as sold.";
      setMarkSoldError(msg);
      toastError("Action Failed", msg);
    } finally {
      setMarkingSold(false);
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
          <div className="flex justify-center">
            <Search className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
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

  const isOwner = Boolean(
    user &&
    listing &&
    (
      (Boolean(user.id) && Boolean(listing.sellerId) && user.id.trim().toLowerCase() === listing.sellerId.trim().toLowerCase()) ||
      (Boolean(user.username) && Boolean(listing.sellerUsername) && user.username!.trim().toLowerCase() === listing.sellerUsername.trim().toLowerCase()) ||
      (Boolean(user.email) && Boolean(listing.sellerUsername) && user.email.toLowerCase().startsWith(listing.sellerUsername.toLowerCase()))
    )
  );
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
            <div className="flex items-center gap-2 flex-wrap">
              {listing.status !== "SOLD" && listing.status !== "DELETED" && (
                <button
                  type="button"
                  onClick={() => {
                    setMarkSoldError(null);
                    setMarkSoldModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 font-semibold text-xs transition shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  Mark as Sold
                </button>
              )}
              {listing.status === "SOLD" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Item Sold
                </span>
              )}
              <Link
                href={`/listings/${listing.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs transition"
              >
                <Pencil className="w-3.5 h-3.5" />
                Manage Photos &amp; Edit
              </Link>
            </div>
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
            <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-3">
              {/* Action Buttons - Bookmark & Favorite */}
              <div className="absolute top-3 right-5 sm:top-3 sm:right-6 flex items-center gap-1 z-10">
                {/* Favorite Button */}
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={favoriting}
                  aria-label={listing.isFavorited ? "Remove from favorites" : "Save to favorites"}
                  title={listing.isFavorited ? "Remove from favorites" : "Save to favorites"}
                  className="p-1 text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {favoriting ? (
                    <Loader2 className="w-6 h-6 animate-spin text-slate-700 dark:text-slate-300" />
                  ) : (
                    <Heart
                      className={`w-6 h-6 transition-transform duration-200 ${listing.isFavorited
                        ? "fill-rose-500 text-rose-500 scale-110"
                        : "text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:scale-110"
                        }`}
                    />
                  )}
                </button>

                {/* Bookmark Button */}
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  disabled={bookmarking}
                  aria-label={listing.isBookmarked ? "Remove bookmark" : "Bookmark listing"}
                  title={listing.isBookmarked ? "Remove bookmark" : "Bookmark listing"}
                  className="p-1 text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {bookmarking ? (
                    <Loader2 className="w-6 h-6 animate-spin text-slate-700 dark:text-slate-300" />
                  ) : (
                    <Bookmark
                      className={`w-6 h-6 transition-transform duration-200 ${listing.isBookmarked
                        ? "fill-slate-900 dark:fill-white text-slate-900 dark:text-white scale-110"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:scale-110"
                        }`}
                    />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pr-20">
                {listing.condition && listing.condition !== "NOT_APPLICABLE" && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {formatListingCondition(listing.condition)}
                  </span>
                )}
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
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                {/* Location and Date */}
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

                {/* Views and Favorites Counts */}
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

            {/* Seller Contact & Management */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  {listing.sellerUsername ? (
                    <Link
                      href={`/profile/${listing.sellerUsername}`}
                      className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-400 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 hover:opacity-90 hover:scale-105 transition-all"
                      title={`View @${listing.sellerUsername}'s profile`}
                    >
                      {listing.sellerUsername.charAt(0).toUpperCase()}
                    </Link>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-400 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                      U
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {isOwner ? "Your Listing" : "Listed By"}
                    </p>
                    {listing.sellerUsername ? (
                      <Link
                        href={`/profile/${listing.sellerUsername}`}
                        className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors truncate block"
                        title={`View @${listing.sellerUsername}'s profile`}
                      >
                        @{listing.sellerUsername}
                      </Link>
                    ) : (
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        @Seller
                      </p>
                    )}
                  </div>
                </div>

                {isOwner && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                    You (Owner)
                  </span>
                )}
              </div>

              {/* Owner Action Panel */}
              {isOwner ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Seller Controls</span>
                    </p>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Status: <strong className={listing.status === "SOLD" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>{listing.status}</strong>
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {listing.status !== "SOLD" && listing.status !== "DELETED" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMarkSoldError(null);
                          setMarkSoldModalOpen(true);
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Sold
                      </button>
                    ) : listing.status === "SOLD" ? (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        Item Marked as Sold
                      </div>
                    ) : null}

                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="w-full py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 text-center"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Manage Photos &amp; Edit Details
                    </Link>
                  </div>
                </div>
              ) : isLoggedIn ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-4 space-y-3">
                  <div className="space-y-1">
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

                  {listing.sellerWhatsappNumber && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <WhatsAppIcon size={13} className="text-emerald-500" />
                        <span>WhatsApp Contact</span>
                      </p>
                      <a
                        href={`https://wa.me/${listing.sellerWhatsappNumber.replace(
                          /\D/g,
                          ""
                        )}?text=${encodeURIComponent(
                          `Hi, I'm interested in your listing "${listing.title}" on the Marketplace. Is it still available?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 transition group shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                            <WhatsAppIcon size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold tracking-tight">
                              Chat on WhatsApp
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500 transition-colors">
                          Message →
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30 p-4 space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sign in to get in touch directly with the seller.
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

            <AuctionPanel
              listingId={listing.id}
              listing={listing}
              isOwner={isOwner}
              authLoading={authLoading}
              accessToken={accessToken}
              onLoginRequired={() => setLoginModalOpen(true)}
            />
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
          </div>

          {/* Additional Information Section with Toggle */}
          <div className="space-y-4">
            {/* Separator with Toggle Button */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                className="relative inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow"
              >
                <span>More Information</span>
                {showAdditionalInfo ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Additional Info Content */}
            {showAdditionalInfo && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                {customAttributeEntries.length > 0 && (
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
                )}
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

      {/* Mark As Sold Confirmation Modal */}
      {markSoldModalOpen && listing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mark-sold-modal-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="mark-sold-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                    Mark as Sold?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Item Status Confirmation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!markingSold) {
                    setMarkSoldModalOpen(false);
                    setMarkSoldError(null);
                  }
                }}
                disabled={markingSold}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to mark <span className="font-semibold text-slate-900 dark:text-white">&ldquo;{listing.title}&rdquo;</span> as <span className="font-bold text-rose-600 dark:text-rose-400">SOLD</span>?
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  What happens when marked as sold:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                  <li>The listing status will be changed to <strong>SOLD</strong>.</li>
                  <li>Buyers will see that this item is no longer available.</li>
                  <li>Any active auction on this listing will be closed automatically.</li>
                </ul>
              </div>
            </div>

            {markSoldError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{markSoldError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setMarkSoldModalOpen(false);
                  setMarkSoldError(null);
                }}
                disabled={markingSold}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkAsSold}
                disabled={markingSold}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-600/20 disabled:opacity-60 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {markingSold ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Marking as Sold...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes, Mark as Sold</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}