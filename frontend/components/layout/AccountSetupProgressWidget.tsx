"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useAuth } from "@/providers/AuthProvider";
import { getAccountSetupProgress } from "@/lib/api/users";
import type { AccountSetupProgress, AccountSetupStepItem } from "@/types/accountSetup";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  User,
  Phone,
  FileText,
  PlusCircle,
  Gavel,
  ShieldCheck,
  X,
  Layers,
} from "lucide-react";

interface AccountSetupProgressWidgetProps {
  size?: number;
  className?: string;
  onNavigate?: () => void;
}

function getStepIcon(key: string) {
  switch (key) {
    case "USERNAME":
      return User;
    case "PHONE_NUMBER":
      return Phone;
    case "DESCRIPTION":
      return FileText;
    case "FIRST_LISTING":
      return PlusCircle;
    case "AUCTION_PARTICIPATION":
      return Gavel;
    default:
      return Layers;
  }
}

export default function AccountSetupProgressWidget({
  size = 36,
  className = "",
  onNavigate,
}: AccountSetupProgressWidgetProps) {
  const { user, accessToken } = useAuth();
  const [progress, setProgress] = useState<AccountSetupProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [desktopAnchorStyle, setDesktopAnchorStyle] = useState<React.CSSProperties>({});
  // Gate: panel only renders after the anchor has been resolved for the
  // current viewport. Prevents the "ghost at top-left" flash on first open.
  const [anchorReady, setAnchorReady] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownPanelRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mount for portal safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track viewport size so we only compute the desktop anchor on ≥ sm.
  // Tailwind's `sm` breakpoint is 640px.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getAccountSetupProgress(accessToken);
      setProgress(data);
    } catch (err) {
      console.warn("Failed to fetch account setup progress:", err);
    } finally {
      setLoading(false);
    }
  }, [user, accessToken]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideWidget = dropdownRef.current?.contains(target);
      const insidePanel = dropdownPanelRef.current?.contains(target);
      if (!insideWidget && !insidePanel) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Anchor computation ────────────────────────────────────────────────
  // Runs whenever the dropdown opens or the viewport class changes.
  // Sets `anchorReady` to true ONLY after the position is known, so the
  // portal renders with final coordinates on its very first paint.
  useEffect(() => {
    if (!isDropdownOpen) {
      // Reset readiness when closing so the next open re-gates cleanly.
      setAnchorReady(false);
      return;
    }

    if (isDesktop) {
      // Desktop: measure the widget, then mark ready.
      const compute = () => {
        const rect = dropdownRef.current?.getBoundingClientRect();
        if (!rect) return;
        setDesktopAnchorStyle({
          top: rect.bottom + 12,
          right: Math.max(window.innerWidth - rect.right, 12),
        });
        setAnchorReady(true);
      };

      compute();
      window.addEventListener("resize", compute);
      window.addEventListener("scroll", compute, true);
      return () => {
        window.removeEventListener("resize", compute);
        window.removeEventListener("scroll", compute, true);
      };
    }

    setDesktopAnchorStyle({});
    setAnchorReady(true);
  }, [isDropdownOpen, isDesktop]);

  if (!user) return null;

  const completedCount = progress?.completedCount ?? 0;
  const totalCount = progress?.totalCount ?? 5;
  const percentage =
    progress?.percentage ?? (totalCount > 0 ? (completedCount / totalCount) * 100 : 0);
  const isFullyCompleted =
    progress?.isFullyCompleted ?? (completedCount === totalCount && totalCount > 0);

  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const isRingDetached = isHovered || isDropdownOpen;

  const shouldRenderPanel = isDropdownOpen && mounted && anchorReady;

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center">
        {/* Detached Fraction Ring */}
        <div
          className={`
            overflow-hidden flex items-center transition-all duration-300 ease-out
            ${isRingDetached
              ? "max-w-[80px] opacity-100 mr-2"
              : "max-w-0 opacity-0 mr-0 pointer-events-none"}
          `}
        >
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="relative shrink-0 cursor-pointer select-none group"
            title="Account Setup Progress (Click to view checklist)"
            aria-label={`Account setup ${completedCount} of ${totalCount} complete`}
          >
            <svg
              width={size}
              height={size}
              className="absolute top-0 left-0 -rotate-90 pointer-events-none"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-200 dark:text-slate-700/60"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-700 ease-out ${isFullyCompleted
                  ? "text-emerald-500 filter drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]"
                  : "text-emerald-500"
                  }`}
              />
            </svg>

            <div
              className="rounded-full flex items-center justify-center bg-white dark:bg-slate-900 ring-1 ring-slate-200/70 dark:ring-slate-700/60 transition-transform duration-200 group-hover:scale-105"
              style={{ width: size, height: size }}
            >
              {isFullyCompleted ? (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ) : (
                <span className="font-mono font-extrabold text-[11px] text-slate-800 dark:text-slate-100 leading-none">
                  {completedCount}/{totalCount}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Profile Avatar */}
        <div
          className="relative cursor-pointer select-none group shrink-0"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <svg
            width={size}
            height={size}
            className={`
              absolute top-0 left-0 -rotate-90 pointer-events-none
              transition-opacity duration-300 ease-out
              ${isRingDetached ? "opacity-0" : "opacity-100"}
            `}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-200 dark:text-slate-700/60"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-700 ease-out ${isFullyCompleted
                ? "text-emerald-500 filter drop-shadow-[0_0_3px_rgba(16,185,129,0.5)]"
                : "text-emerald-500"
                }`}
            />
          </svg>

          <div className="p-[2.5px] rounded-full flex items-center justify-center">
            <ProfileAvatar
              avatarUrl={user.avatarUrl}
              firstName={user.firstName}
              email={user.email}
              username={user.username}
              size={size - 6}
              className="shadow-xs transition-transform duration-200 group-hover:scale-105"
            />
          </div>

          {isFullyCompleted && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-sm">
              <CheckCircle2 className="w-2.5 h-2.5 fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Checklist Dropdown */}
      {shouldRenderPanel &&
        createPortal(
          <>
            {/* Invisible backdrop for mobile — closes the panel when tapping outside */}
            <div
              className="fixed inset-0 z-[80] sm:hidden"
              onClick={() => setIsDropdownOpen(false)}
              aria-hidden="true"
            />

            <div
              ref={dropdownPanelRef}
              className="
                fixed z-[90]
                right-3 top-16 w-[calc(100vw-1.5rem)] max-w-sm
                sm:right-auto sm:top-auto sm:w-80 md:w-96 sm:max-w-none
                bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800
                shadow-2xl flex flex-col
                animate-in fade-in slide-in-from-right-4 duration-200
              "
              style={{
                ...(isDesktop ? desktopAnchorStyle : {}),
                maxHeight: isDesktop
                  ? "calc(100dvh - 96px)"
                  : "calc(100dvh - 5rem)",
              }}
              data-account-setup-panel
            >
              {/* Header */}
              <div className="shrink-0 p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <h4
                        className="text-sm font-bold text-slate-900 dark:text-white"
                        style={{ fontFamily: "'PT Sans', 'Tahoma', sans-serif" }}
                      >
                        Getting Started
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {isFullyCompleted
                          ? "All onboarding milestones completed!"
                          : `Hints and tips to get best experience`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    aria-label="Close account setup panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2.5">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              {/* Steps List — scrollable middle section */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
                {progress?.steps?.map((step: AccountSetupStepItem, idx: number) => {
                  const Icon = getStepIcon(step.key);
                  return (
                    <div
                      key={step.key || idx}
                      className={`p-3 rounded-xl transition-all flex items-start justify-between gap-3 ${step.completed
                        ? "bg-slate-50/50 dark:bg-slate-900/40 opacity-80 hover:opacity-100"
                        : "bg-white dark:bg-slate-900 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20"
                        }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {step.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-xs font-bold leading-tight ${step.completed
                                ? "text-slate-700 dark:text-slate-300 line-through decoration-slate-300 dark:decoration-slate-600"
                                : "text-slate-900 dark:text-white"
                                }`}
                            >
                              {step.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 self-center">
                        {step.completed ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Done
                          </span>
                        ) : (
                          <Link
                            href={step.actionUrl}
                            onClick={() => {
                              setIsDropdownOpen(false);
                              if (onNavigate) onNavigate();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
                          >
                            <span>{step.actionLabel || "Complete"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="shrink-0 p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
                {isFullyCompleted ? (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified &amp; Fully Configured Profile</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                    <span>Complete steps to boost trust &amp; visibility</span>
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      View Profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}