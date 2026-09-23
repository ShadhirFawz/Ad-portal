"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Receipt,
  Zap,
  Crown,
  Star,
  Flame,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  Package,
  Layers,
} from "lucide-react";
import { getMyBoosts } from "@/lib/api/boosts";
import type { AdBoost } from "@/types/boost";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import PurchaseHistoryModal from "@/components/subscriptions/PurchaseHistoryModal";
import ListingPromotionsModal, {
  ListingSubscriptionGroup,
} from "@/components/subscriptions/ListingPromotionsModal";

export default function SubscriptionsPage() {
  const [boosts, setBoosts] = useState<AdBoost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"ALL" | "LIVE" | "SCHEDULED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPurchaseHistoryOpen, setIsPurchaseHistoryOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedGroupForModal, setSelectedGroupForModal] =
    useState<ListingSubscriptionGroup | null>(null);

  const fetchBoosts = async () => {
    setLoading(true);
    try {
      const data = await getMyBoosts();
      setBoosts(data || []);
    } catch (err) {
      console.error("Failed to load user subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoosts();
  }, []);

  const handleOpenReceipt = (orderId?: string | null) => {
    setSelectedOrderId(orderId || null);
    setIsPurchaseHistoryOpen(true);
  };

  const handleOpenPromotionsModal = (group: ListingSubscriptionGroup) => {
    setSelectedGroupForModal(group);
  };

  // Current timestamp
  const now = new Date().getTime();

  // ONLY include ACTIVE or SCHEDULED confirmed promotions (exclude PENDING_PAYMENT, CANCELLED, EXPIRED)
  const validSubscriptions = boosts.filter((b) => {
    const start = new Date(b.startsAt).getTime();
    const expiry = new Date(b.expiresAt).getTime();
    const isLive = b.boostStatus === "ACTIVE" && now >= start && now <= expiry;
    const isSched = b.boostStatus === "SCHEDULED" || (b.boostStatus === "ACTIVE" && now < start);
    return isLive || isSched;
  });

  // Calculate Active vs Scheduled individual promotion counts
  const liveActiveBoosts = validSubscriptions.filter((b) => {
    const start = new Date(b.startsAt).getTime();
    const expiry = new Date(b.expiresAt).getTime();
    return b.boostStatus === "ACTIVE" && now >= start && now <= expiry;
  });

  const scheduledQueueBoosts = validSubscriptions.filter((b) => {
    const start = new Date(b.startsAt).getTime();
    return b.boostStatus === "SCHEDULED" || (b.boostStatus === "ACTIVE" && now < start);
  });

  // Calculate expiring soon in active boosts (within 48 hours)
  const expiringSoonCount = liveActiveBoosts.filter((b) => {
    const expiry = new Date(b.expiresAt).getTime();
    const diffHours = (expiry - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48;
  }).length;

  // Calculate total spent on all completed/active promotions (for financial KPI)
  const totalInvested = boosts
    .filter((b) => b.paymentStatus === "COMPLETED" || b.boostStatus === "ACTIVE" || b.boostStatus === "EXPIRED")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  // Group confirmed active/scheduled promotions by Listing (1 Card per Listing)
  const listingGroupsMap = new Map<string, ListingSubscriptionGroup>();

  validSubscriptions.forEach((b) => {
    if (!listingGroupsMap.has(b.listingId)) {
      listingGroupsMap.set(b.listingId, {
        listingId: b.listingId,
        listingTitle: b.listingTitle,
        listingSlug: b.listingSlug,
        listingImageUrl: b.listingImageUrl,
        listingPrice: b.listingPrice,
        listingCurrency: b.listingCurrency,
        listingCategory: b.listingCategory,
        listingLocation: b.listingLocation,
        promotions: [],
      });
    }
    listingGroupsMap.get(b.listingId)!.promotions.push(b);
  });

  const allListingGroups = Array.from(listingGroupsMap.values());

  // Filter Listing Groups by Filter Tab & Search Query
  const filteredListingGroups = allListingGroups.filter((group) => {
    // Check if group has live active promotions
    const hasLive = group.promotions.some((b) => {
      const start = new Date(b.startsAt).getTime();
      const expiry = new Date(b.expiresAt).getTime();
      return b.boostStatus === "ACTIVE" && now >= start && now <= expiry;
    });

    // Check if group has scheduled queue promotions
    const hasSched = group.promotions.some((b) => {
      const start = new Date(b.startsAt).getTime();
      return b.boostStatus === "SCHEDULED" || (b.boostStatus === "ACTIVE" && now < start);
    });

    if (filterTab === "LIVE" && !hasLive) return false;
    if (filterTab === "SCHEDULED" && !hasSched) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = group.listingTitle?.toLowerCase().includes(q);
      const matchCategory = group.listingCategory?.toLowerCase().includes(q);
      const matchLocation = group.listingLocation?.toLowerCase().includes(q);
      const matchPromo = group.promotions.some(
        (p) =>
          p.boostType?.toLowerCase().includes(q) ||
          (p.orderId && p.orderId.toLowerCase().includes(q))
      );
      if (!matchTitle && !matchCategory && !matchLocation && !matchPromo) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24">
      {/* Header section */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>Seller Promotion Dashboard</span>
              </div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                My Subscriptions & Active Promotions
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Monitor your active boosted ads, upcoming schedules, due expiry dates, and purchase receipts.
              </p>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenReceipt()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Receipt className="h-4 w-4 text-emerald-500" />
                <span>Purchase History</span>
                <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {boosts.length}
                </span>
              </button>

              <Link
                href="/my-listings"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                <span>Promote an Ad</span>
              </Link>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Boosted Listings */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Promoted Listings
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                  <Package className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {allListingGroups.length}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {liveActiveBoosts.length} Active Boosts
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Distinct listings with active promotions</p>
            </div>

            {/* Card 2: Scheduled Promotions */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Scheduled Queues
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {scheduledQueueBoosts.length}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  In Queue
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Queued to auto-start after active periods</p>
            </div>

            {/* Card 3: Expiring Soon */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Expiring in 48h
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {expiringSoonCount}
                </span>
                {expiringSoonCount > 0 && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Needs Renewal
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">Promotions ending in next 2 days</p>
            </div>

            {/* Card 4: Total Invested */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Invested
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
                  <Crown className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-400">LKR</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                  {totalInvested.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">Across lifetime promotion packages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Filter and search bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-x-auto">
            {(
              [
                { key: "ALL", label: "All Active Listings", count: allListingGroups.length },
                {
                  key: "LIVE",
                  label: "Live Active",
                  count: allListingGroups.filter((g) =>
                    g.promotions.some((p) => {
                      const s = new Date(p.startsAt).getTime();
                      const e = new Date(p.expiresAt).getTime();
                      return p.boostStatus === "ACTIVE" && now >= s && now <= e;
                    })
                  ).length,
                },
                {
                  key: "SCHEDULED",
                  label: "Scheduled Queue",
                  count: allListingGroups.filter((g) =>
                    g.promotions.some(
                      (p) =>
                        p.boostStatus === "SCHEDULED" ||
                        (p.boostStatus === "ACTIVE" && now < new Date(p.startsAt).getTime())
                    )
                  ).length,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  filterTab === tab.key
                    ? "bg-slate-900 text-white shadow-sm dark:bg-emerald-600"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    filterTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by ad title or package..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/80 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={fetchBoosts}
              title="Refresh subscriptions"
              className="rounded-2xl border border-slate-200/80 bg-white p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Subscriptions Grid (1 Card per unique Listing) */}
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading your promotion subscriptions...
              </p>
            </div>
          ) : filteredListingGroups.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {searchQuery || filterTab !== "ALL"
                  ? "No matching active promotions found"
                  : "You don't have any active or scheduled promotions"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {searchQuery || filterTab !== "ALL"
                  ? "Try adjusting your tab selection or search query to find your active ads."
                  : "Boost your active listings with Spotlight, Urgent, Push Up, or Power Pack to reach thousands of buyers instantly."}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/my-listings"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500"
                >
                  <Package className="h-4 w-4" /> Go to My Listings
                </Link>
                <Link
                  href="/promotions"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  Explore Boost Packages
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListingGroups.map((group) => (
                <SubscriptionCard
                  key={group.listingId}
                  group={group}
                  onOpenReceipt={handleOpenReceipt}
                  onOpenPromotionsModal={handleOpenPromotionsModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Multi-Promotions Detail Modal */}
      <ListingPromotionsModal
        isOpen={!!selectedGroupForModal}
        onClose={() => setSelectedGroupForModal(null)}
        group={selectedGroupForModal}
        onOpenReceipt={handleOpenReceipt}
      />

      {/* Purchase History & Invoices Popup Modal */}
      <PurchaseHistoryModal
        isOpen={isPurchaseHistoryOpen}
        onClose={() => setIsPurchaseHistoryOpen(false)}
        boosts={boosts}
        selectedOrderId={selectedOrderId}
      />
    </div>
  );
}
