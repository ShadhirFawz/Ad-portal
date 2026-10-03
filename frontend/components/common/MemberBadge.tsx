"use client";

import React from "react";

interface MemberBadgeProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
}

export default function MemberBadge({
  className = "",
  size = "sm",
  showText = true,
}: MemberBadgeProps) {
  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-sm px-2.5 py-1 gap-2",
    lg: "text-base px-3.5 py-1.5 gap-2.5",
  }[size];

  const iconSizes = {
    xs: "w-2.5 h-2.5",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-300/80 dark:border-slate-700 select-none shadow-xs tracking-wide ${sizeClasses} ${className}`}
      title="Standard Member"
    >
      <svg
        className={`${iconSizes} text-slate-500 dark:text-slate-400 shrink-0`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && <span>MEMBER</span>}
    </span>
  );
}
