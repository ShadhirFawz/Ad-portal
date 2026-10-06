"use client";

import { useState } from "react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import CategorySection from "@/components/dashboard/CategorySection";
import SellerStatsSection from "@/components/dashboard/SellerStatsSection";
import SpotlightSection from "@/components/dashboard/SpotlightSection";
import LatestListingsSection from "@/components/dashboard/LatestListingsSection";
import PowerPackSection from "@/components/dashboard/PowerPackSection";
import UrgentSection from "@/components/dashboard/UrgentSection";
import TradingPlaybook from "@/components/dashboard/TradingPlaybook";
import type { Category } from "@/types/category";
import type { Listing } from "@/types/listing";

interface DashboardClientProps {
  categories?: Category[];
  initialListings?: Listing[];
  initialCategoryListings?: Listing[];
}

export default function DashboardClient({
  categories = [],
  initialListings = [],
  initialCategoryListings = [],
}: DashboardClientProps) {
  const [allListings] = useState<Listing[]>(initialListings);
  const loading = false;

  // Filter listings for separate dedicated promotion sections
  const spotlightListings = allListings.filter((l) => l.isSpotlight);
  const urgentListings = allListings.filter((l) => l.isUrgent);
  const powerPackListings = allListings.filter(
    (l) => Boolean(l.isSpotlight && l.isUrgent) || l.isSpotlight || (l.viewCount && l.viewCount > 5)
  );

  // Fallback active listings when fewer boosts exist
  const effectiveSpotlight =
    spotlightListings.length >= 2 ? spotlightListings : allListings.slice(0, 4);

  const effectivePowerPack =
    powerPackListings.length >= 1 ? powerPackListings : allListings.slice(0, 3);

  const effectiveUrgent =
    urgentListings.length >= 2 ? urgentListings : allListings.slice(2, 6);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* 1. Hero Section with Search and Quick Tags */}
      <DashboardHero categories={categories} />

      {/* 2. Category Section with Lucide Icons */}
      <CategorySection
        initialCategories={categories}
        initialCategoryListings={initialCategoryListings}
      />

      {/* 3. Seller Performance Stats & Quick Actions */}
      <SellerStatsSection />

      {/* 4. Spotlight Promoted Listings */}
      {effectiveSpotlight.length > 0 && (
        <SpotlightSection listings={effectiveSpotlight} loading={loading} />
      )}

      {/* 5. Latest Listings Section */}
      <LatestListingsSection listings={allListings} loading={loading} />

      {/* 6. Dashboard Platform Navigation & Feature Highlights */}
      <TradingPlaybook />

      {/* 7. Power Pack Showcase */}
      {effectivePowerPack.length > 0 && (
        <PowerPackSection listings={effectivePowerPack} loading={loading} />
      )}

      {/* 8. Urgent Priority Deals */}
      {effectiveUrgent.length > 0 && (
        <UrgentSection listings={effectiveUrgent} loading={loading} />
      )}
    </main>
  );
}
