"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import { validatePassword } from "@/lib/validation/authValidation";
import { getPasswordStrength } from "@/lib/validation/passwordStrength";
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowLeft,
  User,
  Settings as SettingsIcon,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

type SettingsTab = "general" | "security";

function SettingsContent() {
  const router = useRouter();
  const { user, loading, updatePassword } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(newPassword);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-20 min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Loading settings...
        </div>
      </main>
    );
  }

  if (!user) {
    router.replace("/login?redirect=/settings");
    return null;
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};

    // Validate new password using auth validation rules
    const pwValidationErr = validatePassword(newPassword);
    if (pwValidationErr) {
      errors.newPassword = pwValidationErr;
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (currentPassword && currentPassword === newPassword) {
      errors.newPassword = "New password must be different from current password.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setPasswordSaving(true);
    try {
      await updatePassword(
        newPassword,
        currentPassword.trim() ? currentPassword : undefined
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Your password has been changed successfully.");
      toastSuccess(
        "Password Updated",
        "Your account password has been changed successfully."
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update password.";
      setPasswordError(msg);
      toastError("Update Failed", msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  const fieldClass = (key: string) =>
    `w-full rounded-xl border bg-white dark:bg-slate-900 px-3.5 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all ${
      fieldErrors[key]
        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
        : "border-slate-200 dark:border-slate-800"
    }`;

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>
        <Link
          href="/profile/edit"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <span>Edit Personal Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Account Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Manage your credentials, password security, and account preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-left ${
              activeTab === "general"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>General &amp; Password</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-left ${
              activeTab === "security"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Security &amp; Privacy</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === "general" && (
            <>
              {/* Account Overview Summary */}
              <div className="glass-panel p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>Account Profile</span>
                  </div>
                  <span className="badge-emerald text-xs">
                    {user.emailVerified ? "Verified Account" : "Active Member"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Full Name</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {user.firstName} {user.lastName || ""}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Email Address</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Username</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {user.username ? `@${user.username}` : "Not set"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <p className="text-slate-400 font-medium">Public Profile</p>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {user.publicProfile ? "Visible to Everyone" : "Private"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CHANGE PASSWORD CARD */}
              <div className="glass-panel p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Change Password
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update your account password securely via Supabase Auth
                    </p>
                  </div>
                </div>

                {passwordSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
                  {/* Current Password Field */}
                  <div className="space-y-1">
                    <label
                      htmlFor="currentPassword"
                      className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Current Password (Optional if OAuth)
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password if applicable"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setFieldErrors((p) => ({ ...p, currentPassword: "" }));
                        }}
                        className={`${fieldClass("currentPassword")} pr-10`}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.currentPassword && (
                      <p className="text-[10px] text-rose-500 mt-0.5">
                        {fieldErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <label
                        htmlFor="newPassword"
                        className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                      >
                        New Password *
                      </label>
                      <div className="relative group inline-flex items-center">
                        <button
                          type="button"
                          tabIndex={0}
                          aria-label="Password criteria"
                          className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:outline-none focus:text-emerald-600 cursor-help"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>

                        {/* Criteria Tooltip */}
                        <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:flex group-focus-within:flex flex-col w-56 p-3 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs shadow-2xl border border-slate-700/60 backdrop-blur-md z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          <p className="font-bold text-[11px] text-emerald-400 mb-1.5">
                            Password Requirements:
                          </p>
                          <ul className="space-y-1 text-[11px] text-slate-200">
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span>At least 8 characters</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span>1 uppercase letter (A–Z)</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span>1 lowercase letter (a–z)</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span>1 number (0–9)</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                              <span>1 special character (e.g. !@#$)</span>
                            </li>
                          </ul>
                          <div className="absolute left-2.5 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900/95 dark:border-t-slate-800/95" />
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Min. 8 chars with uppercase, digit & symbol"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setFieldErrors((p) => ({ ...p, newPassword: "" }));
                        }}
                        className={`${fieldClass("newPassword")} pr-10`}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="space-y-0.5 pt-1">
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                            style={{ width: strength.width }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span
                            className={`font-semibold ${
                              strength.label === "Very Strong" ||
                              strength.label === "Strong"
                                ? "text-emerald-500"
                                : strength.label === "Fair"
                                ? "text-amber-500"
                                : "text-rose-500"
                            }`}
                          >
                            Strength: {strength.label}
                          </span>
                          <span className="text-slate-400">
                            {newPassword.length} characters
                          </span>
                        </div>
                      </div>
                    )}

                    {fieldErrors.newPassword && (
                      <p className="text-[10px] text-rose-500 mt-0.5">
                        {fieldErrors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <label
                      htmlFor="confirmPassword"
                      className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                        }}
                        className={`${fieldClass("confirmPassword")} pr-10`}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        aria-label={
                          showConfirmPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[10px] text-rose-500 mt-0.5">
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-[11px] text-slate-400">
                      You will receive a security confirmation email upon update.
                    </p>

                    <button
                      type="submit"
                      disabled={passwordSaving || !newPassword || !confirmPassword}
                      className="btn-primary text-xs sm:text-sm px-6 py-2.5 font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                    >
                      {passwordSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <div className="glass-panel p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Security &amp; Privacy
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control your account security protocols and data visibility
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Authentication Provider
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Managed securely via Supabase Auth with JWT token verification.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      Public Profile Visibility
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Allow other buyers and sellers to discover your active ads and public seller profile.
                    </p>
                  </div>
                  <Link
                    href="/profile/edit"
                    className="btn-outline text-xs px-3 py-1.5 shrink-0 flex items-center gap-1"
                  >
                    <span>Manage</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex items-center justify-center py-20 min-h-[50vh]">
          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            Loading settings...
          </div>
        </main>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
