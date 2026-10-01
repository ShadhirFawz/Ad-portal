"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Mode = "buying" | "selling";

interface Step {
    num: string;
    title: string;
    desc: string;
}

interface PlaybookMode {
    kicker: string;
    headline: string;
    summary: string;
    steps: Step[];
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
}

const PLAYBOOKS: Record<Mode, PlaybookMode> = {
    buying: {
        kicker: "For buyers",
        headline: "A short playbook for finding what you actually want.",
        summary:
            "Wudo is built for direct trade — no escrow, no middleman, no fees on either side. The three steps below are what experienced buyers do before they message anyone.",
        steps: [
            {
                num: "01",
                title: "Filter before you browse",
                desc: "Pick your district and category first. Browsing without filters is how you end up on page eleven of items you can't collect.",
            },
            {
                num: "02",
                title: "Ask one specific question",
                desc: "Skip 'is this available'. Ask about the one detail the photos don't show — the reason they're selling, or the last time it was serviced.",
            },
            {
                num: "03",
                title: "Meet in daylight, in public",
                desc: "Test the item before you pay. Cash or instant bank transfer only, in a place with people around. If the seller resists, that's your answer.",
            },
        ],
        primaryCta: { label: "Browse listings", href: "/listings" },
        secondaryCta: { label: "Read buyer safety", href: "/support" },
    },
    selling: {
        kicker: "For sellers",
        headline: "A short playbook for selling without wasting weeks.",
        summary:
            "Listing on Wudo takes under two minutes and costs nothing. What separates a fast sale from a stale listing is almost always the first hour after you hit publish.",
        steps: [
            {
                num: "01",
                title: "Price against real sold listings",
                desc: "Check what similar items actually sold for in the last two weeks — not what sellers are currently asking. The gap is usually 15–20%.",
            },
            {
                num: "02",
                title: "Answer within the first hour",
                desc: "The first three inquiries decide whether your listing stays warm. Late replies are the most common reason good listings go cold.",
            },
            {
                num: "03",
                title: "Hold your floor price",
                desc: "One polite no is worth more than three rounds of haggling. Buyers who respect your price are the ones who show up.",
            },
        ],
        primaryCta: {
            label: "Post a listing",
            href: "/listings/new",
        },
        secondaryCta: { label: "Compare boost plans", href: "/promotions" },
    },
};

export default function TradingPlaybook() {
    const [mode, setMode] = useState<Mode>("buying");
    const data = PLAYBOOKS[mode];

    return (
        <section className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            {/* ── Top bar: kicker + mode switch */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 px-5 sm:px-8 py-4">
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 truncate">
                        Wudo Trading Playbook
                    </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold shrink-0">
                    {(["buying", "selling"] as Mode[]).map((m) => {
                        const active = mode === m;
                        return (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${active
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                    }`}
                            >
                                {m === "buying" ? "Buying" : "Selling"}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-8 lg:px-12 py-8 sm:py-10 lg:py-12">
                {/* Kicker + headline + summary */}
                <div className="max-w-2xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
                        {data.kicker}
                    </p>
                    <h2 className="mt-3 text-xl sm:text-2xl lg:text-[1.75rem] font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
                        {data.headline}
                    </h2>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {data.summary}
                    </p>
                </div>

                {/* The three steps — horizontal on desktop, stacked on mobile */}
                <ol className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-x-10">
                    {data.steps.map((step, idx) => (
                        <li key={step.num} className="relative">
                            {/* Connecting rail — only between columns, desktop only */}
                            {idx < data.steps.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className="hidden md:block absolute top-2.5 left-[calc(100%+0.75rem)] right-[-2.5rem] h-px bg-slate-200 dark:bg-slate-800"
                                />
                            )}

                            {/* Number + label */}
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0 bg-white dark:bg-slate-900 relative z-[1]">
                                    {step.num.slice(1)}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                                    Step {step.num}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                                {step.title}
                            </h3>

                            {/* Description */}
                            <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                {step.desc}
                            </p>
                        </li>
                    ))}
                </ol>

                {/* Footer: CTAs */}
                <div className="mt-10 sm:mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <Link
                            href={data.primaryCta.href}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors group"
                        >
                            <span>{data.primaryCta.label}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>

                        <Link
                            href={data.secondaryCta.href}
                            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            {data.secondaryCta.label}
                        </Link>
                    </div>

                    <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                        No listing fees. No buyer premiums. No hidden charges.
                    </p>
                </div>
            </div>
        </section>
    );
}