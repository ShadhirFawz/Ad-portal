"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { getMyListings } from "@/lib/api/listings";
import type { Listing } from "@/types/listing";
import ListingCard from "@/components/listings/ListingCard";
import {
  ExternalLink,
  Edit3,
  Phone,
  Star,
  MapPin,
  Calendar,
  Package,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

const PAGE_SIZE = 8;

export default function ProfilePage() {
  const router = useRouter();
  const { user, accessToken, loading } = useAuth();

  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
  }, [user, loading, router]);

  const fetchMyListings = useCallback(
    async (page: number) => {
      if (!user) return;
      setListingsLoading(true);
      try {
        const result = await getMyListings(accessToken, page, PAGE_SIZE);
        setMyListings(result.content ?? []);
        setTotalPages(result.totalPages ?? 0);
        setTotalElements(result.totalElements ?? 0);
        setCurrentPage(page);
      } catch (err) {
        console.error("Failed to load my listings:", err);
      } finally {
        setListingsLoading(false);
      }
    },
    [user, accessToken]
  );

  useEffect(() => {
    if (user) {
      fetchMyListings(0);
    }
  }, [user, fetchMyListings]);

  const handlePageChange = (page: number) => {
    if (page < 0 || (totalPages > 0 && page >= totalPages) || page === currentPage) {
      return;
    }
    fetchMyListings(page);
  };

  if (loading || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Cover Photo Section */}
      <div className="glass-panel overflow-hidden">
        {/* Cover Photo Banner */}
        {user.coverPhotoUrl ? (
          <div className="h-32 sm:h-48 relative overflow-hidden">
            <Image
              src={user.coverPhotoUrl}
              alt="Cover photo"
              width={900}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 sm:h-48 bg-linear-to-r from-emerald-600 via-teal-600 to-indigo-700" />
        )}

        {/* Profile Card Body */}
        <div className="p-6 sm:p-8 relative pt-0">

          {/* Avatar Badge Overlapping Banner */}
          <div className="-mt-16 sm:-mt-20 mb-4 flex items-end justify-between flex-wrap gap-4">
            {user.avatarUrl ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-200 dark:bg-slate-700 text-white font-bold text-4xl sm:text-5xl flex items-center justify-center border-4 border-white dark:border-[#0b0f19] shadow-xl overflow-hidden relative">
                <Image
                  src={user.avatarUrl}
                  alt="Profile picture"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 text-white font-bold text-4xl sm:text-5xl flex items-center justify-center border-4 border-white dark:border-[#0b0f19] shadow-xl">
                {user.firstName[0]?.toUpperCase()}
              </div>
            )}

            <span className="badge-emerald px-3 py-1 text-sm">
              {user.role === "ADMIN" ? "Admin" : "Member"}
            </span>
          </div>

          {/* Name & Handle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {user.firstName} {user.lastName ?? ""}
            </h1>
            {user.username && (
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                @{user.username}
              </p>
            )}
          </div>

          {/* Location & Meta info */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Joined {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Contact Phone Numbers */}
          {((user.phoneNumbers && user.phoneNumbers.length > 0) || user.phoneNumber) && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Contact Phone Numbers</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {user.phoneNumbers && user.phoneNumbers.length > 0 ? (
                  user.phoneNumbers.map((phone, idx) => (
                    <div
                      key={phone.id || idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <span className="font-mono">{phone.phoneNumber}</span>
                      {phone.isPrimary && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                          Primary
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-mono">{user.phoneNumber}</span>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                      Primary
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {user.bio}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 flex-wrap">
            <Link
              href="/profile/edit"
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>

            {user.username && user.publicProfile && (
              <Link
                href={`/profile/${user.username}`}
                className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Profile</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* My Listings Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                My Listings
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {totalElements} total listing{totalElements !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || listingsLoading}
                  aria-label="Previous Page"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || listingsLoading}
                  aria-label="Next Page"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link
              href="/listings/new"
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Ad</span>
            </Link>
          </div>
        </div>

        {/* Content */}
        {listingsLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Loading listings…
            </p>
          </div>
        ) : myListings.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {myListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} layout="grid" />
              ))}
            </div>

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || listingsLoading}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePageChange(i)}
                    disabled={listingsLoading}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      i === currentPage
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || listingsLoading}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-panel p-10 text-center space-y-4">
            <Package className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Listings Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                You haven&apos;t created any listings yet. Post your first item or service to start selling.
              </p>
            </div>
            <Link
              href="/listings/new"
              className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Your First Listing</span>
            </Link>
          </div>
        )}
      </section>

    </main>
  );
}