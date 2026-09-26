"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  Flame,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Timer,
  TrendingUp,
  Star,
  Award,
  BarChart3,
  MousePointerClick,
  Eye,
  Layers,
  BadgeCheck,
  Package,
  CheckCircle
} from "lucide-react";
import { getBoostPlans } from "@/lib/api/boosts";
import type { BoostPlan, BoostPricingTier } from "@/types/boost";

// ─── Boost type visual config ──────────────────────────────────────────────────
const BOOST_CONFIGS = {
  SPOTLIGHT: {
    icon: Award,
    gradient: "from-amber-500 to-amber-600",
    bgGlow: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-500/40 dark:border-amber-500/40",
    badgeClass: "bg-amber-50 border-amber-500/30 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    ringClass: "ring-amber-500/20",
    glowStyle: "0 0 60px rgba(217,119,6,0.12)",
    label: "Spotlight Ad",
    tagline: "Get pinned to the top. Shine brightest.",
    metrics: [
      { icon: Eye, label: "Avg. View Boost", value: "5×" },
      { icon: MousePointerClick, label: "Click-through Rate", value: "+340%" },
      { icon: TrendingUp, label: "Inquiry Rate", value: "+280%" },
    ],
    highlights: [
      "Featured at the very top of category and search pages",
      "Radiant golden frame and 'Spotlight' badge on your card",
      "Priority position above all non-boosted listings",
      "Visible across all related category browse pages",
      "Perfect for high-value or fast-moving items",
    ],
  },
  PUSH_UP: {
    icon: ArrowUpCircle,
    gradient: "from-emerald-500 to-emerald-600",
    bgGlow: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-500/40 dark:border-emerald-500/40",
    badgeClass: "bg-emerald-50 border-emerald-500/30 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    ringClass: "ring-emerald-500/20",
    glowStyle: "0 0 60px rgba(5,150,105,0.12)",
    label: "Push Up",
    tagline: "Stay fresh at the top. Every single day.",
    metrics: [
      { icon: Eye, label: "Daily Visibility", value: "100%" },
      { icon: MousePointerClick, label: "Discovery Rate", value: "+220%" },
      { icon: TrendingUp, label: "Sell-through Rate", value: "+190%" },
    ],
    highlights: [
      "Automatically bumped to the top of listings every 24 hours",
      "Appears as a freshly listed ad to all active buyers",
      "Sustains consistent high visibility throughout the campaign",
      "Ideal for items that need ongoing exposure to find the right buyer",
      "Works across search, category browse, and home feed",
    ],
  },
  URGENT: {
    icon: Flame,
    gradient: "from-red-500 to-red-600",
    bgGlow: "bg-red-50 dark:bg-red-950/30",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-500/40 dark:border-red-500/40",
    badgeClass: "bg-red-50 border-red-500/30 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    ringClass: "ring-red-500/20",
    glowStyle: "0 0 60px rgba(220,38,38,0.12)",
    label: "Urgent Ad",
    tagline: "Signal urgency. Attract serious buyers fast.",
    metrics: [
      { icon: Eye, label: "Buyer Attention", value: "+410%" },
      { icon: MousePointerClick, label: "Serious Inquiries", value: "+300%" },
      { icon: TrendingUp, label: "Faster Sale Time", value: "3× Faster" },
    ],
    highlights: [
      "Bold red 'Urgent' ribbon badge displayed prominently on card",
      "Communicates time-sensitivity to trigger faster buyer decisions",
      "Stands out in crowded search results and category feeds",
      "Drives high-intent inquiries from motivated buyers",
      "Best for clearance sales, relocations, or deadline-driven items",
    ],
  },
  POWER_PACK: {
    icon: Zap,
    gradient: "from-violet-600 to-violet-700",
    bgGlow: "bg-violet-50 dark:bg-violet-950/30",
    textColor: "text-violet-700 dark:text-violet-400",
    borderColor: "border-violet-500/40 dark:border-violet-500/40",
    badgeClass: "bg-violet-50 border-violet-500/30 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    ringClass: "ring-violet-500/30",
    glowStyle: "0 0 80px rgba(124,58,237,0.15)",
    label: "Power Pack",
    tagline: "The ultimate bundle. Maximum reach guaranteed.",
    metrics: [
      { icon: Eye, label: "Total Reach Boost", value: "10×" },
      { icon: MousePointerClick, label: "Combined CTR Gain", value: "+600%" },
      { icon: TrendingUp, label: "Avg. Time to Sell", value: "4× Faster" },
    ],
    highlights: [
      "All 3 boosts combined — Spotlight + Daily Push Up + Urgent ribbon",
      "Maximum visibility across every surface on Wudo",
      "Save up to 40% compared to purchasing each boost separately",
      "Sustained top-of-feed presence with daily re-bumping",
      "Ideal for premium items, quick clearances, or competitive categories",
    ],
  },
};

