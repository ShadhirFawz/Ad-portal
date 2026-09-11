"use client";

import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { validatePassword } from "@/lib/validation/authValidation";
import { getPasswordStrength } from "@/lib/validation/passwordStrength";
import {
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

const PASSWORD_CRITERIA = [
  "At least 8 characters",
  "One uppercase letter (A–Z)",
  "One lowercase letter (a–z)",
  "One number (0–9)",
  "One special character (!@#$…)",
];

function ResetPasswordContent() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    const supabase = createClient();
    let resolved = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (resolved) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        resolved = true;
        setSessionReady(true);
        setCheckingSession(false);
        return;
      }

      // Also accept an already-established recovery session (e.g. fast page load)
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        // Only treat as recovery if we arrived here from the reset flow
        // (no app-level user is set because AuthProvider skips PASSWORD_RECOVERY)
        resolved = true;
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    // Fallback: if the event already fired before we subscribed, check getSession
    supabase.auth.getSession().then(({ data }) => {
      if (resolved) return;
      if (data.session) {
        resolved = true;
        setSessionReady(true);
      } else {
        setError(
          "This reset link is invalid or has expired. Please request a new one."
        );
      }
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const pwErr = validatePassword(newPassword);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateErr) throw new Error(updateErr.message);

      setDone(true);
      toastSuccess(
        "Password Reset",
        "Your password has been updated. Please sign in."
      );

      // Sign out the temporary recovery session and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to reset password.";
      setError(msg);
      toastError("Reset Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const strengthColors: Record<string, string> = {
    "Very Weak": "bg-rose-500",
    Weak: "bg-orange-500",
    Fair: "bg-amber-500",
    Strong: "bg-emerald-400",
    "Very Strong": "bg-emerald-500",
  };

  const inputClass = (hasErr = false) =>
    `w-full rounded-xl border ${hasErr
      ? "border-rose-500 focus:ring-rose-500/20"
      : "border-slate-200 dark:border-slate-800 focus:ring-emerald-500/30 focus:border-emerald-500"
    } bg-white dark:bg-slate-900 px-3.5 py-3 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-2 transition-all`;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-6 glass-panel p-7 md:p-9">
        {/* Header */}
        <div className="text-center space-y-1">
          <Image
            src="/Wudo_logo_light.png"
            alt="Wudo"
            width={160}
            height={40}
            priority
            className="h-10 w-auto object-contain mx-auto mb-3 dark:hidden"
          />
          <Image
            src="/Wudo_logo_dark.png"
            alt="Wudo"
            width={160}
            height={40}
            priority
            className="h-10 w-auto object-contain mx-auto mb-3 hidden dark:block"
          />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Set New Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose a strong password for your account.
          </p>
        </div>

        {/* Loading session check */}
        {checkingSession && (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-500 text-sm">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            Verifying reset link...
          </div>
        )}

        {/* Invalid / expired link */}
        {!checkingSession && !sessionReady && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-center">
              <AlertTriangle className="w-9 h-9 text-rose-500" />
              <div>
                <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                  Link Invalid or Expired
                </p>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {error}
                </p>
              </div>
            </div>
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="btn-primary inline-flex px-5 py-2 text-sm"
              >
                Request New Link
              </Link>
            </div>
          </div>
        )}

        {/* Success state */}
        {!checkingSession && done && (
          <div className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Password Updated!
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Redirecting you to sign in...
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {!checkingSession && sessionReady && !done && (
          <>
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <label
                    htmlFor="new-password"
                    className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowHint(true)}
                      onMouseLeave={() => setShowHint(false)}
                      onFocus={() => setShowHint(true)}
                      onBlur={() => setShowHint(false)}
                      className="text-slate-400 hover:text-emerald-500 transition-colors"
                      aria-label="Password requirements"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    {showHint && (
                      <div className="absolute left-5 top-0 z-20 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                        <p className="font-bold text-slate-900 dark:text-white mb-1">
                          Requirements
                        </p>
                        {PASSWORD_CRITERIA.map((c) => (
                          <p key={c} className="flex items-start gap-1.5">
                            <span className="mt-0.5 text-emerald-500">•</span>
                            {c}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    autoComplete="new-password"
                    className={inputClass(false)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Strength bar */}
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength.score
                              ? strengthColors[strength.label] ?? "bg-slate-300"
                              : "bg-slate-200 dark:bg-slate-700"
                            }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-[10px] font-semibold ${strength.label === "Very Strong" ||
                          strength.label === "Strong"
                          ? "text-emerald-500"
                          : strength.label === "Fair"
                            ? "text-amber-500"
                            : "text-rose-500"
                        }`}
                    >
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label
                  htmlFor="confirm-password"
                  className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    autoComplete="new-password"
                    className={inputClass(
                      !!confirmPassword && confirmPassword !== newPassword
                    )}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-[10px] text-rose-500 mt-0.5">
                    Passwords do not match.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
                className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Back link */}
        {!done && (
          <div className="pt-1 text-center">
            <Link
              href="/login"
              className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}
