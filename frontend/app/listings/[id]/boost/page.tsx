"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getListing } from "@/lib/api/listings";
import { getBoostPlans, createBoostCheckout, getListingBoosts, applyBonusBoost } from "@/lib/api/boosts";
import { getMyActiveMembership } from "@/lib/api/membership";
import type { Listing } from "@/types/listing";
import type { BoostPlan, BoostType, BoostDuration, AdBoost, BoostPricingTier } from "@/types/boost";
import type { SellerMembership } from "@/types/membership";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
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
  Sparkles,
  Gift,
  CheckCheck,
  UserShieldIcon,
} from "lucide-react";

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
  const { user, accessToken, loading: authLoading } = useAuth();
  const isAuthenticated = Boolean(user);
  const { success: toastSuccess, error: toastError } = useToast();

  const [listing, setListing] = useState<Listing | null>(null);
  const [plans, setPlans] = useState<BoostPlan[]>([]);
  const [existingBoosts, setExistingBoosts] = useState<AdBoost[]>([]);
  const [activeMembership, setActiveMembership] = useState<SellerMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form selections
  const [selectedType, setSelectedType] = useState<BoostType>("SPOTLIGHT");
  const [selectedDuration, setSelectedDuration] = useState<BoostDuration>("SEVEN_DAYS");
  const [useBonusCredit, setUseBonusCredit] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [listingData, plansData, activeBoosts, membershipData] = await Promise.all([
          getListing(listingId),
          getBoostPlans().catch(() => []),
          getListingBoosts(listingId).catch(() => []),
          accessToken ? getMyActiveMembership(accessToken).catch(() => null) : Promise.resolve(null),
        ]);

        if (listingData && user && listingData.sellerId && listingData.sellerId !== user.id) {
          setError("You can only boost listings that you own.");
          setLoading(false);
          return;
        }

        setListing(listingData);
        setExistingBoosts(activeBoosts);
        setActiveMembership(membershipData);

        if (plansData && plansData.length > 0) {
          setPlans(plansData);
          // Pick first available boost that isn't already active
          const activeTypes = new Set(activeBoosts.map((b) => b.boostType));
          const hasPowerPack = activeTypes.has("POWER_PACK");
          const availablePlan = plansData.find((p) => {
            if (hasPowerPack) return false;
            if (activeTypes.size > 0 && p.boostType === "POWER_PACK") return false;
            return !activeTypes.has(p.boostType);
          });
          if (availablePlan) {
            setSelectedType(availablePlan.boostType);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load boost options";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [listingId, accessToken, user]);

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

  // Available Bonus Credits for current selected boost type
  const availableBonusCredits = React.useMemo(() => {
    if (!activeMembership || !activeMembership.isActive) return 0;
    if (selectedType === "SPOTLIGHT") return activeMembership.remainingSpotlights ?? 0;
    if (selectedType === "PUSH_UP") return activeMembership.remainingPushUps ?? 0;
    if (selectedType === "URGENT") return activeMembership.remainingUrgents ?? 0;
    return 0; // POWER_PACK is not redeemable via individual bonus credits
  }, [activeMembership, selectedType]);

  // Check if selected duration is completely within active membership validity period
  const isWithinMembershipPeriod = React.useMemo(() => {
    if (!activeMembership || !activeMembership.endDate) return false;
    const days = DURATION_OPTIONS.find((d) => d.key === selectedDuration)?.days || 7;
    const startTimestamp = isScheduled && scheduledDate ? new Date(`${scheduledDate}T${scheduledTime || "00:00"}:00`).getTime() : Date.now();
    const expiryTimestamp = startTimestamp + days * 24 * 60 * 60 * 1000;
    const membershipEndTimestamp = new Date(activeMembership.endDate).getTime();
    return expiryTimestamp <= membershipEndTimestamp;
  }, [activeMembership, selectedDuration, isScheduled, scheduledDate, scheduledTime]);

  // Reset useBonusCredit if switched to an ineligible boost type or duration exceeding membership
  useEffect(() => {
    if (availableBonusCredits <= 0 || !isWithinMembershipPeriod) {
      setUseBonusCredit(false);
    }
  }, [availableBonusCredits, isWithinMembershipPeriod, selectedType, selectedDuration]);

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

      // Bonus Credit Redemption Flow (Skips PayHere Gateway entirely)
      if (useBonusCredit) {
        const activatedBoost = await applyBonusBoost({
          listingId,
          boostType: selectedType,
          duration: selectedDuration,
          scheduledStartTime,
        });

        toastSuccess(
          "Verified Seller Perk Applied!",
          "Your boost has been activated immediately using your membership bonus credit."
        );

        router.push(
          `/promotions/success?order_id=${encodeURIComponent(
            activatedBoost.orderId || activatedBoost.id
          )}&is_bonus=true`
        );
        return;
      }

      // Standard PayHere Gateway Flow
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
      form.referrerPolicy = "no-referrer-when-downgrade";

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
                  const activeBoostOfThisType = existingBoosts.find(
                    (b) => b.boostType === plan.boostType && b.boostStatus === "ACTIVE"
                  );
                  const scheduledBoostOfThisType = existingBoosts.find(
                    (b) => b.boostType === plan.boostType && b.boostStatus === "SCHEDULED"
                  );
                  const isThisBoostActive = !!activeBoostOfThisType;
                  const hasScheduledQueue = !!scheduledBoostOfThisType;

                  const isPowerPackActive = existingBoosts.some(
                    (b) => b.boostType === "POWER_PACK" && b.boostStatus === "ACTIVE"
                  );
                  const isPowerPackScheduled = existingBoosts.some(
                    (b) => b.boostType === "POWER_PACK" && b.boostStatus === "SCHEDULED"
                  );
                  const hasOtherIndividualActive = existingBoosts.some(
                    (b) => b.boostType !== "POWER_PACK" && (b.boostStatus === "ACTIVE" || b.boostStatus === "SCHEDULED")
                  );

                  // Power pack rules:
                  // - Blocked if individual boosts are active/scheduled
                  // - Blocked if Power Pack already has a scheduled queue
                  const isPowerPackBlocked =
                    plan.boostType === "POWER_PACK" &&
                    (hasOtherIndividualActive || isPowerPackScheduled);

                  // Individual boost rules:
                  // - Blocked if Power Pack is active/scheduled
                  // - Blocked if THIS boost type already has a scheduled queue (max 1 active + 1 scheduled queue)
                  const isIndividualBlocked =
                    (isPowerPackActive || isPowerPackScheduled) || hasScheduledQueue;

                  const isDisabled = isPowerPackBlocked || isIndividualBlocked;
                  const isExtensionMode = isThisBoostActive && !hasScheduledQueue && !isDisabled;

                  // Get selected duration tier for this plan
                  const planTier = plan.pricingTiers?.find((t) => t.duration === selectedDuration);
                  const planFinalPrice = planTier?.finalPrice ?? plan.pricing?.[selectedDuration] ?? 0;
                  const planBasePrice = planTier?.basePrice ?? planFinalPrice;
                  const planDiscount = planTier?.discountPercentage ?? 0;

                  return (
                    <div
                      key={plan.boostType}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedType(plan.boostType);
                        }
                      }}
                      className={`relative flex flex-col justify-between rounded-2xl border-2 p-5 transition-all duration-200 ${isDisabled
                        ? "cursor-not-allowed border-slate-200 bg-slate-50/70 opacity-60 dark:border-slate-800 dark:bg-slate-900/40"
                        : "cursor-pointer"
                        } ${isSelected && !isDisabled
                          ? plan.boostType === "SPOTLIGHT"
                            ? "border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/10 dark:border-amber-400 dark:bg-amber-400/5"
                            : plan.boostType === "PUSH_UP"
                              ? "border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-400/5"
                              : plan.boostType === "URGENT"
                                ? "border-rose-500 bg-rose-500/5 shadow-lg shadow-rose-500/10 dark:border-rose-400 dark:bg-rose-400/5"
                                : "border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10 dark:border-purple-400 dark:bg-purple-400/5"
                          : !isDisabled
                            ? "border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                            : ""
                        }`}
                    >
                      {/* Status Badges for Active / Extension / Conflict */}
                      {hasScheduledQueue && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <Clock className="h-3 w-3" /> Scheduled in Queue (Max Reached)
                          </span>
                        </div>
                      )}
                      {isExtensionMode && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Active — Click to Queue 2nd Round!
                          </span>
                        </div>
                      )}
                      {isPowerPackBlocked && !isThisBoostActive && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                            Cannot combine with active boosts
                          </span>
                        </div>
                      )}
                      {(isPowerPackActive || isPowerPackScheduled) && plan.boostType !== "POWER_PACK" && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                            Covered by Active Power Pack
                          </span>
                        </div>
                      )}
                      {!isDisabled && !isThisBoostActive && hasOtherIndividualActive && plan.boostType !== "POWER_PACK" && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                            Available to combine with active boosts!
                          </span>
                        </div>
                      )}

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
                          {plan.boostType === "URGENT" && (
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
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected && !isDisabled
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 dark:border-slate-600"
                            }`}
                        >
                          {isSelected && !isDisabled && <CheckCircle2 className="h-4 w-4" />}
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

            {/* Verified Seller Bonus Credits Perk Card (Optional Application) */}
            {activeMembership && activeMembership.isActive && selectedType !== "POWER_PACK" && (
              <section className="space-y-3">
                {availableBonusCredits > 0 ? (
                  isWithinMembershipPeriod ? (
                    <div
                      className={`rounded-3xl border-2 p-5 transition-all ${useBonusCredit
                        ? "border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-950/30"
                        : "border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900/90"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                            <UserShieldIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                Verified Seller Benefit
                              </span>
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200">
                                {availableBonusCredits} {availableBonusCredits === 1 ? "credit" : "credits"} available
                              </span>
                            </div>
                            <h3 className="mt-0.5 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              Use 1 Free Bonus {currentPlan?.name} Credit
                            </h3>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                              Redeem from your {activeMembership.planTier} Membership ({activeMembership.rootCategoryName}). Skips payment gateway and activates immediately.
                            </p>
                          </div>
                        </div>

                        <label className="relative inline-flex cursor-pointer items-center shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={useBonusCredit}
                            onChange={(e) => setUseBonusCredit(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-hidden dark:bg-slate-700"></div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-amber-500/30 bg-amber-50/80 p-4.5 dark:border-amber-400/30 dark:bg-amber-950/20">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                            Bonus Credit Period Constraint
                          </h4>
                          <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                            You have {availableBonusCredits} free {currentPlan?.name} {availableBonusCredits === 1 ? "credit" : "credits"}, but the selected {currentDays}-day boost exceeds your membership expiry date ({activeMembership.endDate ? new Date(activeMembership.endDate).toLocaleDateString() : "N/A"}). Select a shorter duration to redeem.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-3.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Verified Seller Plan:</span> You have used all bonus {currentPlan?.name} credits for this billing cycle ({activeMembership.planTier} Plan).
                  </div>
                )}
              </section>
            )}

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
                      <Image
                        src="/Wudo_watermark.png"
                        alt="Wudo"
                        width={160}
                        height={40}
                        priority
                        className="h-12 w-auto object-contain mx-auto opacity-50"
                      />
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

                {/* Chained Extension Notice if extending active boost */}
                {existingBoosts.some((b) => b.boostType === selectedType && b.boostStatus === "ACTIVE") && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/90 p-3 text-xs dark:border-emerald-500/30 dark:bg-emerald-950/40">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Chained Extension Queue</span>
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                      Auto-starts on{" "}
                      <strong>
                        {new Date(
                          existingBoosts.find((b) => b.boostType === selectedType && b.boostStatus === "ACTIVE")!.expiresAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>{" "}
                      (exact end date of your active period).
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Base Price</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    Rs {basePrice.toLocaleString()}
                  </span>
                </div>

                {discountAmount > 0 && !useBonusCredit && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      Discount ({discountPercentage}%)
                    </span>
                    <span>-Rs {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {taxAmount > 0 && !useBonusCredit ? (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tax / VAT ({taxPercentage}%)</span>
                    <span>+Rs {taxAmount.toLocaleString()}</span>
                  </div>
                ) : !useBonusCredit ? (
                  <div className="flex justify-between text-slate-500 text-xs">
                    <span>Taxes &amp; Fees</span>
                    <span>0% (Inclusive)</span>
                  </div>
                ) : null}

                {/* Bonus Credit Application Line Item */}
                {useBonusCredit && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Verified Seller Bonus
                    </span>
                    <span>-Rs {finalPrice.toLocaleString()} (100% OFF)</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Activation</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {isScheduled && scheduledDate
                      ? `Scheduled: ${scheduledDate} ${scheduledTime || ""}`
                      : useBonusCredit
                        ? "Instant (Bonus Credit Applied)"
                        : "Instant (Upon payment)"}
                  </span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total Amount</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    Rs {useBonusCredit ? "0" : finalPrice.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {useBonusCredit ? "Free with Membership Perk" : "LKR (Final payable amount)"}
                  </span>
                </div>
              </div>

              {/* Pay or Activate Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={submitting}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold text-white shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${useBonusCredit
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 hover:shadow-xl"
                  }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {useBonusCredit ? "Applying Bonus Perk..." : "Connecting to PayHere..."}
                  </>
                ) : useBonusCredit ? (
                  <>
                    <CheckCheck className="h-5 w-5" />
                    Activate Free with Bonus Credit
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Pay LKR {finalPrice.toLocaleString()}
                  </>
                )}
              </button>

              {/* Supported payment channels */}
              <div className="mt-5 flex flex-col items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Accepted Cards
                </p>
                <div className="flex items-center gap-3">
                  {[
                    { src: "/visa.svg", alt: "Visa", label: "Visa" },
                    { src: "/mastercard.svg", alt: "Mastercard", label: "Mastercard" },
                    { src: "/amex.svg", alt: "American Express", label: "Amex" },
                  ].map(({ src, alt, label }, i) => (
                    <div
                      key={alt}
                      title={alt}
                      className="group relative flex flex-col items-center gap-1"
                      style={{
                        animation: `fadeSlideUp 0.4s ease both`,
                        animationDelay: `${i * 80}ms`,
                      }}
                    >
                      <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl">
                        {/* Shine sweep on hover */}
                        <div className="pointer-events-none absolute inset-0 -skew-x-12 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-500 ease-in-out group-hover:translate-x-full" />
                        <img
                          src={src}
                          alt={alt}
                          width={56}
                          height={36}
                          className="block h-9 w-14 rounded-md object-cover"
                        />
                      </div>
                      <span className="text-[9px] font-medium tracking-wide text-slate-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <style>{`
                @keyframes fadeSlideUp {
                  from { opacity: 0; transform: translateY(8px); }
                  to   { opacity: 1; transform: translateY(0); }
                }
              `}</style>
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
