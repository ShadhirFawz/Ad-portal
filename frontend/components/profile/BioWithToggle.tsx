"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BioWithToggleProps {
    bio: string;
}

export default function BioWithToggle({ bio }: BioWithToggleProps) {
    const [expanded, setExpanded] = useState(false);
    const isLong = bio.length > 220;

    if (!isLong) {
        return (
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words">
                {bio}
            </p>
        );
    }

    return (
        <div>
            <p
                className={`text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words ${expanded ? "" : "line-clamp-4"
                    }`}
            >
                {bio}
            </p>

            <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
            >
                <span>{expanded ? "View less" : "View more"}</span>
                {expanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                )}
            </button>
        </div>
    );
}