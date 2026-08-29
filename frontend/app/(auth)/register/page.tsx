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

  const fieldClass = (key: string) => `input-field ${fieldErrors[key] ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : ""}`;

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
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8 glass-panel p-8 md:p-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Your Account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Join thousands of buyers and sellers in your area</p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">First Name *</label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: "" })); }}
                className={fieldClass("firstName")}
                autoComplete="given-name"
              />
              {fieldErrors.firstName && <p className="text-xs text-rose-500 mt-1">{fieldErrors.firstName}</p>}
            </div>
            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Last Name</label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: "" })); }}
                className={fieldClass("lastName")}
                autoComplete="family-name"
              />
              {fieldErrors.lastName && <p className="text-xs text-rose-500 mt-1">{fieldErrors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address *</label>
            <input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
              className={fieldClass("email")}
              autoComplete="email"
            />
            {fieldErrors.email && <p className="text-xs text-rose-500 mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Phone Number <span className="font-normal text-slate-400 normal-case">(optional · E.164)</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="+94771234567"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setFieldErrors((p) => ({ ...p, phoneNumber: "" })); }}
              className={fieldClass("phoneNumber")}
              autoComplete="tel"
            />
            {fieldErrors.phoneNumber ? (
              <p className="text-xs text-rose-500 mt-1">{fieldErrors.phoneNumber}</p>
            ) : (
              <p className="text-xs text-slate-400">Include country code, e.g. +94 77 123 4567</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password *</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 chars with uppercase, digit & symbol"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
                className={`${fieldClass("password")} pr-11`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength bar */}
            {password && (
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                </div>
                <p className={`text-xs font-medium ${strength.label === "Very Strong" || strength.label === "Strong" ? "text-emerald-500" : strength.label === "Fair" ? "text-amber-500" : "text-rose-500"}`}>{strength.label}</p>
              </div>
            )}
            {fieldErrors.password && <p className="text-xs text-rose-500 mt-1">{fieldErrors.password}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-base mt-2">
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          Already have an account? <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors">Sign in instead</Link>
        </div>
      </div>
    </main>
  );
}