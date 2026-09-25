"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getMyListings } from "@/lib/api/listings";
import type { Listing } from "@/types/listing";
import {
  Package,
  Eye,
  Heart,
  TrendingUp,
  Plus,
  SlidersHorizontal,
  Crown,
  Clock,
  ArrowRight,
  ShieldCheck,
  Store,
  UserCheck,
} from "lucide-react";

export default function SellerStatsSection() {
  const { user, accessToken, loading: authLoading } = useAuth();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (user && accessToken) {
      setLoading(true);
      getMyListings(accessToken, { size: 50 })
        .then((res) => {
          if (isMounted) {
            setMyListings(res.content ?? []);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load seller stats:", err);
          if (isMounted) setLoading(false);
        });
    } else {
      setMyListings([]);
    }
    return () => {
      isMounted = false;
    };
  }, [user, accessToken]);

  if (authLoading) return null;

  // 1. Authenticated User with Listings (Active Seller Hub)
  if (user && myListings.length > 0) {
    const activeListings = myListings.filter((l) => l.status === "ACTIVE").length;
    const totalViews = myListings.reduce((sum, l) => sum + (l.viewCount || 0), 0);
    const totalFavorites = myListings.reduce((sum, l) => sum + (l.favoriteCount || 0), 0);
    const promotedListings = myListings.filter(
      (l) => Boolean(l.isSpotlight || l.isUrgent || l.isPushedUp)
    ).length;

    return (
      <section className="rounded-3xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/5 via-teal-500/5 to-slate-900/5 dark:from-emerald-950/20 dark:via-slate-900/60 dark:to-slate-900/40 p-6 sm:p-8 backdrop-blur-md shadow-lg space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Seller Studio &amp; Performance
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Welcome back, {user.firstName} {user.username ? `(@${user.username})` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/listings/new"
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post New Ad</span>
            </Link>
            <Link
              href="/my-listings"
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Manage Listings
            </Link>
          </div>
        </div>

        {/* 4 Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Active Ads</span>
              <Package className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {activeListings}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {myListings.length} total created
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Total Views</span>
              <Eye className="w-4 h-4 text-teal-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalViews.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Buyer impressions
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Favorites</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalFavorites}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Saved by buyers
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Promotions</span>
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {promotedListings}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Active boosted ads
            </p>
          </div>
        </div>

        {/* Quick Hub Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Link
            href="/subscriptions"
            className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Boost Ad Packages</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href="/profile/edit"
            className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-500" />
              <span>Shop Hours &amp; Contacts</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href={user.username ? `/profile/${user.username}` : "/profile"}
            className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-800/40 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-500" />
              <span>View Public Storefront</span>
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </section>
    );
  }

  // 2. Logged In User with 0 Listings (Onboarding Callout)
  if (user && myListings.length === 0 && !loading) {
    return (
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <Store className="w-3.5 h-3.5" />
              <span>Seller Onboarding</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Turn Unused Items into Cash
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Publish your first classified ad in under 60 seconds with photos, description, and direct contact options.
            </p>
          </div>

          <Link
            href="/listings/new"
            className="btn-primary text-xs sm:text-sm px-6 py-3 flex items-center gap-2 shrink-0 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Post First Listing Free</span>
          </Link>
        </div>
      </section>
    );
  }

  // 3. Guest User (Promote Selling)
  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 shadow-lg">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Listing Fees for Members</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
            Sell Directly to Verified Local Buyers
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Create high-converting listings with customized shop opening hours, direct WhatsApp inquiry buttons, and instant promotion boosts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
          <Link
            href="/register"
            className="btn-primary text-xs sm:text-sm px-5 py-2.5 shadow-md shadow-emerald-500/30"
          >
            Create Seller Account
          </Link>
          <Link
            href="/login?redirect=/listings/new"
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-200 transition-colors"
          >
            Sign In to Post
          </Link>
        </div>
      </div>
    </section>
  );
}
