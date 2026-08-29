"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { UserPlus, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { validateRegisterForm, RegisterFormData } from "@/lib/validation/authValidation";
import { getPasswordStrength } from "@/lib/validation/passwordStrength";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const strength = getPasswordStrength(password);

  const fieldClass = (key: string) =>
    `w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all ${
      fieldErrors[key] ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : ""
    }`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData: RegisterFormData = {
      firstName,
      lastName: lastName || undefined,
      email,
      phoneNumber: phoneNumber || undefined,
      password,
    };
    const errs = validateRegisterForm(formData);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await signUp(email.trim().toLowerCase(), password, {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-5 glass-panel p-6 md:p-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2 border border-indigo-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join thousands of buyers and sellers in your area
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* First Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setFieldErrors((p) => ({ ...p, firstName: "" }));
                }}
                className={fieldClass("firstName")}
                autoComplete="given-name"
              />
              {fieldErrors.firstName && (
                <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.firstName}</p>
              )}
            </div>
            {/* Last Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setFieldErrors((p) => ({ ...p, lastName: "" }));
                }}
                className={fieldClass("lastName")}
                autoComplete="family-name"
              />
              {fieldErrors.lastName && (
                <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((p) => ({ ...p, email: "" }));
              }}
              className={fieldClass("email")}
              autoComplete="email"
            />
            {fieldErrors.email && <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Phone Number{" "}
              <span className="font-normal text-slate-400 normal-case">(optional · E.164)</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+94771234567"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setFieldErrors((p) => ({ ...p, phoneNumber: "" }));
              }}
              className={fieldClass("phoneNumber")}
              autoComplete="tel"
            />
            {fieldErrors.phoneNumber ? (
              <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.phoneNumber}</p>
            ) : (
              <p className="text-[10px] text-slate-400">Include country code, e.g. +94 77 123 4567</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 chars with uppercase, digit & symbol"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((p) => ({ ...p, password: "" }));
                }}
                className={`${fieldClass("password")} pr-9`}
                autoComplete="new-password"
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
            {/* Strength bar */}
            {password && (
              <div className="space-y-0.5 pt-0.5">
                <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: strength.width }}
                  />
                </div>
                <p
                  className={`text-[10px] font-medium ${
                    strength.label === "Very Strong" || strength.label === "Strong"
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
            {fieldErrors.password && <p className="text-[10px] text-rose-500 mt-0.5">{fieldErrors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2 text-sm font-semibold mt-1"
          >
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-3 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </main>
  );
}