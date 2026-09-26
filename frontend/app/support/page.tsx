"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Mail,
  Book,
  ChevronDown,
  ChevronRight,
  Search,
  Zap,
  Package,
  CreditCard,
  UserCircle,
  Shield,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const faqs = [
  {
    category: "Listings",
    icon: Package,
    color: "emerald",
    items: [
      {
        q: "How do I post a listing on Wudo?",
        a: "Click the 'Post Ad' or 'New Listing' button from the navigation bar. Fill in the title, description, price, category, location, and upload at least one photo. Your listing will be reviewed and published within minutes.",
      },
      {
        q: "How many listings can I post?",
        a: "Free accounts can post up to 5 active listings at a time. Subscribing to a Wudo plan increases your listing quota. Check the Subscriptions page for current plan details.",
      },
      {
        q: "My listing was removed. Why?",
        a: "Listings are removed if they violate our community guidelines (e.g., prohibited items, misleading descriptions, duplicate ads). Check your email for a moderation notice. You can appeal the decision by contacting support@wudo.lk.",
      },
      {
        q: "Can I edit my listing after publishing?",
        a: "Yes. Go to My Listings, find the listing, and click Edit. Note that editing a boosted listing may trigger a brief re-moderation check.",
      },
      {
        q: "How do I mark a listing as Sold?",
        a: "From My Listings, open the listing and click 'Mark as Sold'. This will deactivate the listing and remove it from search results.",
      },
    ],
  },
  {
    category: "Boosts & Promotions",
    icon: Zap,
    color: "amber",
    items: [
      {
        q: "What are the different boost types?",
        a: "Wudo offers four boost types: Spotlight Ad (featured top placement with a golden badge), Push Up (daily automated bump to the top), Urgent Ad (high-visibility red ribbon), and Power Pack (all three combined at a discount).",
      },
      {
        q: "How long does it take for a boost to activate?",
        a: "Boosts activate instantly after payment confirmation from PayHere. You will receive a confirmation email, and your listing will appear boosted immediately.",
      },
      {
        q: "Can I get a refund on a boost?",
        a: "Boost purchases are non-refundable once activated. If you experience a technical issue where your boost did not activate despite payment, contact support@wudo.lk within 24 hours with your payment reference.",
      },
      {
        q: "What payment methods are accepted for boosts?",
        a: "We accept Visa, MasterCard, American Express, FriMi, eZ Cash, Genie, and online banking through PayHere. All transactions are processed in Sri Lankan Rupees (LKR).",
      },
    ],
  },
  {
    category: "Payments",
    icon: CreditCard,
    color: "blue",
    items: [
      {
        q: "Is it safe to pay on Wudo?",
        a: "Yes. All boost payments are processed through PayHere, a PCI-DSS certified payment gateway. Wudo never stores your card details on our servers.",
      },
      {
        q: "I was charged but my boost didn't activate. What do I do?",
        a: "This can happen due to network timeouts. Wait 15 minutes and check My Listings. If the boost is still not active, email support@wudo.lk with your order ID and we will resolve it within 24 hours.",
      },
      {
        q: "How do I get an invoice for my boost purchase?",
        a: "A payment receipt is automatically emailed to you after each successful boost purchase. You can also access past invoices from your account's Boost History section.",
      },
    ],
  },
  {
    category: "Account & Security",
    icon: UserCircle,
    color: "purple",
    items: [
      {
        q: "I forgot my password. How do I reset it?",
        a: "Click 'Log In' then 'Forgot Password'. Enter your registered email and we will send a secure reset link valid for 1 hour.",
      },
      {
        q: "How do I verify my email address?",
        a: "After registration, a verification email is sent to your inbox. Click the link in the email. If you did not receive it, check your spam folder or request a new one from Account Settings.",
      },
      {
        q: "I think my account has been compromised. What should I do?",
        a: "Immediately change your password from Account Settings and contact security@wudo.lk. We will investigate and temporarily secure your account while we review the situation.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings > Account > Delete Account. This is permanent and will remove all your listings and data subject to our data retention policy. Active boosts will not be refunded.",
      },
    ],
  },
  {
    category: "Reporting & Safety",
    icon: Shield,
    color: "rose",
    items: [
      {
        q: "How do I report a suspicious listing or user?",
        a: "Every listing has a 'Report' button. Click it, select a reason, and submit. Our moderation team reviews all reports within 24 hours. For urgent safety concerns, email safety@wudo.lk.",
      },
      {
        q: "I encountered a scam on Wudo. What should I do?",
        a: "Do not send any money. Report the listing and user immediately using the Report button. Document any conversation or payment requests. Contact us at safety@wudo.lk and, if applicable, file a report with Sri Lanka Police.",
      },
      {
        q: "What are the signs of a scam on a marketplace?",
        a: "Common scams: prices that are too good to be true, requests to pay outside the platform, pressure to complete a deal quickly, unverifiable seller information, or requests for personal financial data.",
      },
    ],
  },
];

