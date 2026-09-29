"use client";

import { useState, useEffect, Suspense, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import {
  Store,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MessageSquare,
  BadgeCheck,
  Lock,
  Zap,
  HelpCircle,
} from "lucide-react";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

function BecomeSellerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/profile";
  const { user, loading: authLoading, becomeSeller, refreshSession } = useAuth();
  const { success, error: toastError } = useToast();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isWhatsapp, setIsWhatsapp] = useState(true);
  const [preferredContactMethod, setPreferredContactMethod] = useState<"BOTH" | "CALL" | "WHATSAPP">("BOTH");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Pre-fill phone number if the user already has one on file
  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  // If user is already a seller or admin, let them jump straight to posting
  const isAlreadySeller = user?.role === "SELLER" || user?.role === "ADMIN";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone) {
      setFormError("Phone number is required so buyers can contact you.");
      return;
    }

    if (!/^\+?[0-9\s\-()]{7,20}$/.test(trimmedPhone)) {
      setFormError("Please enter a valid phone number (e.g., +1 234 567 8900).");
      return;
    }

    if (!acceptTerms) {
      setFormError("You must agree to the Seller Terms of Service to activate your seller account.");
      return;
    }

    setSubmitting(true);
    try {
      await becomeSeller({
        phoneNumber: trimmedPhone,
        acceptTerms: true,
        isWhatsapp,
        preferredContactMethod,
      });

      await refreshSession?.().catch(() => { });
      success("Seller account activated! Welcome to the marketplace.");
      router.push(nextUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to activate seller account. Please try again.";
      setFormError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign In to Start Selling</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Create an account or sign in to activate your seller profile and post your first ad in minutes.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href={`/login?redirect=${encodeURIComponent(`/become-a-seller?next=${encodeURIComponent(nextUrl)}`)}`}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-sm hover:shadow text-center text-sm"
            >
              Sign In to Continue
            </Link>
            <Link
              href={`/register?redirect=${encodeURIComponent(`/become-a-seller?next=${encodeURIComponent(nextUrl)}`)}`}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition text-center text-sm"
            >
              Create a Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isAlreadySeller) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-emerald-500/30 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">You're Already a Seller!</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your account is fully activated with seller privileges. You can create listings, manage buyer inquiries, and boost your ads anytime.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={nextUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-md text-sm"
            >
              <span>Continue to Post Ad</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/my-listings"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium rounded-xl transition text-sm"
            >
              My Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Start Selling on Marketplace
          </h1>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Confirm your contact details so buyers can reach you. Once activated, you can immediately post items, vehicles, properties, or services.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Instant Activation</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                No waiting period or complicated verification. Flip your role and start posting immediately.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Direct Inquiries</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Genuine buyers reach you directly by phone call or WhatsApp message.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Protected Platform</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Trusted marketplace ecosystem with spam protection and community moderation.
              </p>
            </div>
          </div>
        </div>

        {/* Main Setup Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Seller Contact Information</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                This phone number will be displayed on your listings for interested buyers.
              </p>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
                <Lock className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <p className="font-semibold">Setup Issue</p>
                  <p className="text-xs mt-0.5">{formError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Phone Number Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Primary Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +94 77 123 4567 or +1 555 0199"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Include country code if selling across regions (e.g. +1, +44, +94).
                </p>
              </div>

              {/* WhatsApp & Preferences */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <input
                    id="whatsapp-toggle"
                    type="checkbox"
                    checked={isWhatsapp}
                    onChange={(e) => setIsWhatsapp(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <label htmlFor="whatsapp-toggle" className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium cursor-pointer select-none">
                    <span className="font-semibold text-slate-900 dark:text-white">Enable WhatsApp on this number</span> — buyers can start a WhatsApp chat with you in one click.
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Preferred Contact Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: "BOTH", label: "Calls & WhatsApp", icon: FaWhatsapp },
                      { id: "CALL", label: "Phone Calls Only", icon: FaPhoneAlt },
                      { id: "WHATSAPP", label: "WhatsApp Only", icon: FaWhatsapp },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPreferredContactMethod(opt.id as any)}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${preferredContactMethod === opt.id
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                      >
                        <opt.icon className="w-4 h-4" />
                        <span className="text-xs font-semibold">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seller Terms Acceptance */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    required
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500 focus:ring-offset-0 flex-shrink-0"
                  />
                  <label htmlFor="terms-checkbox" className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                    I have read and agree to the{" "}
                    <Link
                      href="/terms-of-service"
                      target="_blank"
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      Terms of Service
                    </Link>{" "}
                    and {" "}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-5 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition text-center"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting || !acceptTerms}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition text-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Activating Seller Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Activate & Proceed</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Footer FAQ hint */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 pb-8">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need assistance? Visit our <Link href="/support" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Seller Support Desk</Link></span>
        </div>

      </div>
    </div>
  );
}

export default function BecomeSellerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      }
    >
      <BecomeSellerContent />
    </Suspense>
  );
}
