"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import { getRootCategories } from "@/lib/api/categories";
import {
  getMembershipPlans,
  getMyActiveMembership,
  initiateMembership,
  confirmSandboxMembership,
} from "@/lib/api/membership";
import type { Category } from "@/types/category";
import type {
  MembershipPricingPlan,
  PlanTier,
  BillingCycle,
  SellerMembership,
  InitiateMembershipResponse,
} from "@/types/membership";
import type { OpeningHour } from "@/lib/openingHours";
import { DEFAULT_OPENING_HOURS } from "@/lib/openingHours";
import VerifiedSellerBadge from "@/components/common/VerifiedSellerBadge";
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  ArrowLeft,
  Store,
  Layers,
  Flame,
  ArrowUpCircle,
  Mail,
  Phone,
  FileText,
  CreditCard,
  Building2,
  Plus,
  Loader2,
  Star,
  Lock,
} from "lucide-react";
import {
  FaCar,
  FaMobileAlt,
  FaLaptop,
  FaTshirt,
  FaCouch,
  FaTrophy,
  FaBook,
  FaTools,
  FaBuilding,
  FaBriefcase,
  FaPaw,
  FaLeaf,
  FaUtensils,
  FaHeart,
  FaIndustry,
  FaBox,
} from "react-icons/fa";
import { IconType } from "react-icons";

function getCategoryIcon(name: string, slug?: string): IconType {
  const text = `${name} ${slug || ""}`.toLowerCase();
  if (text.includes("vehic") || text.includes("car") || text.includes("motor") || text.includes("bike")) return FaCar;
  if (text.includes("phone") || text.includes("mob")) return FaMobileAlt;
  if (text.includes("elect") || text.includes("comput") || text.includes("laptop") || text.includes("gadget")) return FaLaptop;
  if (text.includes("fash") || text.includes("cloth") || text.includes("wear") || text.includes("shoe") || text.includes("bag")) return FaTshirt;
  if (text.includes("home") || text.includes("furnit") || text.includes("garden") || text.includes("appliance")) return FaCouch;
  if (text.includes("sport") || text.includes("hobb") || text.includes("fit") || text.includes("game")) return FaTrophy;
  if (text.includes("book") || text.includes("media") || text.includes("music") || text.includes("educa")) return FaBook;
  if (text.includes("serv") || text.includes("repair") || text.includes("skill")) return FaTools;
  if (text.includes("prop") || text.includes("estate") || text.includes("land") || text.includes("house")) return FaBuilding;
  if (text.includes("job") || text.includes("work") || text.includes("career")) return FaBriefcase;
  if (text.includes("pet") || text.includes("animal")) return FaPaw;
  if (text.includes("agri")) return FaLeaf;
  if (text.includes("food") || text.includes("grocery")) return FaUtensils;
  if (text.includes("health") || text.includes("beauty") || text.includes("kid") || text.includes("toy")) return FaHeart;
  if (text.includes("business") || text.includes("industry")) return FaIndustry;
  return FaBox;
}

