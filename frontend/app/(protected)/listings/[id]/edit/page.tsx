"use client";

import { FormEvent, useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { getCategories } from "@/lib/api/categories";
import { getListing, publishListing, updateListing } from "@/lib/api/listings";
import NestedCategorySelector from "@/components/listings/NestedCategorySelector";
import ListingImageUploader from "@/components/listings/ListingImageUploader";
import type { Category } from "@/types/category";
import type {
  Listing,
  ListingCondition,
  ListingLocationType,
  ListingType,
  PricingType,
  UpdateListingRequest,
} from "@/types/listing";
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
  CheckCircle2,
  Camera,
  Eye,
  Rocket,
  Save,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

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
      description: "Minor cosmetic wear, fully functional",
    },
    {
      value: "FAIR",
      label: "Fair",
      description: "Noticeable wear, functional with minor flaws",
    },
    {
      value: "POOR",
      label: "For Parts / Repair",
      description: "Non-functional or heavy defect",
    },
    {
      value: "REFURBISHED",
      label: "Refurbished",
      description: "Professionally restored and tested to full working order",
    },
    {
      value: "NOT_APPLICABLE",
      label: "Not Applicable",
      description: "For services, digital goods, or non-physical items",
    },
  ];

const PRICING_TYPE_OPTIONS: {
  value: PricingType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
    {
      value: "FIXED",
      label: "Fixed Price",
      description: "Set a firm price for immediate sale",
      icon: Tag,
    },
    {
      value: "NEGOTIABLE",
      label: "Negotiable",
      description: "Open to reasonable buyer offers",
      icon: Handshake,
    },
    {
      value: "FREE",
      label: "Free / Give Away",
      description: "No charge (item donation or free service)",
      icon: Gift,
    },
    {
      value: "CONTACT_FOR_PRICE",
      label: "Contact For Price",
      description: "Custom quotes or high-value consultation",
      icon: PhoneCall,
    },
  ];

const LOCATION_TYPES: {
  value: ListingLocationType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
    {
      value: "CITY",
      label: "Specific City",
      description: "Local neighborhood pickup or direct deal",
      icon: MapPin,
    },
    {
      value: "DISTRICT",
      label: "District-Wide",
      description: "Available across your district",
      icon: Map,
    },
    {
      value: "PROVINCE",
      label: "Province-Wide",
      description: "Regional availability within province",
      icon: Landmark,
    },
    {
      value: "NATIONWIDE",
      label: "Island-Wide Delivery",
      description: "Ships or delivered across Sri Lanka",
      icon: Truck,
    },
    {
      value: "ONLINE",
      label: "Digital / Remote",
      description: "No physical location required",
      icon: Globe,
    },
  ];

