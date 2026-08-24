"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getCategories } from "@/lib/api/categories";
import { createListing, publishListing, updateListing } from "@/lib/api/listings";
import NestedCategorySelector from "@/components/listings/NestedCategorySelector";
import ListingImageUploader from "@/components/listings/ListingImageUploader";
import type { Category } from "@/types/category";
import type {
  CreateListingRequest,
  Listing,
  ListingCondition,
  ListingLocationType,
  ListingType,
  PricingType,
  UpdateListingRequest,
} from "@/types/listing";
import type { ListingImage } from "@/types/listing-image";
import {
  Layers,
  ShoppingBag,
  Wrench,
  FileText,
  DollarSign,
  Tag,
  Handshake,
  Gift,
  PhoneCall,
  AlignLeft,
  MapPin,
  Map,
  Landmark,
  Truck,
  Globe,
  SlidersHorizontal,
  Plus,
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Sparkles,
  Camera,
  Eye,
  Rocket,
  LucideIcon,
} from "lucide-react";

const CONDITION_OPTIONS: {
  value: ListingCondition;
  label: string;
  description: string;
}[] = [
  {
    value: "NEW",
    label: "Brand New",
    description: "Unopened, unused, in original packaging",
  },
  {
    value: "LIKE_NEW",
    label: "Like New",
    description: "Used once or twice, flawless appearance",
  },
  {
    value: "GOOD",
    label: "Good",
    description: "Fully functional with normal minor signs of wear",
  },
  {
    value: "FAIR",
    label: "Fair",
    description: "Working condition with visible cosmetic blemishes",
  },
  {
    value: "POOR",
    label: "Poor / For Parts",
    description: "Needs repair or sold for replacement parts",
  },
];

const PRICING_TYPE_OPTIONS: {
  value: PricingType;
  label: string;
  icon: LucideIcon;
  description: string;
}[] = [
  {
    value: "FIXED",
    label: "Fixed Price",
    icon: Tag,
    description: "Set a definite non-negotiable price",
  },
  {
    value: "NEGOTIABLE",
    label: "Negotiable",
    icon: Handshake,
    description: "Allow buyers to submit offers",
  },
  {
    value: "FREE",
    label: "Free / Giveaway",
    icon: Gift,
    description: "No payment required",
  },
  {
    value: "CONTACT_FOR_PRICE",
    label: "Contact for Price",
    icon: PhoneCall,
    description: "Price disclosed upon inquiry",
  },
];

const LOCATION_TYPE_OPTIONS: {
  value: ListingLocationType;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "CITY", label: "Specific City", icon: MapPin },
  { value: "DISTRICT", label: "District Wide", icon: Map },
  { value: "PROVINCE", label: "Province Wide", icon: Landmark },
  { value: "NATIONWIDE", label: "Islandwide Delivery", icon: Truck },
  { value: "ONLINE", label: "Online / Digital", icon: Globe },
];

