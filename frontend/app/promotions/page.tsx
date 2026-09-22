"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowUpCircle,
  Flame,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Clock,
  Layers,
} from "lucide-react";
import { getBoostPlans } from "@/lib/api/boosts";
import type { BoostPlan } from "@/types/boost";

export default function PromotionsOverviewPage() {
  const [plans, setPlans] = useState<BoostPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBoostPlans();
        if (data.length > 0) {
          setPlans(data);
        }
      } catch {
        // Fallback pricing
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const spotlightPlan = plans.find((p) => p.boostType === "SPOTLIGHT");
  const spotlightStarting = spotlightPlan?.pricing?.THREE_DAYS ?? 490;

  const pushUpPlan = plans.find((p) => p.boostType === "PUSH_UP");
  const pushUpStarting = pushUpPlan?.pricing?.THREE_DAYS ?? 290;

  const hotDealPlan = plans.find((p) => p.boostType === "HOT_DEAL");
  const hotDealStarting = hotDealPlan?.pricing?.THREE_DAYS ?? 190;

  const powerPackPlan = plans.find((p) => p.boostType === "POWER_PACK");
  const powerPackStarting = powerPackPlan?.pricing?.THREE_DAYS ?? 790;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 pt-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" /> Promotion Center
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Supercharge Your Listings & Sell Faster
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            Give your ad the spotlight it deserves. Boosted listings appear at the top of category feeds and search results, getting up to 10x more inquiries.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-2xl"
            >
              Boost an Existing Listing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Spotlight Ad */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-amber-500/30 bg-white p-7 shadow-lg shadow-amber-500/5 dark:border-amber-400/30 dark:bg-slate-900">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Spotlight Ad</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Top showcase position in category and search results with a radiant golden frame.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Top 2 priority slots</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Glowing gold badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Up to 5x more clicks</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-500">Starting from</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                Rs {spotlightStarting.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ 3 days</span>
              </div>
            </div>
          </div>

          {/* Push Up */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-emerald-500/30 bg-white p-7 shadow-lg shadow-emerald-500/5 dark:border-emerald-400/30 dark:bg-slate-900">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                <ArrowUpCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Push Up</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Daily automatic bump to the very top of search results throughout your campaign.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Daily automated bump</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Fresh ad discovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Great for quick turnarounds</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-500">Starting from</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                Rs {pushUpStarting.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ 3 days</span>
              </div>
            </div>
          </div>

          {/* Hot Deal */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-rose-500/30 bg-white p-7 shadow-lg shadow-rose-500/5 dark:border-rose-400/30 dark:bg-slate-900">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Hot Deal</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Signal instant urgency and appear in the exclusive Hot Deals buyer filter.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Vibrant flame badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Dedicated filter tab</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>High buyer intent</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-500">Starting from</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                Rs {hotDealStarting.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ 3 days</span>
              </div>
            </div>
          </div>

          {/* Power Pack */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-purple-500 bg-gradient-to-b from-purple-500/5 to-transparent p-7 shadow-xl shadow-purple-500/10 dark:border-purple-400 dark:bg-slate-900">
            <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
              Best Value
            </div>
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Power Pack</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                The ultimate combo suite: Spotlight + Daily Push Ups + Hot Deal badge.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>All 3 promotions bundled</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Up to 10x more reach</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Save 40% vs individual</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-xs text-slate-500">Starting from</span>
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                Rs {powerPackStarting.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ 3 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 rounded-3xl border border-slate-200/80 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 sm:p-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              How Ad Boosting Works
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Simple 3-step checkout with instant activation powered by PayHere.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-xl">
                1
              </div>
              <h4 className="mt-4 font-bold text-slate-900 dark:text-white">Choose Your Boost</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Pick from Spotlight, Push Up, Hot Deal, or the all-in-one Power Pack for your listing.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-xl">
                2
              </div>
              <h4 className="mt-4 font-bold text-slate-900 dark:text-white">Secure PayHere Checkout</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Pay seamlessly with Visa, MasterCard, FriMi, eZ Cash, Genie, or internet banking.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold text-xl">
                3
              </div>
              <h4 className="mt-4 font-bold text-slate-900 dark:text-white">Instant Visibility</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Your ad is immediately elevated to top slots and highlighted with glowing badges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