export default function UpgradeToVerifiedSellerPage() {
  const router = useRouter();
  const { user, accessToken, loading: authLoading, syncProfile } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [activeMembership, setActiveMembership] = useState<SellerMembership | null>(null);

  // Step 1: Root Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Step 2: Plans
  const [plans, setPlans] = useState<MembershipPricingPlan[]>([]);
  const [selectedTier, setSelectedTier] = useState<PlanTier>("PRO");
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("MONTHLY");

  // Step 3: Business Details
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isAddingNewPhone, setIsAddingNewPhone] = useState(false);
  const [bio, setBio] = useState("");
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(DEFAULT_OPENING_HOURS);

  // Step 4: Checkout
  const [checkoutData, setCheckoutData] = useState<InitiateMembershipResponse | null>(null);
  const [paying, setPaying] = useState(false);

  // Check auth & existing membership
  useEffect(() => {
    if (authLoading) return;
    if (!user || !accessToken) {
      router.replace("/login?redirect=/membership/upgrade");
      return;
    }

    if (user.role === "MEMBER") {
      toastInfo("Become a Seller First", "Please complete the free seller setup before purchasing a verified seller membership.");
      router.replace("/become-a-seller");
      return;
    }

    // Prefill user data
    if (user.businessName) setBusinessName(user.businessName);
    if (user.businessEmail) setBusinessEmail(user.businessEmail);
    if (user.bio) setBio(user.bio);
    if (user.openingHours && user.openingHours.length === 7) {
      setOpeningHours(user.openingHours);
    }
    if (user.phoneNumbers && user.phoneNumbers.length > 0) {
      const bizPhone = user.phoneNumbers.find((p) => p.isBusiness);
      if (bizPhone) {
        setSelectedPhone(bizPhone.phoneNumber);
      } else {
        setSelectedPhone(user.phoneNumbers[0].phoneNumber);
      }
    } else if (user.phoneNumber) {
      setSelectedPhone(user.phoneNumber);
    }

    // Check existing membership
    getMyActiveMembership(accessToken)
      .then((res) => {
        if (res && res.isActive) {
          setActiveMembership(res);
        }
      })
      .catch(() => { });

    // Fetch root categories
    getRootCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0 && !selectedCategory) {
          setSelectedCategory(cats[0]);
        }
      })
      .catch(() => {
        toastError("Failed to load categories", "Please refresh the page.");
      });
  }, [authLoading, user, accessToken, router]);

  // Load plans when category changes
  useEffect(() => {
    if (!selectedCategory || !accessToken) return;
    setPlansLoading(true);
    getMembershipPlans(selectedCategory.id, accessToken)
      .then((data) => {
        setPlans(data);
      })
      .catch(() => {
        toastError("Failed to load pricing plans", "Could not fetch dynamic category plans.");
      })
      .finally(() => {
        setPlansLoading(false);
      });
  }, [selectedCategory, accessToken]);

  const currentPlan = useMemo(() => {
    return plans.find(
      (p) => p.planTier === selectedTier && p.billingCycle === selectedCycle
    );
  }, [plans, selectedTier, selectedCycle]);

  const handleNextToStep2 = () => {
    if (!selectedCategory) {
      toastError("Select a Category", "Please select a root category to proceed.");
      return;
    }
    setStep(2);
  };

  const handleNextToStep3 = () => {
    if (!currentPlan) {
      toastError("Select a Plan", "Please select a valid membership plan.");
      return;
    }
    setStep(3);
  };

  const handleNextToStep4 = async () => {
    if (!businessName.trim()) {
      toastError("Business Name Required", "Please enter your store or business name.");
      return;
    }
    if (!businessEmail.trim() || !businessEmail.includes("@")) {
      toastError("Valid Business Email Required", "Please provide a valid business email address.");
      return;
    }

    const phoneToUse = isAddingNewPhone ? newPhoneNumber.trim() : selectedPhone.trim();
    if (!phoneToUse) {
      toastError("Business Phone Required", "Please select or add a valid business phone number.");
      return;
    }

    if (!currentPlan || !selectedCategory || !accessToken) return;

    setLoading(true);
    try {
      const res = await initiateMembership(accessToken, {
        rootCategoryId: selectedCategory.id,
        pricingPlanId: currentPlan.id,
        businessName: businessName.trim(),
        businessEmail: businessEmail.trim(),
        businessPhone: phoneToUse,
        bio: bio.trim() || undefined,
        openingHours,
      });

      setCheckoutData(res);
      setStep(4);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to initiate membership checkout.";
      toastError("Checkout Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayHereCheckout = () => {
    if (!checkoutData) return;
    setPaying(true);
    try {
      toastSuccess("Connecting to PayHere...", "Redirecting to secure payment checkout.");

      const form = document.createElement("form");
      form.method = "POST";
      form.action = checkoutData.payHereCheckoutUrl || "https://sandbox.payhere.lk/pay/checkout";
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
      const message = err instanceof Error ? err.message : "Failed to initiate PayHere payment.";
      toastError("Payment Failed", message);
      setPaying(false);
    }
  };

  if (activeMembership && activeMembership.isActive) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4 shadow-xl">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            You Are an Active Verified Seller!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Your membership is currently active under the{" "}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {activeMembership.rootCategoryName}
            </strong>{" "}
            category with <strong className="text-emerald-600">{activeMembership.remainingListings}</strong> listings remaining.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/profile" className="btn-primary text-xs px-5 py-2.5">
              View Your Profile
            </Link>
            <Link href="/listings/new" className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              Post Listing
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          Exclusive Merchant Program
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Upgrade to <span className="text-emerald-600 dark:text-emerald-400">Verified Seller</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Establish unmatched buyer credibility, unlock verified badges on all your ads, get dedicated category quotas, and receive free bonus Spotlight and Push-Up boost bundles.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto text-xs font-bold">
        {[
          { num: 1, label: "Category" },
          { num: 2, label: "Plan & Cycle" },
          { num: 3, label: "Business Info" },
          { num: 4, label: "Payment" },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${step === s.num
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
              : step > s.num
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
          >
            <span className="text-xs">{s.num}. {s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Root Category Selection */}
      {step === 1 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              Step 1: Choose Your Primary Root Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Verified Sellers specialize in a specific vertical. Once upgraded, all your verified seller listings will be published under your chosen category hierarchy.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const CatIcon = getCategoryIcon(cat.name, cat.slug);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[128px] ${isSelected
                    ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors ${isSelected
                        ? "bg-emerald-500 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                    >
                      {cat.iconUrl ? (
                        <Image
                          src={cat.iconUrl}
                          alt={cat.name}
                          width={18}
                          height={18}
                          className="w-[18px] h-[18px] object-contain"
                        />
                      ) : (
                        <CatIcon className="w-[18px] h-[18px]" />
                      )}
                    </span>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>

                  <div className="mt-3">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {cat.name}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {cat.description || "Marketplace category"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleNextToStep2}
              className="btn-primary text-xs sm:text-sm px-6 py-3 flex items-center gap-2"
            >
              <span>Continue to Plans</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Plan & Duration Selection */}
      {step === 2 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                Step 2: Select Plan &amp; Billing Cycle
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Category: <strong className="text-emerald-600 dark:text-emerald-400">{selectedCategory?.name}</strong>
              </p>
            </div>

            {/* Tier Tabs */}
            <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedTier("PRO")}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${selectedTier === "PRO"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white"
                  }`}
              >
                PRO
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier("PREMIUM")}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${selectedTier === "PREMIUM"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white"
                  }`}
              >
                PREMIUM
              </button>
            </div>
          </div>

          {plansLoading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500" />
              <p className="text-xs text-slate-500">Loading dynamic category rates…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 lg:gap-4">
              {(["MONTHLY", "QUARTERLY", "YEARLY"] as BillingCycle[]).map((cycle) => {
                const planItem = plans.find(
                  (p) => p.planTier === selectedTier && p.billingCycle === cycle
                );
                if (!planItem) return null;

                const isSelected = selectedCycle === cycle;
                const cycleLabel =
                  cycle === "MONTHLY"
                    ? "Monthly"
                    : cycle === "QUARTERLY"
                      ? "Quarterly"
                      : "Yearly";
                const cycleSub =
                  cycle === "MONTHLY"
                    ? "1 Month"
                    : cycle === "QUARTERLY"
                      ? "3 Months"
                      : "12 Months";
                const cycleUnit =
                  cycle === "MONTHLY" ? "mo" : cycle === "QUARTERLY" ? "3mo" : "yr";

                return (
                  <div
                    key={cycle}
                    onClick={() => setSelectedCycle(cycle)}
                    className={`relative rounded-2xl border p-4 lg:p-5 flex flex-col transition-all duration-200 cursor-pointer ${isSelected
                      ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-500/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                  >
                    {/* Top-right badge row — absolute so it never wraps the label */}
                    {cycle === "YEARLY" && (
                      <span className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wide">
                        Save 25%
                      </span>
                    )}

                    {/* Header: label + sub-label */}
                    <div className="pr-14">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none">
                        {cycleLabel}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-none">
                        {cycleSub}
                      </p>
                    </div>

                    {/* Price block */}
                    <div className="mt-3.5 flex items-baseline gap-1">
                      <span className="text-lg lg:text-xl font-black text-slate-900 dark:text-white tabular-nums">
                        LKR {planItem.basePrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        /{cycleUnit}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">
                          <strong className="tabular-nums">{planItem.listingLimit}</strong> Listings Quota
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Star className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          <strong className="tabular-nums">{planItem.bonusSpotlightCount}</strong> Spotlight Badges
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                        <ArrowUpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          <strong className="tabular-nums">{planItem.bonusPushUpCount}</strong> Push-Ups
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        <Flame className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                          <strong className="tabular-nums">{planItem.bonusUrgentCount}</strong> Urgent Badges
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <VerifiedSellerBadge size="xs" />
                        <span className="truncate">Verified Badge on Ads</span>
                      </div>
                    </div>

                    {/* Selection state — compact */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div
                        className={`w-full py-1.5 text-center rounded-lg text-[11px] font-bold transition ${isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                      >
                        {isSelected ? "Selected" : "Choose Plan"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleNextToStep3}
              className="btn-primary text-xs sm:text-sm px-6 py-3 flex items-center gap-2"
            >
              <span>Continue to Business Info</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Business Information Form */}
      {step === 3 && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              Step 3: Business Verification Details
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Provide your official business identity. Verified Sellers receive public store profiles with bio and opening hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Business Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                Business / Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Autos Lanka"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>

            {/* Business Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                Business Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="e.g. sales@apexautos.lk"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Business Phone Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              Designated Business Phone <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Select an existing phone number or add a new business contact (maximum 3 phone numbers per account).
            </p>

            {user?.phoneNumbers && user.phoneNumbers.length > 0 && (
              <div className="space-y-2">
                {user.phoneNumbers.map((p) => (
                  <label
                    key={p.phoneNumber}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${selectedPhone === p.phoneNumber && !isAddingNewPhone
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="businessPhone"
                      checked={selectedPhone === p.phoneNumber && !isAddingNewPhone}
                      onChange={() => {
                        setSelectedPhone(p.phoneNumber);
                        setIsAddingNewPhone(false);
                      }}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {p.phoneNumber}
                    </span>
                    {p.isPrimary && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300">
                        Primary
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}

            {(user?.phoneNumbers?.length ?? 0) < 3 && (
              <div className="pt-2">
                {!isAddingNewPhone ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewPhone(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add a New Business Phone Number
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAddingNewPhone(false)}
                      className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Store Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                Store Bio &amp; About You
              </label>
              <span className="text-[11px] text-slate-400">{bio.length}/500</span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers about your dealership, years in business, return policies, warranty guarantees..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleNextToStep4}
              className="btn-primary text-xs sm:text-sm px-6 py-3 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Review &amp; Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Payment Checkout */}
      {step === 4 && checkoutData && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              Step 4: Review &amp; Complete Upgrade
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Verify your membership order details and confirm payment via the PayHere Gateway.
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Membership Tier</p>
                <p className="text-base font-black text-slate-900 dark:text-white">
                  {checkoutData.planTier} — {checkoutData.billingCycle}
                </p>
              </div>
              <VerifiedSellerBadge size="md" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Root Category</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{checkoutData.rootCategoryName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Business Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{businessName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Order ID</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{checkoutData.orderId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Amount</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {checkoutData.currency} {checkoutData.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons & PayHere Gateway */}
          <div className="space-y-4 pt-2">
            <button
              type="button"
              disabled={paying}
              onClick={handlePayHereCheckout}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {paying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to PayHere...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay with PayHere ({checkoutData.currency} {checkoutData.amount.toLocaleString()})</span>
                </>
              )}
            </button>

            {/* Accepted Cards Display */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Accepted Payment Channels
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
                  >
                    <div className="relative overflow-hidden rounded-lg shadow-md transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl">
                      <img
                        src={src}
                        alt={alt}
                        width={56}
                        height={36}
                        className="block h-9 w-14 rounded-md object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-slate-400">
                <Lock className="w-3 h-3 inline-block align-middle mr-1 mb-0.5" />
                Official PayHere Sandbox Gateway • 256-bit SSL Encrypted Transaction
              </span>
            </div>
          </div>

          <div className="flex justify-start pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              ← Back to Business Info
            </button>
          </div>
        </div>
      )}
    </main>
  );
}