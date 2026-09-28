"use client";

interface BoostFlowDiagramProps {
    className?: string;
}

/**
 * A hand-drawn flow diagram showing the three-stage boost journey:
 *   More Views → More Inquiries → Faster Sales
 *
 * Rendered entirely in SVG so it scales perfectly and reads as a single
 * cohesive illustration rather than three floating icons. Uses the brand
 * emerald palette with a subtle animated pulse on the connecting paths.
 */
export default function BoostFlowDiagram({
    className = "",
}: BoostFlowDiagramProps) {
    return (
        <svg
            viewBox="0 0 360 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
            role="img"
        >
            {/* ── Background grid — very subtle ─────────────────────────────── */}
            <defs>
                <pattern
                    id="bfd-grid"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                >
                    <circle cx="1" cy="1" r="0.6" className="fill-slate-300/60 dark:fill-slate-700/60" />
                </pattern>

                {/* Gradient used on the connecting paths */}
                <linearGradient id="bfd-path-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
                </linearGradient>

                {/* Soft glow filter for the accent node */}
                <filter id="bfd-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <rect width="360" height="260" fill="url(#bfd-grid)" />

            {/* ── Connecting flow path (S-curve through the three nodes) ──── */}
            <path
                id="bfd-flow"
                d="M 70 60 C 130 60, 130 130, 180 130 S 230 200, 290 200"
                stroke="url(#bfd-path-grad)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                fill="none"
            >
                <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-16"
                    dur="1.6s"
                    repeatCount="indefinite"
                />
            </path>

            {/* ── Node 1 — Eye (More Views) ─────────────────────────────────── */}
            <g transform="translate(40, 30)">
                {/* Node ring */}
                <circle
                    cx="30"
                    cy="30"
                    r="26"
                    className="fill-white dark:fill-slate-900"
                />
                <circle
                    cx="30"
                    cy="30"
                    r="26"
                    className="stroke-emerald-500/30 dark:stroke-emerald-400/40"
                    strokeWidth="1.5"
                />
                {/* Pulsing outer ring */}
                <circle
                    cx="30"
                    cy="30"
                    r="26"
                    className="stroke-emerald-500"
                    strokeWidth="1"
                    opacity="0.35"
                >
                    <animate
                        attributeName="r"
                        values="26;32;26"
                        dur="3s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.35;0;0.35"
                        dur="3s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* Eye icon (lucide "eye" geometry, hand-scaled) */}
                <g
                    transform="translate(18, 18)"
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                </g>

                {/* Label */}
                <text
                    x="30"
                    y="76"
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400"
                    style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}
                >
                    More Views
                </text>
            </g>

            {/* ── Node 2 — MousePointerClick (More Inquiries) ──────────────── */}
            <g transform="translate(150, 100)">
                {/* Node ring — larger, focal */}
                <circle
                    cx="30"
                    cy="30"
                    r="30"
                    className="fill-white dark:fill-slate-900"
                />
                <circle
                    cx="30"
                    cy="30"
                    r="30"
                    className="stroke-emerald-500 dark:stroke-emerald-400"
                    strokeWidth="1.8"
                />
                {/* Rotating dashed ring */}
                <circle
                    cx="30"
                    cy="30"
                    r="36"
                    className="stroke-emerald-500/40 dark:stroke-emerald-400/50"
                    strokeWidth="1"
                    strokeDasharray="2 5"
                    fill="none"
                    style={{
                        transformOrigin: "30px 30px",
                    }}
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 30 30"
                        to="360 30 30"
                        dur="20s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* MousePointerClick icon (lucide geometry) */}
                <g
                    transform="translate(17, 17)"
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                >
                    <path d="M9 9l5 12 1.774-5.226L21 14 9 9z" />
                    <path d="M16.071 16.071l5.657 5.657" />
                </g>

                {/* Focal accent — small filled dot at the tip of the cursor */}
                <circle
                    cx="30"
                    cy="30"
                    r="2"
                    className="fill-emerald-500"
                    filter="url(#bfd-glow)"
                >
                    <animate
                        attributeName="r"
                        values="1.5;2.5;1.5"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </circle>

                <text
                    x="30"
                    y="82"
                    textAnchor="middle"
                    className="fill-slate-700 dark:fill-slate-300"
                    style={{
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}
                >
                    More Inquiries
                </text>
            </g>

            {/* ── Node 3 — TrendingUp (Faster Sales) ────────────────────────── */}
            <g transform="translate(260, 170)">
                <circle
                    cx="30"
                    cy="30"
                    r="26"
                    className="fill-white dark:fill-slate-900"
                />
                <circle
                    cx="30"
                    cy="30"
                    r="26"
                    className="stroke-emerald-500/30 dark:stroke-emerald-400/40"
                    strokeWidth="1.5"
                />
                {/* Pulsing outer ring (offset timing from node 1) */}
                <circle
                    cx="30"
                    cy="30"
                    r="26"
                    className="stroke-emerald-500"
                    strokeWidth="1"
                    opacity="0.35"
                >
                    <animate
                        attributeName="r"
                        values="26;32;26"
                        dur="3s"
                        begin="1.5s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="0.35;0;0.35"
                        dur="3s"
                        begin="1.5s"
                        repeatCount="indefinite"
                    />
                </circle>

                {/* TrendingUp icon (lucide geometry) */}
                <g
                    transform="translate(18, 18)"
                    className="stroke-emerald-600 dark:stroke-emerald-400"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                </g>

                <text
                    x="30"
                    y="76"
                    textAnchor="middle"
                    className="fill-slate-500 dark:fill-slate-400"
                    style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                    }}
                >
                    Faster Sales
                </text>
            </g>

            {/* ── Small connectors — corner ticks for a technical feel ─────── */}
            <g
                className="stroke-slate-300 dark:stroke-slate-700"
                strokeWidth="1"
                strokeLinecap="round"
            >
                <line x1="8" y1="8" x2="20" y2="8" />
                <line x1="8" y1="8" x2="8" y2="20" />
                <line x1="352" y1="252" x2="340" y2="252" />
                <line x1="352" y1="252" x2="352" y2="240" />
            </g>
        </svg>
    );
}