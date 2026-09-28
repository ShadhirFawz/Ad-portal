"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Car,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Trophy,
  BookOpen,
  Wrench,
  Building2,
  Briefcase,
  Dog,
  Sparkles,
  Apple,
  Plug2,
  BriefcaseBusiness,
  Leaf,
  ChevronDown,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { getRootCategories } from "@/lib/api/categories";
import { getListings } from "@/lib/api/listings";
import type { Category } from "@/types/category";
import type { Listing } from "@/types/listing";
import DashboardListingCard from "./DashboardListingCard";

function getCategoryIcon(slug: string, name: string): LucideIcon {
  const key = `${slug} ${name}`.toLowerCase();
  if (key.includes("vehic") || key.includes("car") || key.includes("motor") || key.includes("bike")) return Car;
  if (key.includes("elect") || key.includes("phone") || key.includes("comput") || key.includes("laptop") || key.includes("gadget")) return Plug2;
  if (key.includes("fash") || key.includes("cloth") || key.includes("wear") || key.includes("shoe") || key.includes("bag")) return Shirt;
  if (key.includes("home") || key.includes("furnit") || key.includes("garden") || key.includes("appliance")) return HomeIcon;
  if (key.includes("sport") || key.includes("hobb") || key.includes("fit") || key.includes("game")) return Trophy;
  if (key.includes("book") || key.includes("media") || key.includes("music") || key.includes("educa")) return BookOpen;
  if (key.includes("serv") || key.includes("repair") || key.includes("skill")) return Wrench;
  if (key.includes("prop") || key.includes("estate") || key.includes("land") || key.includes("house")) return Building2;
  if (key.includes("job") || key.includes("work") || key.includes("career")) return Briefcase;
  if (key.includes("pet") || key.includes("animal")) return Dog;
  if (key.includes("mob")) return Smartphone;
  if (key.includes("agri")) return Leaf;
  if (key.includes("food") || key.includes("grocery")) return Apple;
  if (key.includes("health") || key.includes("beauty") || key.includes("toy") || key.includes("kid")) return Sparkles;
  if (key.includes("pack")) return Package;
  if (key.includes("business") || key.includes("industry")) return BriefcaseBusiness;
  return Package;
}

