"use client";

import { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";
import {
  WEEK_DAYS,
  currentIsoWeekday,
  formatOpeningHourRange,
  normalizeOpeningHours,
  type OpeningHour,
} from "@/lib/openingHours";

interface OpeningHoursDisplayProps {
  hours?: OpeningHour[] | null;
}

export default function OpeningHoursDisplay({ hours }: OpeningHoursDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  const normalized = normalizeOpeningHours(hours);
  const today = currentIsoWeekday();

  const todayHour = normalized.find((h) => h.dayOfWeek === today);
  const otherDays = normalized.filter((h) => h.dayOfWeek !== today);

  const renderRow = (hour: OpeningHour, isToday: boolean) => {
    const day = WEEK_DAYS.find((d) => d.dayOfWeek === hour.dayOfWeek);
    const closed = hour.isClosed;

    return (
      <div
        key={hour.dayOfWeek}
        className={`flex items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-xs ${isToday
            ? "bg-emerald-500/10 border border-emerald-500/20"
            : "bg-slate-50/80 dark:bg-slate-900/40 border border-transparent"
          }`}
      >
        <span
          className={`font-semibold min-w-24 ${isToday
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-slate-700 dark:text-slate-300"
            }`}
        >
          {day?.label ?? `Day ${hour.dayOfWeek}`}
          {isToday && (
            <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Today
            </span>
          )}
        </span>
        <span
          className={`font-medium ${closed
              ? "text-rose-500 dark:text-rose-400"
              : "text-slate-800 dark:text-slate-200"
            }`}
        >
          {formatOpeningHourRange(hour)}
        </span>
      </div>
    );
  };

  return (
    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-emerald-500" />
        <span>Shop / Business Hours</span>
      </h3>

      <div className="space-y-1.5">
        {/* Today — always shown */}
        {todayHour && renderRow(todayHour, true)}

        {/* Other days — revealed on toggle */}
        {expanded && otherDays.map((hour) => renderRow(hour, false))}
      </div>

      {/* See all timings toggle */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
        aria-expanded={expanded}
      >
        <span>{expanded ? "Hide timings" : "See all timings"}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""
            }`}
        />
      </button>
    </div>
  );
}