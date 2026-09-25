"use client";

import { useEffect, useState } from "react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import CategorySection from "@/components/dashboard/CategorySection";
import SellerStatsSection from "@/components/dashboard/SellerStatsSection";
import SpotlightSection from "@/components/dashboard/SpotlightSection";
import LatestListingsSection from "@/components/dashboard/LatestListingsSection";
import DashboardNavigationHighlights from "@/components/dashboard/DashboardNavigationHighlights";
import PowerPackSection from "@/components/dashboard/PowerPackSection";
import UrgentSection from "@/components/dashboard/UrgentSection";
import { getListings } from "@/lib/api/listings";
import type { Listing } from "@/types/listing";

export default function Home() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getListings({ page: 0, size: 36, sortBy: "newest", status: "ACTIVE" })
      .then((res) => {
        if (isMounted) {
          setAllListings(res.content ?? []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard listings:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter listings for separate dedicated promotion sections
  const spotlightListings = allListings.filter((l) => l.isSpotlight);
  const urgentListings = allListings.filter((l) => l.isUrgent);
  const powerPackListings = allListings.filter(
    (l) => Boolean(l.isSpotlight && l.isUrgent) || l.isSpotlight || (l.viewCount && l.viewCount > 5)
  );

  // Fallback active listings for development/sandbox when fewer boosts exist
  const effectiveSpotlight =
    spotlightListings.length >= 2 ? spotlightListings : allListings.slice(0, 4);

  const effectivePowerPack =
    powerPackListings.length >= 1 ? powerPackListings : allListings.slice(0, 3);

  const effectiveUrgent =
    urgentListings.length >= 2 ? urgentListings : allListings.slice(2, 6);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* 1. Hero Section with Search and Quick Tags */}
      <DashboardHero />

      {/* 2. Category Section with Lucide Icons */}
      <CategorySection />

      {/* 3. Seller Performance Stats & Quick Actions (or Onboarding Banner) */}
      <SellerStatsSection />

      {/* 4. SEPARATE SECTION: Spotlight Promoted Listings (2 Cards / 2 Columns x 1 Row Slider) */}
      {effectiveSpotlight.length > 0 && (
        <SpotlightSection listings={effectiveSpotlight} loading={loading} />
      )}

      {/* 5. Latest Listings Section (3 Columns x 4 Rows = 12 Rectangular Cards with Horizontal Scroller) */}
      <LatestListingsSection listings={allListings} loading={loading} />

      {/* 6. Dashboard Platform Navigation & Feature Highlights in Middle */}
      <DashboardNavigationHighlights />

      {/* 7. SEPARATE SECTION: Power Pack Showcase (1 Single Wide 2-Card Sized Showcase Slider) */}
      {effectivePowerPack.length > 0 && (
        <PowerPackSection listings={effectivePowerPack} loading={loading} />
      )}

      {/* 8. SEPARATE SECTION: Urgent Priority Deals (2 Cards / 2 Columns x 1 Row Slider) */}
      {effectiveUrgent.length > 0 && (
        <UrgentSection listings={effectiveUrgent} loading={loading} />
      )}
    </main>
  );
}