export default function CategorySection() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // 1. Fetch Categories
  useEffect(() => {
    let isMounted = true;
    getRootCategories()
      .then((data) => {
        if (isMounted) {
          const cats = data ?? [];
          setCategories(cats);
          if (cats.length > 0) {
            setActiveCategoryId(cats[0].id);
          }
          setCategoriesLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        if (isMounted) setCategoriesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeIndex = useMemo(() => {
    const idx = categories.findIndex((c) => c.id === activeCategoryId);
    return idx >= 0 ? idx : 0;
  }, [categories, activeCategoryId]);

  const activeCat = useMemo(() => {
    return categories.find((c) => c.id === activeCategoryId) || categories[0] || null;
  }, [categories, activeCategoryId]);

  // 2. Fetch Listings when active category changes
  useEffect(() => {
    if (!activeCat) return;

    let isMounted = true;
    setListingsLoading(true);

    getListings({
      category: activeCat.slug,
      page: 0,
      size: 8,
      status: "ACTIVE",
      sortBy: "createdAt,desc",
    })
      .then((res) => {
        if (isMounted) {
          setListings(res?.content ?? []);
          setListingsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load category listings:", err);
        if (isMounted) {
          setListings([]);
          setListingsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeCat]);

  // 3. Two-Way Circular Scroller Ordering
  const orderedCategories = useMemo(() => {
    const total = categories.length;
    if (total === 0) return [];

    const leftCount = Math.floor((total - 1) / 2);
    const rightCount = total - 1 - leftCount;

    return Array.from({ length: total }, (_, i) => {
      const offset = i - leftCount;
      const index = (activeIndex + offset + total) % total;
      return { category: categories[index], offset };
    }).slice(0, leftCount + rightCount + 1);
  }, [categories, activeIndex]);

  // 4. Smooth Centering
  const centerCategory = useCallback(
    (categoryId: string, behavior: ScrollBehavior = "smooth") => {
      const scroller = scrollerRef.current;
      const button = buttonRefs.current[categoryId];
      if (!scroller || !button) return;

      const scrollerRect = scroller.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const left =
        scroller.scrollLeft +
        (buttonRect.left - scrollerRect.left) -
        (scrollerRect.width / 2 - buttonRect.width / 2);

      scroller.scrollTo({ left, behavior });
    },
    []
  );

  useEffect(() => {
    if (activeCategoryId) {
      centerCategory(activeCategoryId, "smooth");
    }
  }, [activeCategoryId, orderedCategories, centerCategory]);

  useEffect(() => {
    if (activeCategoryId) {
      requestAnimationFrame(() => {
        centerCategory(activeCategoryId, "auto");
      });
    }
  }, [categories, activeCategoryId, centerCategory]);

  const getDistanceFadeClass = (distance: number) => {
    if (distance === 0) return "opacity-100";
    if (distance === 1) return "opacity-90";
    if (distance === 2) return "opacity-75";
    return "opacity-55";
  };

  const handleViewMore = () => {
    if (activeCat) {
      router.push(`/listings?category=${encodeURIComponent(activeCat.slug)}`);
    } else {
      router.push("/listings");
    }
  };

  if (categoriesLoading) {
    return (
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Browse the marketplace
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Shop by Category
          </h2>
        </div>
        <div className="h-16 rounded-full bg-slate-100 dark:bg-slate-800/60 animate-pulse max-w-4xl mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Shop by Category
        </h2>
      </div>

      {/* 2-Way Sliding Circular Category Scroller */}
      <div className="relative mx-auto max-w-5xl">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-10 sm:w-18 rounded-l-full bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-10 sm:w-18 rounded-r-full bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent" />

        <div
          ref={scrollerRef}
          className="overflow-x-auto rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-3 py-2.5 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-sm"
        >
          <div className="flex w-max min-w-full items-center justify-center gap-1.5 sm:gap-2.5">
            {orderedCategories.map(({ category: c, offset }) => {
              const isActive = c.id === activeCategoryId;
              const distance = Math.abs(offset);
              const Icon = getCategoryIcon(c.slug, c.name);

              return (
                <button
                  key={c.id}
                  ref={(el) => {
                    buttonRefs.current[c.id] = el;
                  }}
                  type="button"
                  onClick={() => {
                    setActiveCategoryId(c.id);
                    centerCategory(c.id, "smooth");
                  }}
                  className={`group inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 sm:px-4 h-11 sm:h-12 transition-all duration-300 cursor-pointer ${isActive
                    ? "scale-105 border-slate-400 dark:border-slate-800 bg-slate-200 dark:bg-slate-100 text-slate-800 dark:text-slate-800 shadow-md shadow-slate-500/25 dark:shadow-slate-500/25"
                    : `border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 ${getDistanceFadeClass(
                      distance
                    )}`
                    }`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${isActive
                      ? "bg-slate-300 text-slate-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                      }`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description Divider Rule */}
      {activeCat && (
        <div className="relative text-center my-6">
          <div
            className="absolute inset-x-0 top-1/2 h-px bg-slate-200/80 dark:border-slate-800/80"
            aria-hidden
          />
          <span className="relative inline-block px-4 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic font-medium">
            {activeCat.description || `Explore fresh deals and listings in ${activeCat.name}`}
          </span>
        </div>
      )}

      {/* Listings Grid (2x2 on mobile, 4 columns on large screens) */}
      {listingsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200/50 dark:border-slate-800/50"
            />
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {listings.slice(0, 4).map((listing) => (
            <DashboardListingCard
              key={listing.id}
              listing={listing}
              layout="grid"
            />
          ))}
        </div>
      ) : (
        <div className="p-10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-center space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No active listings found in {activeCat?.name || "this category"}.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Be the first seller to post an item in this category.
          </p>
          <Link
            href="/listings/new"
            className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 rounded-xl shadow-sm"
          >
            <span>Post an Ad in {activeCat?.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Center "View more" Button */}
      {activeCat && listings.length > 0 && (
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={handleViewMore}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span>View more in {activeCat.name}</span>
            <ArrowRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </section>
  );
}
