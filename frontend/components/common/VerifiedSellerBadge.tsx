"use client";

import React from "react";

interface VerifiedSellerBadgeProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
}

export default function VerifiedSellerBadge({
  className = "",
  size = "sm",
  showText = true,
}: VerifiedSellerBadgeProps) {
  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2.5 py-0.5 gap-1.5",
    md: "text-sm px-3 py-1 gap-2",
    lg: "text-base px-4 py-1.5 gap-2.5",
  }[size];

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-4.5 h-4.5",
    lg: "w-5.5 h-5.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30 select-none shadow-xs tracking-wider uppercase ${sizeClasses} ${className}`}
      title="Verified Seller - Authenticated Business / Pro Member"
    >
      <svg
        className={`${iconSizes} text-emerald-600 dark:text-emerald-400 shrink-0`}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.548 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.548 4.49 4.49 0 01-3.498-1.307 4.491 4.491 0 01-1.307-3.497A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.004 6.308a.75.75 0 00-1.06-1.06l-4.243 4.242-1.768-1.768a.75.75 0 00-1.06 1.06l2.3 2.3a.75.75 0 001.06 0l4.771-4.774z"
        />
      </svg>
      {showText && <span>VERIFIED SELLER</span>}
    </span>
  );
}