const contactChannels = [
  {
    icon: Mail,
    label: "Email Support",
    description: "Detailed queries and account issues",
    action: "support@wudo.lk",
    href: "mailto:support@wudo.lk",
    badge: "Replies within 24h",
    color: "emerald",
  },
  {
    icon: MessageSquare,
    label: "Community Forum",
    description: "Connect with other Wudo users",
    action: "Visit Forum",
    href: "#",
    badge: "Coming Soon",
    color: "blue",
  },
  {
    icon: AlertCircle,
    label: "Report Abuse",
    description: "Safety and content violations",
    action: "safety@wudo.lk",
    href: "mailto:safety@wudo.lk",
    badge: "Urgent issues",
    color: "rose",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20 dark:border-emerald-400/20",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-400/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20 dark:border-amber-400/20",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-400/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20 dark:border-blue-400/20",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-400/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20 dark:border-purple-400/20",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  rose: {
    bg: "bg-rose-500/10 dark:bg-rose-400/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20 dark:border-rose-400/20",
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
};

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            id={`faq-btn-${i}`}
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 py-4 text-left group cursor-pointer"
          >
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {item.q}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <p className="pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function SupportPage() {
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        search === "" ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 dark:from-slate-950 dark:via-teal-950/60 dark:to-slate-950 py-20 px-4">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 60%, #0d9488 0%, transparent 55%), radial-gradient(circle at 70% 20%, #0f766e 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300 mb-6">
            <LifeBuoy className="h-3.5 w-3.5" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-5">
            How Can We Help?
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Search our knowledge base or browse by topic below. Can&apos;t find what you need? Our support team is always here.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              id="support-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 backdrop-blur-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-12 space-y-10">
        {/* Contact Channels */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
            Contact Support
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contactChannels.map((ch) => {
              const Icon = ch.icon;
              const c = colorMap[ch.color];
              return (
                <a
                  key={ch.label}
                  href={ch.href}
                  className={`group flex flex-col gap-3 rounded-2xl border p-6 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${c.border}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{ch.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ch.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${c.badge}`}>
                      {ch.badge}
                    </span>
                    <ExternalLink className={`h-4 w-4 ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Post a Listing", href: "/listings/new", icon: Package },
            { label: "Boost My Ad", href: "/promotions", icon: Zap },
            { label: "Privacy Policy", href: "/privacy-policy", icon: Shield },
            { label: "Terms of Service", href: "/terms-of-service", icon: Book },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-medium hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
                <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
              </Link>
            );
          })}
        </div>

        {/* FAQ Sections */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <Search className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">No results found for &ldquo;{search}&rdquo;</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try a different search term or contact support directly.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFaqs.map((cat) => {
                const Icon = cat.icon;
                const c = colorMap[cat.color];
                return (
                  <div
                    key={cat.category}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
                  >
                    <div className={`flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 ${c.bg}`}>
                      <div className={`p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 ${c.text}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className={`text-sm font-bold ${c.text}`}>{cat.category}</h3>
                    </div>
                    <div className="px-6">
                      <FaqAccordion items={cat.items} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Still Need Help CTA */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-teal-950/30 p-8 text-center">
          <LifeBuoy className="h-10 w-10 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Still Need Help?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Our support team typically responds within 24 hours on business days (Mon–Fri, 9am–6pm SLST).
          </p>
          <a
            href="mailto:support@wudo.lk"
            id="email-support-cta"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-sm shadow-lg shadow-teal-600/20 hover:from-teal-500 hover:to-emerald-500 transition-all hover:shadow-xl"
          >
            <Mail className="h-4 w-4" />
            Email Our Support Team
          </a>
        </div>
      </div>
    </main>
  );
}
