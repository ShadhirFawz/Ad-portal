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
  showIconOnly = false,
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3 py-1.5 text-sm font-bold gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  switch (type) {
    case "SPOTLIGHT":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.45)] border border-amber-300/40 tracking-wide uppercase ${sizeClasses[size]} ${className}`}
        >
          <Star className={`${iconSizes[size]} shrink-0 fill-slate-950`} />
          {!showIconOnly && <span>Spotlight</span>}
        </span>
      );

    case "HOT_DEAL":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)] border border-rose-300/30 tracking-wide uppercase ${sizeClasses[size]} ${className}`}
        >
          <Flame className={`${iconSizes[size]} shrink-0 fill-white animate-pulse`} />
          {!showIconOnly && <span>Hot Deal</span>}
        </span>
      );

    case "PUSH_UP":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-[0_0_10px_rgba(16,185,129,0.35)] border border-emerald-300/30 tracking-wide uppercase ${sizeClasses[size]} ${className}`}
        >
          <ArrowUpCircle className={`${iconSizes[size]} shrink-0`} />
          {!showIconOnly && <span>Top Ranked</span>}
        </span>
      );

    case "POWER_PACK":
      return (
        <span
          className={`inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-white font-bold shadow-[0_0_14px_rgba(168,85,247,0.45)] border border-purple-300/40 tracking-wide uppercase ${sizeClasses[size]} ${className}`}
        >
          <Zap className={`${iconSizes[size]} shrink-0 fill-white`} />
          {!showIconOnly && <span>Power Boost</span>}
        </span>
      );

    default:
      return null;
  }
};
