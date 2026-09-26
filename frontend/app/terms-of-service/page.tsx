import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  CreditCard,
  Scale,
  UserX,
  RefreshCw,
  AlertTriangle,
  Gavel,
  Mail,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Wudo",
  description:
    "Read Wudo's Terms of Service. Understand your rights and responsibilities when using our peer-to-peer ad marketplace platform.",
};

const sections = [
  {
    id: "acceptance",
    icon: CheckCircle2,
    color: "emerald",
    title: "Acceptance of Terms",
    content: [
      {
        subtitle: "Agreement to Terms",
        body: "By accessing or using Wudo (wudo.lk), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the platform.",
      },
      {
        subtitle: "Eligibility",
        body: "You must be at least 18 years of age to use Wudo. By using the platform, you represent that you are of legal age to form a binding contract in Sri Lanka.",
      },
      {
        subtitle: "Modifications",
        body: "Wudo reserves the right to modify these Terms at any time. We will notify users of material changes via email or a site notice. Continued use of the platform after notification constitutes acceptance of the updated Terms.",
      },
    ],
  },
  {
    id: "user-accounts",
    icon: UserX,
    color: "blue",
    title: "User Accounts",
    content: [
      {
        subtitle: "Account Registration",
        body: "To post listings or access premium features, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account details updated.",
      },
      {
        subtitle: "Account Security",
        body: "You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. Notify us immediately of any unauthorised use at support@wudo.lk.",
      },
      {
        subtitle: "One Account Per Person",
        body: "Each user may maintain only one active account. Creating multiple accounts to circumvent suspension, restrictions, or gain unfair advantages is prohibited and may result in permanent bans.",
      },
      {
        subtitle: "Account Verification",
        body: "We may require identity or contact verification before allowing certain actions such as posting listings, purchasing boosts, or withdrawing funds. Failure to verify may result in restricted access.",
      },
    ],
  },
  {
    id: "listings",
    icon: FileText,
    color: "purple",
    title: "Listings & Content",
    content: [
      {
        subtitle: "Your Responsibility",
        body: "You are solely responsible for all content you post on Wudo, including listings, images, descriptions, and communications. You must ensure your content is accurate, lawful, and not misleading.",
      },
      {
        subtitle: "Prohibited Listings",
        body: "You may not list: illegal goods or services; counterfeit items; weapons or explosives; controlled substances; adult content; stolen property; live animals (without proper permits); or any item that violates Sri Lankan law.",
      },
      {
        subtitle: "Content Standards",
        body: "Listings must be in English or Sinhala, include clear images of the actual item, have an honest description, and accurate pricing. Spam listings, duplicate ads, or misleading content will be removed.",
      },
      {
        subtitle: "Moderation",
        body: "Wudo reserves the right to review, edit, or remove any listing that violates these Terms or our community standards, without prior notice. Repeated violations may result in account suspension.",
      },
    ],
  },
  {
    id: "transactions",
    icon: CreditCard,
    color: "amber",
    title: "Transactions & Payments",
    content: [
      {
        subtitle: "Buyer & Seller Responsibility",
        body: "Wudo is a marketplace platform that facilitates connections between buyers and sellers. We are not a party to any transaction between users. Buyers and sellers transact at their own risk.",
      },
      {
        subtitle: "Payment Processing",
        body: "Ad boost payments are processed securely via PayHere. By completing a purchase, you agree to PayHere's terms of service. Wudo does not store card details.",
      },
      {
        subtitle: "Boost Refunds",
        body: "Ad boost purchases are non-refundable once a boost has been activated and your listing has received promotional visibility. Refunds may be considered at our sole discretion for technical failures on our part.",
      },
      {
        subtitle: "Pricing",
        body: "All prices on Wudo are in Sri Lankan Rupees (LKR) unless otherwise stated. Boost prices are subject to change. The price at the time of checkout is binding for that transaction.",
      },
    ],
  },
  {
    id: "prohibited",
    icon: XCircle,
    color: "rose",
    title: "Prohibited Conduct",
    content: [
      {
        subtitle: "Fraud & Scams",
        body: "You must not engage in any fraudulent activity, including misrepresenting yourself, offering fake listings, conducting advance-fee scams, or impersonating other users or Wudo staff.",
      },
      {
        subtitle: "Harassment",
        body: "Harassment, abuse, threats, or discriminatory behavior toward other users is strictly prohibited and may result in immediate account termination and referral to law enforcement.",
      },
      {
        subtitle: "Platform Abuse",
        body: "You must not scrape data, use automated bots, attempt to reverse-engineer the platform, overload our servers, or exploit security vulnerabilities. Doing so may result in civil or criminal liability.",
      },
      {
        subtitle: "Spam",
        body: "Sending unsolicited messages, posting identical or near-identical listings in bulk, or using the platform for commercial email campaigns is prohibited.",
      },
    ],
  },
  {
    id: "intellectual-property",
    icon: ShieldAlert,
    color: "indigo",
    title: "Intellectual Property",
    content: [
      {
        subtitle: "Wudo's Rights",
        body: "The Wudo brand, logo, platform design, code, and proprietary features are owned by Wudo and protected by copyright and trademark laws. You may not use them without written permission.",
      },
      {
        subtitle: "Your Content Licence",
        body: "By posting content on Wudo, you grant us a non-exclusive, royalty-free, worldwide licence to display, reproduce, and distribute that content for the purpose of operating and promoting the platform.",
      },
      {
        subtitle: "Reporting Infringement",
        body: "If you believe your intellectual property has been infringed on the platform, please contact legal@wudo.lk with details of the alleged infringement.",
      },
    ],
  },
  {
    id: "disclaimers",
    icon: AlertTriangle,
    color: "orange",
    title: "Disclaimers & Liability",
    content: [
      {
        subtitle: "Platform 'As Is'",
        body: "Wudo is provided on an 'as is' and 'as available' basis. We make no warranties, express or implied, regarding the reliability, accuracy, or availability of the platform.",
      },
      {
        subtitle: "Limitation of Liability",
        body: "To the maximum extent permitted by law, Wudo shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform or transactions with other users.",
      },
      {
        subtitle: "Third-Party Actions",
        body: "Wudo is not responsible for the actions, listings, or conduct of any third-party users. We do not verify the identity of every user or the accuracy of every listing.",
      },
    ],
  },
  {
    id: "termination",
    icon: RefreshCw,
    color: "teal",
    title: "Account Termination",
    content: [
      {
        subtitle: "Termination by You",
        body: "You may close your account at any time from the Account Settings page. Closing your account will remove your listings and profile, subject to our data retention policy.",
      },
      {
        subtitle: "Termination by Wudo",
        body: "Wudo reserves the right to suspend or terminate your account immediately, without notice, if you violate these Terms or engage in conduct that is harmful to the platform or its users.",
      },
      {
        subtitle: "Effect of Termination",
        body: "Upon termination, your right to use the platform ceases immediately. Active boost subscriptions will not be refunded following termination due to policy violations.",
      },
    ],
  },
  {
    id: "governing-law",
    icon: Gavel,
    color: "slate",
    title: "Governing Law & Disputes",
    content: [
      {
        subtitle: "Applicable Law",
        body: "These Terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka, without regard to its conflict of law provisions.",
      },
      {
        subtitle: "Dispute Resolution",
        body: "Any disputes arising from these Terms or your use of Wudo shall first be subject to good-faith negotiation. If unresolved, disputes shall be settled by arbitration in Colombo, Sri Lanka.",
      },
      {
        subtitle: "Class Action Waiver",
        body: "You agree that any dispute resolution proceedings will be conducted on an individual basis only, and not as part of a class or representative action.",
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
  indigo: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400",
  orange: "bg-orange-500/10 text-orange-600 dark:bg-orange-400/10 dark:text-orange-400",
  teal: "bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400",
  slate: "bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-24">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/60 dark:to-slate-950 py-20 px-4">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 75% 30%, #4f46e5 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300 mb-6">
            <Scale className="h-3.5 w-3.5" />
            Effective: September 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-5">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Please read these Terms carefully before using Wudo. They govern your use of our platform and outline the rules and responsibilities of both parties.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sticky Table of Contents */}
          <aside className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                Sections
              </p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors group"
                  >
                    <ChevronRight className="h-3 w-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 mb-3">Need legal support?</p>
                <a
                  href="mailto:legal@wudo.lk"
                  className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  legal@wudo.lk
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Important Notice */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-6 flex gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  Important Notice
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400/80 leading-relaxed">
                  These Terms of Service constitute a legally binding agreement between you and Wudo. By creating an account or using our platform, you accept all terms outlined below.
                </p>
              </div>
            </div>

            {/* Intro */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Welcome to <strong className="text-slate-900 dark:text-white">Wudo</strong>, a peer-to-peer ad marketplace platform based in Sri Lanka. These Terms of Service ("Terms") govern your access to and use of the Wudo website, applications, and services.
              </p>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                Wudo acts solely as a platform connecting buyers and sellers. We are not involved in the actual transactions between users and make no representations about the quality, safety, or legality of items listed.
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

            {/* Contact */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/5 p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Questions About These Terms?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                If you have questions about these Terms of Service, please contact us. Our legal team typically responds within 2 business days.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:legal@wudo.lk"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                  legal@wudo.lk
                </a>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:border-indigo-500/50 transition-colors"
                >
                  Visit Support Center
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:border-indigo-500/50 transition-colors"
                >
                  Privacy Policy
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
