"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ChevronRight,
  Plug2,
  BriefcaseBusiness,
  Grid,
  Leaf,
} from "lucide-react";
import { getRootCategories } from "@/lib/api/categories";
import type { Category } from "@/types/category";

function getCategoryIcon(slug: string, name: string) {
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getRootCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data ?? []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Grid className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore verified items and services organized for easy discovery
            </p>
          </div>
        </div>

        <Link
          href="/listings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          <span>All Listings</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Category Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/50 dark:border-slate-800/50"
            />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug, cat.name);
            return (
              <Link
                key={cat.id}
                href={`/listings?category=${encodeURIComponent(cat.slug)}`}
                className="btn-outline group relative flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg- hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500/10 text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center transition-colors mb-2.5">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          No categories available.
        </div>
      )}
    </section>
  );
}
