"use client";

import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/types/listing";
import {
  Crown,
  MapPin,
  Clock,
  Tag,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface PowerPackCardProps {
  listing: Listing;
}

function formatPrice(price: number, currency = "LKR"): string {
  return `${currency} ${Number(price || 0).toLocaleString("en-US")}`;
}

function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

export default function PowerPackCard({ listing }: PowerPackCardProps) {
  const primaryImage =
    listing.primaryImage?.url ||
    (listing.images && listing.images.length > 0
      ? listing.images.find((img) => img.primary)?.url || listing.images[0]?.url
      : null);

  const targetHref = `/listings/${listing.slug || listing.id}`;

  return (
    <Link
      href={targetHref}
      className="group relative flex flex-col sm:flex-row items-stretch rounded-3xl border-2 border-violet-500/30 hover:border-violet-500/60 bg-linear-to-r from-violet-500/5 via-purple-500/5 to-slate-900/5 dark:from-violet-950/30 dark:via-slate-900 dark:to-slate-900/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Left: Wide Thumbnail Showcase with Crown Badge */}
      <div className="relative w-full sm:w-72 lg:w-80 h-48 sm:h-auto min-h-[180px] shrink-0 bg-slate-900 overflow-hidden">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <Tag className="w-10 h-10" />
          </div>
        )}

        {/* Top Power Pack Crown Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-violet-700 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-violet-400/30">
          <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>Power Pack</span>
        </div>

        {/* Image count */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium">
            {listing.images.length} photos
          </div>
        )}
      </div>

      {/* Right: Rich Details Body */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category & Verified Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 text-[11px] font-bold border border-violet-500/20">
              {listing.categoryName || "Featured"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Verified Seller</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
            {listing.title}
          </h3>

          {/* Description Snippet */}
          {listing.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {formatPrice(listing.price, listing.currency)}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{listing.city || listing.district || "Sri Lanka"}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatTimeAgo(listing.createdAt)}</span>
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/20 transition-all group-hover:translate-x-0.5">
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
