import React from "react";
import { Star, Flame, ArrowUpCircle, Zap } from "lucide-react";
import type { BoostType } from "@/types/boost";

interface BoostBadgeProps {
  type: BoostType;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIconOnly?: boolean;
}

export const BoostBadge: React.FC<BoostBadgeProps> = ({
  type,
  size = "sm",
  className = "",
  showIconOnly = true,
}) => {
  const sizeClasses = {
    sm: showIconOnly ? "p-1 sm:p-1.5" : "px-2 py-0.5 text-[10px] font-semibold gap-1",
    md: showIconOnly ? "p-1.5 sm:p-2" : "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: showIconOnly ? "p-2 sm:p-2.5" : "px-3 py-1.5 text-sm font-bold gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3 sm:w-3.5 sm:h-3.5",
    md: "w-3.5 h-3.5 sm:w-4 sm:h-4",
    lg: "w-4 h-4 sm:w-5 sm:h-5",
  };

  switch (type) {
    case "SPOTLIGHT":
      return (
        <span
          title="Spotlight Ad — Top showcase visibility"
          aria-label="Spotlight Ad — Top showcase visibility"
          className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.45)] border border-amber-300/50 tracking-wide uppercase cursor-help ${sizeClasses[size]} ${className}`}
        >
          <Star className={`${iconSizes[size]} shrink-0 fill-slate-950`} />
          {!showIconOnly && <span>Spotlight</span>}
        </span>
      );

    case "HOT_DEAL":
      return (
        <span
          title="Hot Deal — Urgent price offer promotion"
          aria-label="Hot Deal — Urgent price offer promotion"
          className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-rose-300/40 tracking-wide uppercase cursor-help ${sizeClasses[size]} ${className}`}
        >
          <Flame className={`${iconSizes[size]} shrink-0 fill-white`} />
          {!showIconOnly && <span>Hot Deal</span>}
        </span>
      );

    case "PUSH_UP":
      return (
        <span
          title="Push Up — Daily bumped to top of regular listings"
          aria-label="Push Up — Daily bumped to top of regular listings"
          className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-[0_0_10px_rgba(16,185,129,0.35)] border border-emerald-300/40 tracking-wide uppercase cursor-help ${sizeClasses[size]} ${className}`}
        >
          <ArrowUpCircle className={`${iconSizes[size]} shrink-0`} />
          {!showIconOnly && <span>Top Ranked</span>}
        </span>
      );

    case "POWER_PACK":
      return (
        <span
          title="Power Pack — Spotlight, Push Up & Hot Deal all-in-one boost"
          aria-label="Power Pack — Spotlight, Push Up & Hot Deal all-in-one boost"
          className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-white font-bold shadow-[0_0_14px_rgba(168,85,247,0.45)] border border-purple-300/50 tracking-wide uppercase cursor-help ${sizeClasses[size]} ${className}`}
        >
          <Zap className={`${iconSizes[size]} shrink-0 fill-white`} />
          {!showIconOnly && <span>Power Boost</span>}
        </span>
      );

    default:
      return null;
  }
};
