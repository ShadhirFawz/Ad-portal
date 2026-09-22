"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Star,
  ArrowUpCircle,
  Flame,
  Zap,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Award,
  Tag,
  Percent,
} from "lucide-react";
import { getListing } from "@/lib/api/listings";
import { getBoostPlans, createBoostCheckout, getListingBoosts } from "@/lib/api/boosts";
import type { Listing } from "@/types/listing";
import type { BoostPlan, BoostType, BoostDuration, AdBoost, BoostPricingTier } from "@/types/boost";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";

interface PageProps {
  params: Promise<{ id: string }>;
}

const DURATION_OPTIONS: { key: BoostDuration; label: string; days: number; defaultTag?: string }[] = [
  { key: "THREE_DAYS", label: "3 Days", days: 3 },
  { key: "SEVEN_DAYS", label: "7 Days", days: 7, defaultTag: "Popular" },
  { key: "FOURTEEN_DAYS", label: "14 Days", days: 14 },
  { key: "THIRTY_DAYS", label: "30 Days", days: 30, defaultTag: "Best Value" },
];

export default function BoostListingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = Boolean(user);
  const { success: toastSuccess, error: toastError } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [plans, setPlans] = useState<BoostPlan[]>([]);
  const [existingBoosts, setExistingBoosts] = useState<AdBoost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form selections
  const [selectedType, setSelectedType] = useState<BoostType>("SPOTLIGHT");
  const [selectedDuration, setSelectedDuration] = useState<BoostDuration>("SEVEN_DAYS");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [listingData, plansData, activeBoosts] = await Promise.all([
          getListing(listingId),
          getBoostPlans().catch(() => []),
          getListingBoosts(listingId).catch(() => []),
        ]);

        setListing(listingData);
        setExistingBoosts(activeBoosts);

        if (plansData && plansData.length > 0) {
          setPlans(plansData);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load boost options";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [listingId]);

  // Selected Plan and Pricing Tier Details from Database
  const currentPlan = plans.find((p) => p.boostType === selectedType) || plans[0];
  const currentTier: BoostPricingTier | undefined = currentPlan?.pricingTiers?.find(
    (t) => t.duration === selectedDuration
  );

  const basePrice = currentTier?.basePrice ?? currentPlan?.pricing?.[selectedDuration] ?? 0;
  const discountPercentage = currentTier?.discountPercentage ?? 0;
  const discountAmount = currentTier?.discountAmount ?? 0;
  const priceAfterDiscount = currentTier?.priceAfterDiscount ?? (basePrice - discountAmount);
  const taxPercentage = currentTier?.taxPercentage ?? 0;
  const taxAmount = currentTier?.taxAmount ?? 0;
  const finalPrice = currentTier?.finalPrice ?? currentPlan?.pricing?.[selectedDuration] ?? 0;

  const currentDays = DURATION_OPTIONS.find((d) => d.key === selectedDuration)?.days || 7;
  const pricePerDay = Math.round(finalPrice / currentDays);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toastError("Sign in required", "Please log in to boost your listing.");
      router.push(`/login?redirect=${encodeURIComponent(`/listings/${listingId}/boost`)}`);
      return;
    }

    try {
      setSubmitting(true);

      let scheduledStartTime: string | null = null;
      if (isScheduled && scheduledDate && scheduledTime) {
        scheduledStartTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      }

      const checkoutData = await createBoostCheckout({
        listingId,
        boostType: selectedType,
        duration: selectedDuration,
        scheduledStartTime,
      });

      toastSuccess("Redirecting to PayHere...", "Please complete your payment securely.");

      // Construct and submit hidden form to PayHere checkout.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = checkoutData.payHereCheckoutUrl;
      form.style.display = "none";
      form.referrerPolicy = "unsafe-url";

      Object.entries(checkoutData.payHereParams).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate payment";
      toastError("Checkout failed", message);
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-slate-500">Loading boost options & live rates...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Could not load listing</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{error || "Listing not found"}</p>
        <Link
          href={`/listings/${listingId}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/listings/${listingId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to listing
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Official PayHere Secured Payment</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-600 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400">
            <Megaphone className="h-3.5 w-3.5" /> Ad Supercharge
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Boost Your Listing Visibility
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600 dark:text-slate-400">
            Get up to 10x more buyer views, inquiries, and fast deals by choosing the right promotion tier for your ad.
          </p>
        </div>

        {/* Existing Active Boosts Alert */}
        {existingBoosts.length > 0 && (
          <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-50/80 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Active Promotions on this Listing
                </h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {existingBoosts.map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                    >
                      {b.boostType} • {b.durationDays} days (expires{" "}
                      {new Date(b.expiresAt).toLocaleDateString()})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Selection Area */}
          <div className="space-y-8 lg:col-span-8">
            {/* Step 1: Choose Promotion Tier */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 1
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Choose Your Boost Option
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {plans.map((plan) => {
                  const isSelected = selectedType === plan.boostType;
                  // Get selected duration tier for this plan
                  const planTier = plan.pricingTiers?.find((t) => t.duration === selectedDuration);
                  const planFinalPrice = planTier?.finalPrice ?? plan.pricing?.[selectedDuration] ?? 0;
                  const planBasePrice = planTier?.basePrice ?? planFinalPrice;
                  const planDiscount = planTier?.discountPercentage ?? 0;

                  return (
                    <div
                      key={plan.boostType}
                      onClick={() => setSelectedType(plan.boostType)}
                      className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 p-5 transition-all duration-200 ${isSelected
                        ? plan.boostType === "SPOTLIGHT"
                          ? "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10 dark:border-amber-400 dark:bg-amber-400/5"
                          : plan.boostType === "PUSH_UP"
                            ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-400/5"
                            : plan.boostType === "HOT_DEAL"
                              ? "border-rose-500 bg-rose-500/5 shadow-lg shadow-rose-500/10 dark:border-rose-400 dark:bg-rose-400/5"
                              : "border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10 dark:border-purple-400 dark:bg-purple-400/5"
                        : "border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                        }`}
                    >
                      {/* Selection Checkmark & Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {plan.boostType === "SPOTLIGHT" && (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                              <Star className="h-5 w-5" />
                            </div>
                          )}
                          {plan.boostType === "PUSH_UP" && (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                              <ArrowUpCircle className="h-5 w-5" />
                            </div>
                          )}
                          {plan.boostType === "HOT_DEAL" && (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
                              <Flame className="h-5 w-5" />
                            </div>
                          )}
                          {plan.boostType === "POWER_PACK" && (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
                              <Zap className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              {plan.badgeText}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-600"
                            }`}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4" />}
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                        {plan.description}
                      </p>

                      {/* Highlights */}
                      <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-700 dark:border-slate-800 dark:text-slate-300">
                        {plan.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Price Indicator with Discount */}
                      <div className="mt-5 flex items-baseline justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                        <span className="text-xs text-slate-500">Total Price</span>
                        <div className="text-right">
                          {planDiscount > 0 && (
                            <span className="mr-2 text-xs text-slate-400 line-through">
                              Rs {planBasePrice.toLocaleString()}
                            </span>
                          )}
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            Rs {planFinalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Duration Selector with Dynamic Discounts */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step 2
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Select Promotion Duration
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Live rates rendered dynamically from your pricing tiers with applied discounts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {DURATION_OPTIONS.map((opt) => {
                  const isSelected = selectedDuration === opt.key;
                  const tier = currentPlan?.pricingTiers?.find((t) => t.duration === opt.key);
                  const optFinalPrice = tier?.finalPrice ?? currentPlan?.pricing?.[opt.key] ?? 0;
                  const optBasePrice = tier?.basePrice ?? optFinalPrice;
                  const optDiscount = tier?.discountPercentage ?? 0;
                  const daily = Math.round(optFinalPrice / opt.days);

                  // Badge priority: Discount badge > Default tag
                  const tagText =
                    optDiscount > 0
                      ? `${Math.round(optDiscount)}% OFF`
                      : opt.defaultTag;

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedDuration(opt.key)}
                      className={`relative flex flex-col items-center rounded-2xl border-2 p-4 text-center transition-all ${isSelected
                        ? "border-emerald-500 bg-emerald-500/5 shadow-md dark:border-emerald-400 dark:bg-emerald-400/5"
                        : "border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                        }`}
                    >
                      {tagText && (
                        <span
                          className={`absolute -top-2.5 rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shadow-xs ${optDiscount > 0
                            ? "bg-gradient-to-r from-rose-600 to-orange-500 text-white"
                            : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                            }`}
                        >
                          {tagText}
                        </span>
                      )}
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </span>

                      {/* Strikethrough base price if discounted */}
                      {optDiscount > 0 && (
                        <span className="mt-0.5 text-[11px] text-slate-400 line-through">
                          Rs {optBasePrice.toLocaleString()}
                        </span>
                      )}

                      <span className="mt-0.5 text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        Rs {optFinalPrice.toLocaleString()}
                      </span>
                      <span className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        ~Rs {daily}/day
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 3: Schedule Boost (Optional) */}
            <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 3 (Optional)
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Schedule Boost for Future Date
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Align your promotion with paydays, weekends, festivals, or peak shopping hours.
                  </p>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-hidden dark:bg-slate-700"></div>
                </label>
              </div>

              {isScheduled && (
                <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="date"
                        value={scheduledDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Start Time
                    </label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-xs focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Summary & Payment Area */}
          <div className="space-y-6 lg:col-span-4">
            {/* Listing Preview Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selected Listing
              </h3>

              <div className="mt-3 flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  {listing.images?.[0]?.url ? (
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No photo
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {listing.title}
                  </h4>
                  <p className="mt-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Rs {listing.price?.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {listing.categoryName} • {listing.city || "Sri Lanka"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Breakdown Box with Dynamic Discount & Tax Details */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Promotion Summary
              </h3>

              <div className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Selected Boost</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentPlan?.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Duration</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currentDays} Days
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Base Price</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    Rs {basePrice.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      Discount ({discountPercentage}%)
                    </span>
                    <span>-Rs {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {taxAmount > 0 ? (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tax / VAT ({taxPercentage}%)</span>
                    <span>+Rs {taxAmount.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-slate-500 text-xs">
                    <span>Taxes &amp; Fees</span>
                    <span>0% (Inclusive)</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Activation</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {isScheduled && scheduledDate
                      ? `Scheduled: ${scheduledDate} ${scheduledTime || ""}`
                      : "Instant (Upon payment)"}
                  </span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    Rs {finalPrice.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-500">LKR (Final payable amount)</span>
                </div>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting to PayHere...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay LKR {finalPrice.toLocaleString()}
                  </>
                )}
              </button>

              {/* Supported payment channels */}
              <div className="mt-4 text-center">
                <span className="text-[11px] text-slate-400">
                  Visa, MasterCard, Amex, eZ Cash, FriMi, Genie, Bank Transfer
                </span>
              </div>
            </div>

            {/* Satisfaction Guarantee */}
            <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 p-4 text-xs text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
              <Award className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                Boosted listings receive prominent ranking immediately after payment confirmation.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
