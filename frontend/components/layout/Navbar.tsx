"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import ThemeToggle from "@/components/layout/ThemeToggle";
import ProfileAvatar from "@/components/profile/ProfileAvatar";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              Market<span className="gradient-text-primary">place</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase">
              Ad Portal
            </span>
          </div>
        </Link>

        {/* Right Navigation */}
        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/listings"
            className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg"
          >
            Explore
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/50 transition-all group"
              >
                <ProfileAvatar
                  avatarUrl={user.avatarUrl}
                  firstName={user.firstName}
                  email={user.email}
                  size={28}
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {user.firstName || user.email?.split("@")[0] || "Account"}
                </span>
                {!user.emailVerified && (
                  <span
                    className="w-2 h-2 rounded-full bg-amber-500"
                    title="Email verification pending"
                  />
                )}
              </Link>

              <button
                onClick={() => logout()}
                className="text-xs font-semibold text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 px-3 py-2 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400 px-4 py-2 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm shadow-sm px-4 py-2"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