export default function EditListingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;

  const router = useRouter();
  const { user, accessToken, loading: authLoading } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [fetching, setFetching] = useState(true);

  // Form State
  const [listingType, setListingType] = useState<ListingType>("ITEM");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState<ListingCondition>("LIKE_NEW");
  const [quantity, setQuantity] = useState<number>(1);
  const [pricingType, setPricingType] = useState<PricingType>("FIXED");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [minimumOfferPrice, setMinimumOfferPrice] = useState("");
  const [description, setDescription] = useState("");
  const [locationType, setLocationType] = useState<ListingLocationType>("CITY");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [customAttributes, setCustomAttributes] = useState<
    { key: string; value: string }[]
  >([]);
  const [newAttrKey, setNewAttrKey] = useState("");
  const [newAttrValue, setNewAttrValue] = useState("");

  // Actions & Validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load Categories & Listing Data
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }

    if (!listingId || !user) return;
    if (listing) return;

    let isMounted = true;

    async function loadInitialData() {
      try {
        setFetching(true);
        setError(null);

        const [listingData, categoriesData] = await Promise.all([
          getListing(listingId),
          getCategories(),
        ]);

        if (isMounted) {
          setListing(listingData);
          setCategories(categoriesData);

          // Populate form fields
          setListingType(listingData.listingType || "ITEM");
          setCategoryId(listingData.categoryId || "");
          setTitle(listingData.title || "");
          setCondition(listingData.condition || "LIKE_NEW");
          setQuantity(listingData.quantity || 1);
          setPricingType(listingData.pricingType || "FIXED");
          setPrice(
            listingData.price !== undefined && listingData.price !== null
              ? String(listingData.price)
              : ""
          );
          setNegotiable(listingData.negotiable ?? false);
          setMinimumOfferPrice(
            listingData.minimumOfferPrice !== undefined &&
              listingData.minimumOfferPrice !== null
              ? String(listingData.minimumOfferPrice)
              : ""
          );
          setDescription(listingData.description || "");
          setLocationType(listingData.locationType || "CITY");
          setCity(listingData.city || "");
          setDistrict(listingData.district || "");
          setProvince(listingData.province || "");
          setPostalCode(listingData.postalCode || "");

          if (listingData.customAttributes) {
            const attrArray = Object.entries(listingData.customAttributes).map(
              ([k, v]) => ({
                key: k,
                value: String(v),
              })
            );
            setCustomAttributes(attrArray);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load listing."
          );
        }
      } finally {
        if (isMounted) {
          setFetching(false);
          setLoadingCategories(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [listingId, user, authLoading, router]);

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

    if (!accessToken || !listing) {
      setError("You must be logged in to edit this listing.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const customAttributesMap: Record<string, unknown> = {};
    customAttributes.forEach((attr) => {
      customAttributesMap[attr.key] = attr.value;
    });

    const parsedPrice =
      pricingType === "FREE" || pricingType === "CONTACT_FOR_PRICE"
        ? 0
        : Number(price) || 0;

    const payload: UpdateListingRequest = {
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
      const updated = await updateListing(accessToken, listing.id, payload);
      setListing(updated);
      setSuccessMessage("Listing details updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push(`/listings/${updated.slug || listing.slug || listing.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update listing."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!accessToken || !listing) return;

    setPublishing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const updated = await publishListing(accessToken, listing.id);
      setListing(updated);
      setSuccessMessage("Listing published successfully!");
      setTimeout(() => {
        router.push(`/listings/${updated.slug || listing.slug || listing.id}`);
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish listing. Ensure at least one image is uploaded."
      );
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading || fetching) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-24 flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Loading listing editor...
          </p>
        </div>
      </main>
    );
  }

  if (error && !listing) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <h2 className="font-bold text-lg mb-2">Error Loading Listing</h2>
          <p className="text-sm">{error}</p>
          <div className="mt-4">
            <Link
              href="/profile"
              className="text-sm font-semibold underline hover:no-underline"
            >
              Back to My Profile
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!listing) return null;

  const isDraft = listing.status === "DRAFT";

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Status Bar */}
      <div className="space-y-3">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link
            href="/profile"
            className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <Link
            href={`/listings/${listing.slug || listing.id}`}
            className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors truncate max-w-50"
          >
            {listing.title}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-semibold">
            Edit Listing
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Edit Listing
              </h1>
              <span
                className={`
                  px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                  ${isDraft
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                    : listing.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }
                `}
              >
                {listing.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ID: {listing.id} • Created {new Date(listing.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/listings/${listing.slug || listing.id}`}
              className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>

            {isDraft && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="btn-primary text-xs px-5 py-2 font-semibold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                {publishing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
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

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SECTION 1: PHOTOS MANAGEMENT */}
      <section className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
          <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. Item Photos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload, reorder or delete photos. The cover photo is displayed across search results.
            </p>
          </div>
        </div>

        <ListingImageUploader
          listingId={listing.id}
          initialImages={listing.images || []}
          onChange={(updatedImages) => {
            setListing((prev) => (prev ? { ...prev, images: updatedImages } : null));
          }}
        />
      </section>

      {/* MAIN EDIT FORM */}
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Section 2: Classification */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. Classification &amp; Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update the category or offering type
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Offering Type *
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setListingType("ITEM")}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${listingType === "ITEM"
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
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${listingType === "SERVICE"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
              >
                <Wrench className="w-4 h-4" />
                <span>Service / Skill</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category *
            </label>
            {loadingCategories ? (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse text-xs text-slate-400">
                Loading categories...
              </div>
            ) : (
              <NestedCategorySelector
                categories={categories}
                selectedCategoryId={categoryId}
                onSelect={(id: string) => {
                  setCategoryId(id);
                  setFieldErrors((prev) => ({ ...prev, categoryId: "" }));
                }}
              />
            )}
            {fieldErrors.categoryId && (
              <p className="text-xs text-rose-500 mt-1">
                {fieldErrors.categoryId}
              </p>
            )}
          </div>
        </section>

        {/* Section 3: General Details */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Title &amp; Condition
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Basic details describing what you are offering
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="editListingTitle"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
            >
              Listing Title *
            </label>
            <input
              id="editListingTitle"
              type="text"
              placeholder="e.g. Sony WH-1000XM5 Wireless Headphones - Midnight Blue"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={`input-field font-medium ${fieldErrors.title ? "border-rose-500" : ""
                }`}
              required
            />
            {fieldErrors.title && (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {listingType === "ITEM" && (
            <div className="space-y-3">
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
                      className={`p-3.5 rounded-xl border text-left transition-all ${isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500/30"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                    >
                      <div className="font-semibold text-sm">{opt.label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {opt.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="max-w-xs space-y-1.5">
            <label
              htmlFor="editQuantityInput"
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
                id="editQuantityInput"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1));
                  setFieldErrors((prev) => ({ ...prev, quantity: "" }));
                }}
                className={`input-field text-center font-bold ${fieldErrors.quantity ? "border-rose-500" : ""
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

        {/* Section 4: Pricing & Negotiation */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                4. Pricing &amp; Negotiation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how you want to price this item
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {PRICING_TYPE_OPTIONS.map((opt) => {
              const isSelected = pricingType === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => handlePricingTypeChange(opt.value)}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${isSelected
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

          {(pricingType === "FIXED" || pricingType === "NEGOTIABLE") && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Asking Price */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="editListingPrice"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Price (LKR) *
                  </label>
                  <div
                    className={`flex items-center rounded-xl border bg-white dark:bg-slate-900 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 ${fieldErrors.price
                      ? "border-rose-500"
                      : "border-slate-200 dark:border-slate-800"
                      }`}
                  >
                    <span className="px-3.5 text-sm font-bold text-slate-500 dark:text-slate-400 select-none border-r border-slate-200 dark:border-slate-800 h-full flex items-center py-3 shrink-0">
                      Rs.
                    </span>
                    <input
                      id="editListingPrice"
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

                {/* Minimum Offer Price */}
                {negotiable && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label
                      htmlFor="editMinOfferPrice"
                      className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between"
                    >
                      <span>Minimum Acceptable Offer</span>
                      <span className="text-xs font-normal text-slate-400 normal-case">
                        (Optional)
                      </span>
                    </label>
                    <div
                      className={`flex items-center rounded-xl border bg-white dark:bg-slate-900 transition-colors focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 ${fieldErrors.minimumOfferPrice
                        ? "border-rose-500"
                        : "border-slate-200 dark:border-slate-800"
                        }`}
                    >
                      <span className="px-3.5 text-sm font-bold text-slate-500 dark:text-slate-400 select-none border-r border-slate-200 dark:border-slate-800 h-full flex items-center py-3 shrink-0">
                        Rs.
                      </span>
                      <input
                        id="editMinOfferPrice"
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
                    {fieldErrors.minimumOfferPrice && (
                      <p className="text-xs text-rose-500 mt-1">
                        {fieldErrors.minimumOfferPrice}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Section 5: Location Details */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5. Location &amp; Delivery Scope
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Where is this item available or shipped from?
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Location Availability Scope *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {LOCATION_TYPES.map((loc) => {
                const isSelected = locationType === loc.value;
                const Icon = loc.icon;
                return (
                  <button
                    type="button"
                    key={loc.value}
                    onClick={() => setLocationType(loc.value)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-emerald-500/30"
                      : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                  >
                    <div>
                      <Icon className="w-4 h-4 mb-2 text-slate-600 dark:text-slate-400" />
                      <div className="font-semibold text-xs">{loc.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {locationType !== "ONLINE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  City / Town
                </label>
                <input
                  type="text"
                  placeholder="e.g. Colombo 03"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Colombo"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Province
                </label>
                <input
                  type="text"
                  placeholder="e.g. Western"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 00300"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}
        </section>

        {/* Section 6: Description */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <AlignLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                6. Detailed Description
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed condition, features, warranty, reason for selling
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <textarea
              rows={6}
              placeholder="Describe your item in detail..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setFieldErrors((prev) => ({ ...prev, description: "" }));
              }}
              className={`input-field font-normal leading-relaxed ${fieldErrors.description ? "border-rose-500" : ""
                }`}
              required
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{description.length} / 5000 characters</span>
              {fieldErrors.description && (
                <span className="text-rose-500">{fieldErrors.description}</span>
              )}
            </div>
          </div>
        </section>

        {/* Section 7: Specifications */}
        <section className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                7. Specifications &amp; Key Features
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add key-value specs (e.g. Storage: 256GB, Color: Space Grey)
              </p>
            </div>
          </div>

          {customAttributes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {customAttributes.map((attr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                >
                  <div className="truncate">
                    <span className="font-bold text-slate-500 dark:text-slate-400 mr-2">
                      {attr.key}:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {attr.value}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(index)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

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

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link
            href={`/listings/${listing.slug || listing.id}`}
            className="btn-outline w-full sm:w-auto text-center text-sm py-3 px-6"
          >
            Cancel
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full sm:w-auto text-sm py-3.5 px-8 font-semibold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
