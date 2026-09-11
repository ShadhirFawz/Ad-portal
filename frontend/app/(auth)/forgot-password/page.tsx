"use client";

import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import { AlertTriangle, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

function ForgotPasswordContent() {
  const { requestPasswordReset } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
      toastSuccess(
        "Reset Email Sent",
        "Check your inbox for the password reset link."
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to send reset email.";
      setError(msg);
      toastError("Request Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm glass-panel p-7 md:p-8">
        {/* Header */}
        <div className="text-center">
          <Image
            src="/Wudo_logo_light.png"
            alt="Wudo"
            width={160}
            height={40}
            priority
            className="h-9 w-auto object-contain mx-auto dark:hidden"
          />
          <Image
            src="/Wudo_logo_dark.png"
            alt="Wudo"
            width={160}
            height={40}
            priority
            className="h-9 w-auto object-contain mx-auto hidden dark:block"
          />
          <h1 className="mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Forgot your password?
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Enter your account email and we&apos;ll send a reset link.
          </p>
        </div>

        {/* Body */}
        <div className="mt-6">
          {sent ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    Check your inbox
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 leading-relaxed">
                    A reset link has been sent to <strong>{email}</strong>. Click
                    it to set a new password.
                  </p>
                </div>
              </div>
              <p className="text-center text-[11px] text-slate-400">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 underline"
                  onClick={() => setSent(false)}
                >
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="reset-email"
                    className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3.5 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-2.5 text-sm font-semibold"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        </main>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}