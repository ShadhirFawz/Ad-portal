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

  // Filter only genuine boosted listings according to their respective boost types
  const powerPackListings = allListings.filter((l) => Boolean(l.isSpotlight && l.isUrgent));
  const spotlightListings = allListings.filter((l) => Boolean(l.isSpotlight));
  const urgentListings = allListings.filter((l) => Boolean(l.isUrgent));

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

      {/* 4. Power Pack Showcase (Combined Spotlight + Urgent + Push Up) */}
      {powerPackListings.length > 0 && (
        <PowerPackSection listings={powerPackListings} loading={loading} />
      )}

      {/* 5. Latest Listings Section */}
      <LatestListingsSection listings={allListings} loading={loading} />

      {/* 6. Dashboard Platform Navigation & Feature Highlights */}
      <TradingPlaybook />

      {/* 7. Spotlight Promoted Listings (Pinned Top) */}
      {spotlightListings.length > 0 && (
        <SpotlightSection listings={spotlightListings} loading={loading} />
      )}

      {/* 8. Urgent Priority Deals (Quick Sale) */}
      {urgentListings.length > 0 && (
        <UrgentSection listings={urgentListings} loading={loading} />
      )}
    </main>
  );
}
