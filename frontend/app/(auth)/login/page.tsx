"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import { Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { validateLoginForm } from "@/lib/validation/authValidation";
import { getSafeRedirectUrl } from "@/lib/utils/redirect";
import GoogleIcon from "@/components/common/GoogleIcon";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || searchParams.get("returnUrl");
  const { login, loginWithGoogle } = useAuth();
  const { error: toastError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const fieldClass = (key: string) => 
    `w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${fieldErrors[key] ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : ""}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const errs = validateLoginForm({ email, password });
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await login(email, password);
      const target = getSafeRedirectUrl(redirectParam, "/");
      router.push(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-5 glass-panel p-6 md:p-8 relative">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your credentials to access your account
          </p>
        </div>


        {/* Google Sign-In Button */}
        <button
          type="button"
          disabled={googleLoading || submitting}
          onClick={async () => {
            setGoogleLoading(true);
            try {
              const next = getSafeRedirectUrl(redirectParam, "/");
              await loginWithGoogle(next);
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Google sign-in failed.";
              toastError("Sign-in Failed", msg);
              setGoogleLoading(false);
            }
          }}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {googleLoading ? (
            <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
              className={fieldClass("email")}
              required
            />
            {fieldErrors.email && <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                className={`${fieldClass("password")} pr-9`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2 text-sm font-semibold mt-1"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-3 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          Don&apos;t have an account?{" "}
          <Link
            href={redirectParam ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register"}
            className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
          >
            Create one now
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            Loading login...
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}