import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  Eye,
  Lock,
  Database,
  Share2,
  UserCheck,
  Bell,
  Trash2,
  Globe,
  Mail,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Wudo",
  description:
    "Learn how Wudo collects, uses, and protects your personal information on our peer-to-peer ad marketplace platform.",
};

const sections = [
  {
    id: "information-we-collect",
    icon: Database,
    color: "emerald",
    title: "Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        body: "When you register on Wudo, we collect your name, email address, phone number, and password. Optional profile details such as a profile photo and WhatsApp number may also be provided by you.",
      },
      {
        subtitle: "Listing Data",
        body: "When you post an ad, we store the listing title, description, price, category, images, location details (district, province, city), and any custom attributes you include.",
      },
      {
        subtitle: "Usage Data",
        body: "We automatically collect device information, browser type, IP address, pages visited, search queries, view counts on listings, and interaction events such as favorites and bookmarks.",
      },
      {
        subtitle: "Payment Information",
        body: "Payments are processed through PayHere, our certified payment gateway. Wudo does not store your card details. We receive only a payment reference ID and confirmation status.",
      },
    ],
  },
  {
    id: "how-we-use-information",
    icon: Eye,
    color: "blue",
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "Platform Operations",
        body: "We use your data to operate the Wudo marketplace — enabling you to post listings, contact sellers, manage your account, and conduct transactions securely.",
      },
      {
        subtitle: "Personalisation",
        body: "We use browsing behavior and search history to surface relevant listings, personalised recommendations, and targeted promotional content within the platform.",
      },
      {
        subtitle: "Communications",
        body: "We send transactional emails for account activities (registration, password reset, verification), order confirmations, and optional marketing updates. You may opt out of marketing at any time.",
      },
      {
        subtitle: "Security & Fraud Prevention",
        body: "Usage data and behavioral signals help us detect suspicious activity, enforce our community standards, and protect users from scams or fraudulent listings.",
      },
    ],
  },
  {
    id: "data-sharing",
    icon: Share2,
    color: "purple",
    title: "Data Sharing & Disclosure",
    content: [
      {
        subtitle: "We Do Not Sell Your Data",
        body: "Wudo does not sell, rent, or trade your personal information to third parties for commercial purposes.",
      },
      {
        subtitle: "Service Providers",
        body: "We share limited data with trusted partners who help us operate the platform, including PayHere (payment processing), email delivery services, cloud hosting, and analytics tools.",
      },
      {
        subtitle: "Legal Compliance",
        body: "We may disclose information when required by Sri Lankan law, a court order, or to protect the rights, safety, and property of Wudo, our users, or the public.",
      },
      {
        subtitle: "Business Transfers",
        body: "If Wudo is acquired or merges with another entity, your data may be transferred as part of that transaction. We will notify you via email or a prominent notice on the platform.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: UserCheck,
    color: "amber",
    title: "Your Rights & Choices",
    content: [
      {
        subtitle: "Access & Portability",
        body: "You may request a copy of the personal data we hold about you at any time by contacting us at privacy@wudo.lk.",
      },
      {
        subtitle: "Correction",
        body: "You can update most of your personal information directly from your Account Settings page. For other corrections, contact our support team.",
      },
      {
        subtitle: "Deletion",
        body: "You may request deletion of your account and associated data. Some data may be retained for legal or fraud-prevention purposes. Use the Delete Account option in Settings or email privacy@wudo.lk.",
      },
      {
        subtitle: "Marketing Opt-Out",
        body: "Every marketing email contains an unsubscribe link. You can also manage notification preferences from your Account Settings.",
      },
    ],
  },
  {
    id: "data-security",
    icon: Lock,
    color: "rose",
    title: "Data Security",
    content: [
      {
        subtitle: "Encryption",
        body: "All data transmitted between your browser and Wudo servers is protected using TLS (HTTPS) encryption. Passwords are hashed using industry-standard bcrypt.",
      },
      {
        subtitle: "Access Controls",
        body: "Access to user data is strictly limited to authorised Wudo personnel with a legitimate business need. We employ role-based access controls and audit logging.",
      },
      {
        subtitle: "Incident Response",
        body: "In the event of a data breach that affects your personal information, we will notify you within 72 hours and take immediate remedial action.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Globe,
    color: "teal",
    title: "Cookies & Tracking",
    content: [
      {
        subtitle: "Essential Cookies",
        body: "We use strictly necessary cookies to maintain your session, remember your authentication state, and store your theme preference (light/dark mode).",
      },
      {
        subtitle: "Analytics Cookies",
        body: "With your consent, we use analytics cookies to understand how users interact with Wudo so we can improve the platform. You can opt out via your browser settings.",
      },
      {
        subtitle: "Third-Party Cookies",
        body: "PayHere and other integrated services may set their own cookies during the payment flow. Refer to their respective privacy policies for details.",
      },
    ],
  },
  {
    id: "notifications",
    icon: Bell,
    color: "orange",
    title: "Communications & Notifications",
    content: [
      {
        subtitle: "Transactional Notifications",
        body: "We send mandatory transactional emails for account events (email verification, password reset, payment confirmation, boost activation). These cannot be disabled.",
      },
      {
        subtitle: "Platform Updates",
        body: "Occasional emails about new features, policy changes, or important platform announcements. These can be managed in your notification preferences.",
      },
      {
        subtitle: "Marketing Emails",
        body: "Optional promotional emails about boost deals, featured listings, or tips for sellers. You can unsubscribe at any time from within the email or your Account Settings.",
      },
    ],
  },
  {
    id: "data-retention",
    icon: Trash2,
    color: "slate",
    title: "Data Retention",
    content: [
      {
        subtitle: "Active Accounts",
        body: "We retain your data for as long as your Wudo account is active or as needed to provide you with services.",
      },
      {
        subtitle: "Deleted Accounts",
        body: "Upon account deletion, personal data is removed within 30 days. Anonymised listing and transaction records may be retained for up to 7 years for legal and financial compliance.",
      },
      {
        subtitle: "Inactive Accounts",
        body: "Accounts with no activity for over 24 months may be subject to data minimisation, and you will be notified by email before any action is taken.",
      },
    ],
  },
];

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
  blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
  purple: "bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400",
  amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400",
  teal: "bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400",
  orange: "bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
  slate: "bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 dark:from-slate-950 dark:via-emerald-950/60 dark:to-slate-950 py-20 px-4">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, #10b981 0%, transparent 60%), radial-gradient(circle at 70% 30%, #059669 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-6">
            <Shield className="h-3.5 w-3.5" />
            Last Updated: September 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-5">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            At Wudo, we take your privacy seriously. This policy explains what data we collect, how we use it, and the rights you have over your information.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sticky Table of Contents */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                Contents
              </p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors group"
                  >
                    <ChevronRight className="h-3 w-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-3">
                  Questions about privacy?
                </p>
                <a
                  href="mailto:privacy@wudo.lk"
                  className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  privacy@wudo.lk
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Intro */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                This Privacy Policy applies to{" "}
                <strong className="text-slate-900 dark:text-white">Wudo</strong> ("we", "us",
                "our"), a peer-to-peer online ad marketplace operating in Sri Lanka. By using our
                platform, you agree to the collection and use of information in accordance with
                this policy.
              </p>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                We are committed to handling your personal data transparently, securely, and in
                accordance with applicable privacy laws. Please read this document carefully.
              </p>
            </div>

            {/* Sections */}
            {sections.map((section) => {
              const Icon = section.icon;
              const iconClass = colorMap[section.color] || colorMap.slate;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm scroll-mt-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2.5 rounded-xl ${iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-5">
                    {section.content.map((item) => (
                      <div key={item.subtitle}>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                          {item.subtitle}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Contact & Updates */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/5 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Policy Updates & Contact
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any
                significant changes via email or a prominent notice on the platform.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="mailto:privacy@wudo.lk"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                  privacy@wudo.lk
                </a>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:border-emerald-500/50 transition-colors"
                >
                  Visit Support Center
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