export default function NewListingPage() {
  const router = useRouter();
  const { user, accessToken, loading: authLoading } = useAuth();

  // Reference data
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form State
  const [categoryId, setCategoryId] = useState("");
  const [listingType, setListingType] = useState<ListingType>("ITEM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<ListingCondition>("GOOD");
  const [quantity, setQuantity] = useState<number>(1);

  // Pricing State
  const [pricingType, setPricingType] = useState<PricingType>("FIXED");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [minimumOfferPrice, setMinimumOfferPrice] = useState("");

  // Location State
  const [locationType, setLocationType] = useState<ListingLocationType>("CITY");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Custom Attributes (Key - Value pairs)
  const [customAttributes, setCustomAttributes] = useState<
    { key: string; value: string }[]
  >([]);
  const [newAttrKey, setNewAttrKey] = useState("");
  const [newAttrValue, setNewAttrValue] = useState("");

  // Multi-step creation wizard: 1 = Item Details, 2 = Photos & Publish
  const [step, setStep] = useState<1 | 2>(1);
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Status & Validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }

    if (!user) return;

    let isMounted = true;
    getCategories()
      .then((data) => {
        if (isMounted) {
          const valid = data.filter(
            (cat) => cat.active !== false && cat.allowListings !== false
          );
          setCategories(valid.length > 0 ? valid : data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load categories."
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, router]);

  const handlePricingTypeChange = (type: PricingType) => {
    setPricingType(type);
    if (type === "NEGOTIABLE") {
      setNegotiable(true);
    } else if (type === "FREE" || type === "CONTACT_FOR_PRICE") {
      setPrice("");
      setNegotiable(false);
      setMinimumOfferPrice("");
    }
    setFieldErrors((prev) => ({ ...prev, price: "", minimumOfferPrice: "" }));
  };

  const handleAddAttribute = () => {
    if (!newAttrKey.trim() || !newAttrValue.trim()) return;
    setCustomAttributes((prev) => [
      ...prev,
      { key: newAttrKey.trim(), value: newAttrValue.trim() },
    ]);
    setNewAttrKey("");
    setNewAttrValue("");
  };

  const handleRemoveAttribute = (index: number) => {
    setCustomAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!categoryId) {
      errors.categoryId = "Please select a category.";
    }

    if (!title.trim()) {
      errors.title = "Title is required.";
    } else if (title.trim().length < 3 || title.trim().length > 150) {
      errors.title = "Title must be between 3 and 150 characters.";
    }

    if (!description.trim()) {
      errors.description = "Description is required.";
    } else if (description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
    } else if (description.trim().length > 5000) {
      errors.description = "Description cannot exceed 5000 characters.";
    }

    if (pricingType === "FIXED" || pricingType === "NEGOTIABLE") {
      const numPrice = Number(price);
      if (price === "" || isNaN(numPrice)) {
        errors.price = "Price is required for this pricing type.";
      } else if (numPrice < 0) {
        errors.price = "Price cannot be negative.";
      }

      if (negotiable && minimumOfferPrice !== "") {
        const numMinOffer = Number(minimumOfferPrice);
        if (isNaN(numMinOffer) || numMinOffer < 0) {
          errors.minimumOfferPrice = "Minimum offer price cannot be negative.";
        } else if (numMinOffer > numPrice) {
          errors.minimumOfferPrice =
            "Minimum offer price cannot exceed listing price.";
        }
      }
    }

    if (quantity < 1) {
      errors.quantity = "Quantity must be at least 1.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!accessToken) {
      setError("You must be logged in to create a listing.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const customAttributesMap: Record<string, unknown> = {};
    customAttributes.forEach((attr) => {
      customAttributesMap[attr.key] = attr.value;
    });

    const parsedPrice =
      pricingType === "FREE" || pricingType === "CONTACT_FOR_PRICE"
        ? 0
        : Number(price) || 0;

    const payload: CreateListingRequest = {
      categoryId,
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      pricingType,
      listingType,
      negotiable:
        pricingType === "NEGOTIABLE"
          ? true
          : pricingType === "FIXED"
          ? negotiable
          : false,
      minimumOfferPrice:
        negotiable && minimumOfferPrice !== ""
          ? Number(minimumOfferPrice)
          : undefined,
      condition,
      quantity: Number(quantity) || 1,
      locationType,
      city: city.trim() || undefined,
      district: district.trim() || undefined,
      province: province.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      customAttributes:
        Object.keys(customAttributesMap).length > 0
          ? customAttributesMap
          : undefined,
    };

    try {
      if (createdListing) {
        const updated = await updateListing(accessToken, createdListing.id, payload as UpdateListingRequest);
        setCreatedListing(updated);
      } else {
        const created = await createListing(accessToken, payload);
        setCreatedListing(created);
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save listing. Please check your inputs and try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!accessToken || !createdListing) return;

    setPublishing(true);
    setError(null);

    try {
      const updated = await publishListing(accessToken, createdListing.id);
      setCreatedListing(updated);
      setPublishSuccess(true);
      setTimeout(() => {
        router.push(`/listings/${createdListing.id}`);
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish listing. Make sure at least one image is uploaded."
      );
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading || (!user && !error)) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Preparing listing form...
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Breadcrumb */}
      <div className="space-y-3">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link
            href="/profile"
            className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            Create Listing
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create a New Listing
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {step === 1
                ? "Step 1 of 2: Fill in item details, pricing & specifications"
                : "Step 2 of 2: Upload item photos & set cover image"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>{step === 1 ? "Photos added in step 2" : "Auto-saved as draft"}</span>
          </div>
        </div>
      </div>

      {/* 2-Step Interactive Progress Stepper */}
      <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold select-none">
        <button
          type="button"
          onClick={() => {
            if (createdListing) setStep(1);
          }}
          disabled={step === 1}
          className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl transition-all ${
            step === 1
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              createdListing && step === 2
                ? "bg-emerald-500 text-white"
                : step === 1
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}
          >
            {createdListing && step === 2 ? <Check className="w-3 h-3" /> : "1"}
          </span>
          <span>1. Item Details &amp; Pricing</span>
        </button>

        <button
          type="button"
          disabled={!createdListing}
          onClick={() => {
            if (createdListing) setStep(2);
          }}
          className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl transition-all ${
            step === 2
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20"
              : createdListing
              ? "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              : "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 2
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}
          >
            2
          </span>
          <span>2. Photos &amp; Publish</span>
        </button>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {publishSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>Listing published successfully! Redirecting to public listing...</span>
        </div>
      )}

      {/* STEP 1: ITEM DETAILS FORM */}
      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Section 1: Classification (Type & Category) */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                1. Classification &amp; Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Specify what type of offering you are listing
              </p>
            </div>
          </div>

          {/* Listing Type: Item vs Service */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Offering Type *
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setListingType("ITEM")}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  listingType === "ITEM"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Physical Item</span>
              </button>

              <button
                type="button"
                onClick={() => setListingType("SERVICE")}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  listingType === "SERVICE"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Service / Skill</span>
              </button>
            </div>
          </div>

          {/* Nested Cascading Category Selector */}
          <NestedCategorySelector
            categories={categories}
            selectedCategoryId={categoryId}
            onSelect={(id) => {
              setCategoryId(id);
              setFieldErrors((prev) => ({ ...prev, categoryId: "" }));
            }}
            error={fieldErrors.categoryId}
            disabled={loadingCategories}
          />
        </section>

        {/* Section 2: Basic Information */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. General Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide an attractive title and honest condition summary
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="listingTitle"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Listing Title *
              </label>
              <span
                className={`text-xs ${
                  title.length > 150
                    ? "text-rose-500 font-bold"
                    : "text-slate-400"
                }`}
              >
                {title.length}/150
              </span>
            </div>
            <input
              id="listingTitle"
              type="text"
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones (Midnight Blue)"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              maxLength={150}
              className={`input-field ${
                fieldErrors.title ? "border-rose-500" : ""
              }`}
              required
            />
            {fieldErrors.title && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Condition Selector (Segmented Radio) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Item Condition *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CONDITION_OPTIONS.map((opt) => {
                const isSelected = condition === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setCondition(opt.value)}
                    className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500/30"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{opt.label}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="max-w-xs space-y-1.5">
            <label
              htmlFor="quantityInput"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              Quantity Available *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-base font-bold transition-colors select-none"
              >
                -
              </button>
              <input
                id="quantityInput"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1));
                  setFieldErrors((prev) => ({ ...prev, quantity: "" }));
                }}
                className={`input-field text-center font-bold ${
                  fieldErrors.quantity ? "border-rose-500" : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-base font-bold transition-colors select-none"
              >
                +
              </button>
            </div>
            {fieldErrors.quantity && (
              <p className="text-xs text-rose-500 mt-1">
                {fieldErrors.quantity}
              </p>
            )}
          </div>
        </section>

        {/* Section 3: Pricing & Offers */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Pricing &amp; Negotiation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how you want to price this item
              </p>
            </div>
          </div>

          {/* Pricing Type Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {PRICING_TYPE_OPTIONS.map((opt) => {
              const isSelected = pricingType === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => handlePricingTypeChange(opt.value)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500/30"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div>
                    <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center mb-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      <Icon className="w-4 h-4" />
                    </span>
                    <h3 className="font-semibold text-sm">{opt.label}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Conditional Price Input */}
          {(pricingType === "FIXED" || pricingType === "NEGOTIABLE") && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Asking Price */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="listingPrice"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Price (LKR) *
                  </label>
                  <div className={`flex items-center rounded-xl border bg-white dark:bg-slate-900 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 ${fieldErrors.price ? "border-rose-500" : "border-slate-200 dark:border-slate-800"}`}>
                    <span className="px-3.5 text-sm font-bold text-slate-500 dark:text-slate-400 select-none border-r border-slate-200 dark:border-slate-800 h-full flex items-center py-3 shrink-0">
                      Rs.
                    </span>
                    <input
                      id="listingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, price: "" }));
                      }}
                      className="flex-1 bg-transparent outline-none border-none px-3.5 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 min-w-0"
                      required
                    />
                  </div>
                  {fieldErrors.price && (
                    <p className="text-xs text-rose-500 mt-1">
                      {fieldErrors.price}
                    </p>
                  )}
                </div>

                {/* Minimum Offer Price (if negotiable) */}
                {negotiable && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label
                      htmlFor="minOfferPrice"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between"
                    >
                      <span>Minimum Acceptable Offer</span>
                      <span className="text-xs font-normal text-slate-400 normal-case">
                        (Optional)
                      </span>
                    </label>
                    <div className={`flex items-center rounded-xl border bg-white dark:bg-slate-900 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 ${fieldErrors.minimumOfferPrice ? "border-rose-500" : "border-slate-200 dark:border-slate-800"}`}>
                      <span className="px-3.5 text-sm font-bold text-slate-500 dark:text-slate-400 select-none border-r border-slate-200 dark:border-slate-800 h-full flex items-center py-3 shrink-0">
                        Rs.
                      </span>
                      <input
                        id="minOfferPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 5000.00"
                        value={minimumOfferPrice}
                        onChange={(e) => {
                          setMinimumOfferPrice(e.target.value);
                          setFieldErrors((prev) => ({
                            ...prev,
                            minimumOfferPrice: "",
                          }));
                        }}
                        className="flex-1 bg-transparent outline-none border-none px-3.5 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 min-w-0"
                      />
                    </div>
                    {fieldErrors.minimumOfferPrice ? (
                      <p className="text-xs text-rose-500 mt-1">
                        {fieldErrors.minimumOfferPrice}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Offers below this amount can be auto-declined
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Negotiable Toggle (Only visible if FIXED pricing type) */}
              {pricingType === "FIXED" && (
                <div className="pt-2">
                  <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={negotiable}
                      onChange={(e) => setNegotiable(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        Allow price negotiations &amp; counter-offers
                      </span>
                      <p className="text-xs text-slate-400">
                        Interested buyers will be able to send custom offer
                        proposals
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section 4: Description */}
        <section className="glass-panel p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <AlignLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                4. Description
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed description of features, specifications, and history
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="listingDesc"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
              >
                Detailed Description *
              </label>
              <span
                className={`text-xs ${
                  description.length > 5000
                    ? "text-rose-500 font-bold"
                    : "text-slate-400"
                }`}
              >
                {description.length}/5000
              </span>
            </div>
            <textarea
              id="listingDesc"
              rows={6}
              placeholder="Describe what you are selling in detail:&#10;• Key specifications, dimensions, or inclusions (boxes, cables)&#10;• How long it has been used and its cosmetic/functional state&#10;• Reason for selling or warranty coverage"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFieldErrors((prev) => ({ ...prev, description: "" }));
              }}
              maxLength={5000}
              className={`input-field resize-y font-normal leading-relaxed ${
                fieldErrors.description ? "border-rose-500" : ""
              }`}
              required
            />
            {fieldErrors.description && (
              <p className="text-xs text-rose-500 mt-1">
                {fieldErrors.description}
              </p>
            )}
          </div>
        </section>

        {/* Section 5: Location & Availability */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5. Location &amp; Scope
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Where is this item located or available for pickup/delivery?
              </p>
            </div>
          </div>

          {/* Location Scope Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Location Scope
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {LOCATION_TYPE_OPTIONS.map((loc) => {
                const isSelected = locationType === loc.value;
                const Icon = loc.icon;
                return (
                  <button
                    type="button"
                    key={loc.value}
                    onClick={() => setLocationType(loc.value)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{loc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Location Fields */}
          {locationType !== "ONLINE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="cityInput"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  City / Town
                </label>
                <input
                  id="cityInput"
                  type="text"
                  placeholder="e.g. Colombo 03"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={100}
                  className="input-field"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="districtInput"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  District
                </label>
                <input
                  id="districtInput"
                  type="text"
                  placeholder="e.g. Colombo"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  maxLength={100}
                  className="input-field"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="provinceInput"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Province
                </label>
                <input
                  id="provinceInput"
                  type="text"
                  placeholder="e.g. Western Province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  maxLength={100}
                  className="input-field"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="postalCodeInput"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Postal Code
                </label>
                <input
                  id="postalCodeInput"
                  type="text"
                  placeholder="e.g. 00300"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  maxLength={20}
                  className="input-field"
                />
              </div>
            </div>
          )}
        </section>

        {/* Section 6: Additional Specifications / Custom Attributes (Optional) */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                6. Custom Specifications &amp; Key Highlights
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optional: Add key-value attributes (e.g. Brand, Model, Color,
                Warranty)
              </p>
            </div>
          </div>

          {/* Existing Attributes List */}
          {customAttributes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customAttributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-sm"
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {attr.key}:
                    </span>{" "}
                    <span className="text-slate-600 dark:text-slate-400">
                      {attr.value}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(idx)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    title="Remove specification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Attribute Inputs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              placeholder="Attribute (e.g. Brand, Color, Year)"
              value={newAttrKey}
              onChange={(e) => setNewAttrKey(e.target.value)}
              className="input-field sm:w-1/3"
            />
            <input
              type="text"
              placeholder="Value (e.g. Sony, Matte Black, 2024)"
              value={newAttrValue}
              onChange={(e) => setNewAttrValue(e.target.value)}
              className="input-field sm:w-1/2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddAttribute();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddAttribute}
              disabled={!newAttrKey.trim() || !newAttrValue.trim()}
              className="btn-outline px-4 py-2.5 text-xs font-semibold whitespace-nowrap self-stretch sm:self-auto disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Spec</span>
            </button>
          </div>
        </section>

        {/* Submit Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/profile"
            className="btn-outline w-full sm:w-auto text-center text-sm py-3 px-6"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full sm:w-auto text-sm py-3.5 px-8 font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{createdListing ? "Updating Details..." : "Saving Draft..."}</span>
              </>
            ) : (
              <>
                <span>{createdListing ? "Update & Go to Photos" : "Save Draft & Continue to Photos"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
      )}

      {/* STEP 2: PHOTOS & PUBLISH VIEW */}
      {step === 2 && createdListing && (
        <div className="space-y-8 animate-fadeIn">
          {/* Draft Item Summary Card */}
          <div className="glass-panel p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-500/20 bg-emerald-500/[0.03]">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="badge-emerald">Draft Created</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {createdListing.categoryName || "Selected Category"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                {createdListing.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {createdListing.pricingType === "FREE"
                  ? "Free"
                  : createdListing.pricingType === "CONTACT_FOR_PRICE"
                  ? "Contact for price"
                  : `Rs. ${Number(createdListing.price).toLocaleString()}`}
                {createdListing.negotiable ? " (Negotiable)" : ""} • {createdListing.condition}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Item Details</span>
            </button>
          </div>

          {/* Photos Management Section */}
          <section className="glass-panel p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
              <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Item Photos
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload up to 10 photos. Set your best shot as the primary cover photo.
                </p>
              </div>
            </div>

            <ListingImageUploader
              listingId={createdListing.id}
              initialImages={createdListing.images || []}
              onChange={(updatedImages) => {
                setCreatedListing((prev) =>
                  prev ? { ...prev, images: updatedImages } : null
                );
              }}
            />
          </section>

          {/* Bottom Publishing Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/profile"
              className="btn-outline w-full sm:w-auto text-center text-sm py-3 px-6"
            >
              Save as Draft &amp; Exit
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href={`/listings/${createdListing.id}`}
                className="btn-outline w-full sm:w-auto text-center text-sm py-3 px-5 flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </Link>

              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="btn-primary w-full sm:w-auto text-sm py-3 px-8 font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {publishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Publish Listing Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}