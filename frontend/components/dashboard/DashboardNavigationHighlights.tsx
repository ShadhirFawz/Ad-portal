"use client";

import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Gavel,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function DashboardNavigationHighlights() {
  const highlights = [
    {
      icon: TrendingUp,
      badge: "Promotions",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      title: "Boost Listing Reach",
      description: "Get 5x more views with Spotlight, Urgent ribbons, and Power Pack visibility packages.",
      href: "/promotions",
      cta: "Explore Boosts",
    },
    {
      icon: Clock,
      badge: "Storefront",
      badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      title: "Seller Business Hours",
      description: "Set opening hours and contact numbers on your profile so buyers know when you are open.",
      href: "/profile/edit",
      cta: "Configure Profile",
    },
    {
      icon: Gavel,
      badge: "Auctions",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      title: "Live Bidding & Deals",
      description: "Place live bids on auction items or negotiate directly with sellers using minimum offer limits.",
      href: "/listings",
      cta: "Browse Auctions",
    },
    {
      icon: Receipt,
      badge: "Invoices",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      title: "Digital PDF Receipts",
      description: "Access and export printable official PDF receipts for all promotion transactions.",
      href: "/subscriptions",
      cta: "View History",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Platform Highlights &amp; Features
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powerful tools designed to make buying and selling effortless
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group relative flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-850 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{item.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
