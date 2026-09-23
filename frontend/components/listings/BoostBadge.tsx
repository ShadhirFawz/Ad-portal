import React from "react";
import { Star, Flame, TrendingUp, Crown } from "lucide-react";
import type { BoostType } from "@/types/boost";

/* POWER PACK — Full-width banner at the very top of the card */
export function PowerPackBadge() {
  return (
    <div
      title="Power Pack — Maximum visibility: Spotlight + Hot Deal + Push Up"
      aria-label="Power Pack — Maximum visibility: Spotlight + Hot Deal + Push Up"
      className="pointer-events-auto cursor-help flex items-center justify-center gap-2 px-3 py-[6px] shrink-0"
      style={{
        background: "#5b21b6",
        boxShadow: "0 3px 14px rgba(91,33,182,0.45)",
      }}
    >
      <Crown
        style={{ width: 11, height: 11, color: "#fde68a", fill: "#fde68a", flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: 9,
          fontWeight: 900,
          color: "white",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        Power Pack
      </span>
      <Crown
        style={{ width: 11, height: 11, color: "#fde68a", fill: "#fde68a", flexShrink: 0 }}
      />
    </div>
  );
}

/* SPOTLIGHT — Corner ribbon fold on the card frame */
export function SpotlightBadge() {
  return (
    <div
      title="Spotlight — Pinned to the top of search results"
      aria-label="Spotlight — Pinned to the top of search results"
      className="absolute top-0 right-0 pointer-events-auto cursor-help overflow-hidden"
      style={{ width: 130, height: 130, zIndex: 25 }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          left: -15,
          width: 200,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: 14,
          background: "linear-gradient(225deg, #fbbf24 0%, #f59e0b 50%, #b45309 100%)",
          transform: "rotate(45deg)",
          transformOrigin: "center",
          boxShadow: "0 2px 12px rgba(245,158,11,0.55)",
        }}
      >
        <Star
          style={{
            width: 10,
            height: 10,
            fill: "#fffbeb",
            color: "#fffbeb",
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}

/* HOT DEAL — Divider bar between image and card content */
export function HotDealBadge() {
  return (
    <div
      title="Hot Deal — Limited-time price offer"
      aria-label="Hot Deal — Limited-time price offer"
      className="pointer-events-auto cursor-help flex items-center justify-center gap-2 px-3 py-[5px] shrink-0 w-full"
      style={{
        background: "#dc2626",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: "white",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        Urgent
      </span>
    </div>
  );
}

/* PUSH UP — Thin bar at the bottom of the entire card */
export function PushUpBadge() {
  return (
    <div
      title="Push Up — Bumped to the top of the listings feed today"
      aria-label="Push Up — Bumped to the top of the listings feed today"
      className="pointer-events-auto cursor-help flex items-center justify-center gap-2 px-3 py-[4px] shrink-0 w-full"
      style={{
        background: "#059669",
        borderTop: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <TrendingUp
        style={{ width: 9, height: 9, color: "#d1fae5", flexShrink: 0 }}
      />
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: "white",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        Trending Up Today
      </span>
    </div>
  );
}

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
  const iconPx: Record<string, number> = { sm: 12, md: 14, lg: 16 };
  const px = iconPx[size] ?? 12;

  const pill =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold text-[10px] uppercase tracking-wide cursor-help border select-none";

  switch (type) {
    case "SPOTLIGHT":
      return (
        <span
          title="Spotlight — Pinned to the top of search results"
          aria-label="Spotlight — Pinned to the top of search results"
          className={`${pill} bg-amber-500 text-white border-amber-600/40 shadow-sm ${className}`}
        >
          <Star style={{ width: px, height: px, fill: "white", flexShrink: 0 }} />
          {!showIconOnly && "Spotlight"}
        </span>
      );
    case "HOT_DEAL":
      return (
        <span
          title="Hot Deal — Limited-time price offer"
          aria-label="Hot Deal — Limited-time price offer"
          className={`${pill} bg-red-600 text-white border-red-700/40 shadow-sm ${className}`}
        >
          <Flame style={{ width: px, height: px, fill: "white", flexShrink: 0 }} />
          {!showIconOnly && "Hot Deal"}
        </span>
      );
    case "PUSH_UP":
      return (
        <span
          title="Push Up — Bumped to top of results today"
          aria-label="Push Up — Bumped to top of results today"
          className={`${pill} bg-emerald-600 text-white border-emerald-700/40 shadow-sm ${className}`}
        >
          <TrendingUp style={{ width: px, height: px, flexShrink: 0 }} />
          {!showIconOnly && "Push Up"}
        </span>
      );
    case "POWER_PACK":
      return (
        <span
          title="Power Pack — Spotlight + Hot Deal + Push Up combined"
          aria-label="Power Pack — Spotlight + Hot Deal + Push Up combined"
          className={`${pill} bg-violet-700 text-white border-violet-800/40 shadow-sm ${className}`}
        >
          <Crown style={{ width: px, height: px, fill: "#fde68a", flexShrink: 0 }} />
          {!showIconOnly && "Power Pack"}
        </span>
      );
    default:
      return null;
  }
};