const DURATION_LABELS: Record<string, string> = {
  THREE_DAYS: "3 Days",
  SEVEN_DAYS: "7 Days",
  FOURTEEN_DAYS: "14 Days",
  THIRTY_DAYS: "30 Days",
};

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: Package,
    title: "Choose Your Boost",
    desc: "Select from Spotlight, Push Up, Urgent, or the all-in-one Power Pack based on your goal.",
  },
  {
    step: 2,
    icon: CreditCard,
    title: "Secure PayHere Checkout",
    desc: "Pay safely with Visa, MasterCard or Amex.",
  },
  {
    step: 3,
    icon: CheckCircle,
    title: "Instant Activation",
    desc: "Your listing is immediately elevated to top slots and highlighted with glowing badges.",
  },
];

type ActiveBoost = keyof typeof BOOST_CONFIGS;

export default function BoostAdPage() {
  const [plans, setPlans] = useState<BoostPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBoost, setActiveBoost] = useState<ActiveBoost>("POWER_PACK");
  const [selectedDuration, setSelectedDuration] = useState<string>("SEVEN_DAYS");

  useEffect(() => {
    getBoostPlans()
      .then((data) => {
        if (data.length > 0) setPlans(data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const getPlan = (type: ActiveBoost): BoostPlan | undefined =>
    plans.find((p) => p.boostType === type);

  const getTiers = (type: ActiveBoost): BoostPricingTier[] => {
    const plan = getPlan(type);
    return plan?.pricingTiers ?? [];
  };

  const getPrice = (type: ActiveBoost, duration: string): number | null => {
    const tiers = getTiers(type);
    const tier = tiers.find((t) => t.duration === duration);
    if (tier) return tier.finalPrice;
    const plan = getPlan(type);
    if (plan?.pricing) return plan.pricing[duration as keyof typeof plan.pricing] ?? null;
    return null;
  };

  const getBasePrice = (type: ActiveBoost, duration: string): number | null => {
    const tiers = getTiers(type);
    const tier = tiers.find((t) => t.duration === duration);
    if (tier && tier.discountPercentage > 0) return tier.basePrice;
    return null;
  };

  const getDiscount = (type: ActiveBoost, duration: string): number => {
    const tiers = getTiers(type);
    const tier = tiers.find((t) => t.duration === duration);
    return tier?.discountPercentage ?? 0;
  };

  const cfg = BOOST_CONFIGS[activeBoost];
  const Icon = cfg.icon;
  const currentPrice = getPrice(activeBoost, selectedDuration);
  const basePrice = getBasePrice(activeBoost, selectedDuration);
  const discount = getDiscount(activeBoost, selectedDuration);

  const allDurations = ["THREE_DAYS", "SEVEN_DAYS", "FOURTEEN_DAYS", "THIRTY_DAYS"];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* ── Introduction — plain, structured, brand-emerald accents ── */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3">
            <span>Ad Boosting &amp; Promotions</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl leading-tight">
            Give your listing the visibility it deserves.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            On Wudo, thousands of listings are posted every day. Without a boost, your ad
            naturally drifts down the feed within hours. Ad boosting places your listing in
            front of more buyers, for longer, at the exact moments they are searching, so
            you sell faster, at the price you want, without lowering it just to get noticed.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                <Eye className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">More Views</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Boosted ads appear at the top of search results and category feeds, where
                buyer attention is highest.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                <MousePointerClick className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">More Inquiries</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Higher placement means more clicks, more chats, and more serious buyers
                reaching out about your item.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Faster Sales</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Sellers using boosts report selling up to 10× faster than unboosted listings
                in the same category.
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            Boosts are one-time purchases — Pick a duration, pay securely, and your
            listing is promoted instantly. No subscriptions, no auto-renewals, no hidden
            charges. Below you can compare the four boost types available and choose the
            one that matches how quickly you want to sell.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/listings"
              id="boost-explore-listings"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors"
            >
              Choose a Listing to Boost <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/promotions"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              View Promotion Overview
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12 space-y-14">
        {/* Boost Selector Tabs */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Explore Boost Types
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.keys(BOOST_CONFIGS) as ActiveBoost[]).map((type) => {
              const c = BOOST_CONFIGS[type];
              const BIcon = c.icon;
              const isActive = activeBoost === type;
              const price = getPrice(type, "THREE_DAYS");
              return (
                <button
                  key={type}
                  id={`boost-tab-${type.toLowerCase()}`}
                  type="button"
                  onClick={() => setActiveBoost(type)}
                  className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer text-left group ${isActive
                    ? `${c.borderColor} bg-white dark:bg-slate-900 shadow-lg ring-2 ${c.ringClass}`
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                    }`}
                  style={{ boxShadow: isActive ? c.glowStyle : undefined }}
                >
                  {type === "POWER_PACK" && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-violet-600 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                      Best Value
                    </span>
                  )}
                  <div className={`p-2.5 rounded-xl ${isActive ? c.bgGlow : "bg-slate-100 dark:bg-slate-800"} ${isActive ? c.textColor : "text-slate-500"} transition-colors`}>
                    <BIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isActive ? c.textColor : "text-slate-700 dark:text-slate-300"}`}>
                      {c.label}
                    </p>
                    {!loading && price !== null ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        from Rs {price.toLocaleString()}
                      </p>
                    ) : (
                      <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Boost Detail Panel */}
        <div
          key={activeBoost}
          className={`rounded-3xl border-2 ${cfg.borderColor} bg-white dark:bg-slate-900 overflow-hidden shadow-xl`}
          style={{ boxShadow: cfg.glowStyle }}
        >
          {/* Panel Header */}
          <div className={`bg-gradient-to-r ${cfg.gradient} p-8 text-white`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">{cfg.label}</h2>
                <p className="text-white/85 text-sm mt-0.5">{cfg.tagline}</p>
              </div>
            </div>
            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {cfg.metrics.map(({ icon: MIcon, label, value }) => (
                <div key={label} className="rounded-2xl bg-white/15 backdrop-blur-sm p-4 text-center">
                  <MIcon className="h-4 w-4 mx-auto mb-1.5 text-white/85" />
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-[10px] font-medium text-white/75 mt-0.5 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Panel Body */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Left: Features */}
              <div className="flex-1">
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${cfg.textColor}`}>
                  What&apos;s Included
                </h3>
                <ul className="space-y-3">
                  {cfg.highlights.map((hl) => (
                    <li key={hl} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{hl}</span>
                    </li>
                  ))}
                </ul>

                {/* Included boosts callout for Power Pack */}
                {activeBoost === "POWER_PACK" && (
                  <div className="mt-6 rounded-2xl border border-violet-500/25 bg-violet-50/60 dark:bg-violet-950/20 p-5">
                    <p className="text-sm font-bold text-violet-700 dark:text-violet-300 mb-3">Includes all 3 boosts:</p>
                    <div className="flex flex-wrap gap-2">
                      {(["SPOTLIGHT", "PUSH_UP", "URGENT"] as ActiveBoost[]).map((type) => {
                        const c = BOOST_CONFIGS[type];
                        const BIcon = c.icon;
                        return (
                          <span key={type} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${c.badgeClass}`}>
                            <BIcon className="h-3.5 w-3.5" />
                            {c.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Pricing */}
              <div className="lg:w-72 shrink-0">
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${cfg.textColor}`}>
                  Choose Duration
                </h3>
                <div className="space-y-2">
                  {allDurations.map((dur) => {
                    const price = getPrice(activeBoost, dur);
                    const base = getBasePrice(activeBoost, dur);
                    const disc = getDiscount(activeBoost, dur);
                    const isSelected = selectedDuration === dur;
                    return (
                      <button
                        key={dur}
                        id={`duration-${activeBoost.toLowerCase()}-${dur.toLowerCase()}`}
                        type="button"
                        onClick={() => setSelectedDuration(dur)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer text-left ${isSelected
                          ? `${cfg.borderColor} ${cfg.bgGlow}`
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? `bg-gradient-to-br ${cfg.gradient} border-transparent` : "border-slate-300 dark:border-slate-600"}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {DURATION_LABELS[dur]}
                          </span>
                          {disc > 0 && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                              -{disc}%
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {loading ? (
                            <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                          ) : price !== null ? (
                            <>
                              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Rs {price.toLocaleString()}
                              </p>
                              {base && (
                                <p className="text-[10px] text-slate-400 line-through">
                                  Rs {base.toLocaleString()}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-slate-400">—</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Price Summary */}
                {currentPrice !== null && (
                  <div className={`mt-5 rounded-2xl border ${cfg.borderColor} ${cfg.bgGlow} p-5`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Total for {DURATION_LABELS[selectedDuration]}</span>
                      {discount > 0 && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${cfg.badgeClass}`}>
                          Save {discount}%
                        </span>
                      )}
                    </div>
                    <p className={`text-3xl font-black ${cfg.textColor}`}>
                      Rs {currentPrice.toLocaleString()}
                    </p>
                    {basePrice && (
                      <p className="text-xs text-slate-400 line-through mt-0.5">
                        Rs {basePrice.toLocaleString()}
                      </p>
                    )}
                    <Link
                      href="/listings"
                      id={`boost-cta-${activeBoost.toLowerCase()}`}
                      className={`mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r ${cfg.gradient} text-white text-sm font-bold shadow-lg hover:opacity-95 transition-all hover:shadow-xl`}
                    >
                      Boost a Listing <ArrowRight className="h-4 w-4" />
                    </Link>
                    <p className="text-center text-[10px] text-slate-400 mt-3">
                      Secure payment via PayHere
                    </p>
                  </div>
                )}

                {/* Trust Signals */}
                <div className="mt-4 space-y-2">
                  {[
                    { icon: ShieldCheck, text: "PCI-DSS Secure Checkout" },
                    { icon: BadgeCheck, text: "Instant activation on payment" },
                    { icon: Timer, text: "Auto-expires, no hidden renewals" },
                  ].map(({ icon: TIcon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <TIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
            Compare All Boosts
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
            Find the boost that best matches your selling goal.
          </p>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-48">
                    Feature
                  </th>
                  {(Object.keys(BOOST_CONFIGS) as ActiveBoost[]).map((type) => {
                    const c = BOOST_CONFIGS[type];
                    const BIcon = c.icon;
                    return (
                      <th key={type} className={`px-4 py-4 text-center ${type === "POWER_PACK" ? "bg-violet-50/60 dark:bg-violet-950/20" : ""}`}>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`p-2 rounded-xl ${c.bgGlow} ${c.textColor}`}>
                            <BIcon className="h-4 w-4" />
                          </div>
                          <span className={`text-xs font-bold ${c.textColor}`}>{c.label}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  {
                    feature: "Top placement",
                    values: { SPOTLIGHT: true, PUSH_UP: false, URGENT: false, POWER_PACK: true },
                  },
                  {
                    feature: "Daily auto-bump",
                    values: { SPOTLIGHT: false, PUSH_UP: true, URGENT: false, POWER_PACK: true },
                  },
                  {
                    feature: "Urgent ribbon",
                    values: { SPOTLIGHT: false, PUSH_UP: false, URGENT: true, POWER_PACK: true },
                  },
                  {
                    feature: "Golden Spotlight badge",
                    values: { SPOTLIGHT: true, PUSH_UP: false, URGENT: false, POWER_PACK: true },
                  },
                  {
                    feature: "Appears on homepage",
                    values: { SPOTLIGHT: true, PUSH_UP: true, URGENT: true, POWER_PACK: true },
                  },
                  {
                    feature: "Category page priority",
                    values: { SPOTLIGHT: true, PUSH_UP: true, URGENT: false, POWER_PACK: true },
                  },
                  {
                    feature: "Best for quick sales",
                    values: { SPOTLIGHT: false, PUSH_UP: false, URGENT: true, POWER_PACK: true },
                  },
                  {
                    feature: "Bundle savings",
                    values: { SPOTLIGHT: false, PUSH_UP: false, URGENT: false, POWER_PACK: true },
                  },
                ].map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5 text-sm text-slate-600 dark:text-slate-400">
                      {row.feature}
                    </td>
                    {(Object.keys(BOOST_CONFIGS) as ActiveBoost[]).map((type) => (
                      <td
                        key={type}
                        className={`px-4 py-3.5 text-center ${type === "POWER_PACK" ? "bg-violet-50/60 dark:bg-violet-950/20" : ""}`}
                      >
                        {row.values[type] ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500 mx-auto" />
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 text-lg font-bold mx-auto block text-center">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How It Works */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-sm">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              How Ad Boosting Works
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Simple 3-step checkout with instant activation powered by PayHere.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon: SIcon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="relative mx-auto w-16 h-16">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                    <SIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h4 className="mt-5 font-bold text-slate-900 dark:text-white">{title}</h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Final CTA — brand emerald ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-10 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.25) 0%, transparent 60%)" }} />
          <div className="relative">
            <Star className="h-10 w-10 text-emerald-200 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to Get More Inquiries?
            </h2>
            <p className="text-emerald-50/90 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
              Boosted listings sell up to 10× faster. Start with as little as Rs 199 and watch the inquiries roll in.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/listings"
                id="boost-final-cta"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-emerald-700 font-bold text-sm shadow-xl hover:shadow-2xl transition-all hover:scale-105"
              >
                Boost My Listing Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/promotions"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-all"
              >
                <Layers className="h-4 w-4" />
                View Pricing Overview
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}