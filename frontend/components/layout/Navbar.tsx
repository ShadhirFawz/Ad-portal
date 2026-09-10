"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/useToast";
import ThemeToggle from "@/components/layout/ThemeToggle";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Menu, X, ChevronDown, LogOut, User, Heart, Bookmark, Package, Settings } from "lucide-react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { info: toastInfo } = useToast();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <Image
              src="/Wudo_logo.png"
              alt="Wudo"
              width={400}
              height={400}
              priority
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span
              className="
                ml-0 max-w-0 overflow-hidden whitespace-nowrap
                text-base sm:text-lg font-bold tracking-[0.2em] uppercase
                text-slate-900 dark:text-white
                opacity-0
                transition-all duration-500 ease-out
                group-hover:ml-3 group-hover:max-w-[180px] group-hover:opacity-100
              "
              style={{ fontFamily: "'Quicksand', 'Calibri Light', sans-serif" }}
            >
              Wudo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/listings"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/listings")
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              style={{ fontFamily: "'PT Sans', 'Tahoma', sans-serif" }}
            >
              Explore
            </Link>

            {user && (
              <Link
                href="/my-listings"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/my-listings")
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                style={{ fontFamily: "'PT Sans', 'Tahoma', sans-serif" }}
              >
                My Listings
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              /* Desktop User Menu */
              <div className="hidden md:block relative profile-dropdown">
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/50 transition-all group"
                >
                  <ProfileAvatar
                    avatarUrl={user.avatarUrl}
                    firstName={user.firstName}
                    email={user.email}
                    size={28}
                  />
                  <span
                    className="text-sm font-normal text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors hidden lg:inline"
                    style={{ fontFamily: "'PT Sans', 'Tahoma', sans-serif" }}
                  >
                    {user.firstName || user.email?.split("@")[0] || "Account"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                  {!user.emailVerified && (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                      title="Email verification pending"
                    />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {user.firstName || "User"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/my-listings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        My Listings
                      </Link>
                      <Link
                        href="/favorites"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Favorites
                      </Link>
                      <Link
                        href="/bookmarks"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                        Bookmarks
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <hr className="my-1 border-slate-100 dark:border-slate-800" />
                      <button
                        onClick={async () => {
                          await logout();
                          toastInfo("Signed Out", "You have been logged out of your account.");
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Auth Buttons */
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-normal text-slate-700 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400 px-3 py-2 transition-colors"
                  style={{ fontFamily: "'PT Sans', 'Tahoma', sans-serif" }}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm shadow-sm px-4 py-2"
                  style={{ fontFamily: "'PT Sans', 'Tahoma', sans-serif" }}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <div className="fixed right-3 top-20 bottom-3 w-80 max-w-[85vw] bg-white dark:bg-slate-900 z-50 md:hidden overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
              <div className="flex flex-col p-4 space-y-1">
                {/* Navigation Links */}
                <Link
                  href="/listings"
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive("/listings")
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore Listings
                </Link>

                {user ? (
                  <>
                    {/* User Profile Section */}
                    <div className="px-4 py-3 my-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          avatarUrl={user.avatarUrl}
                          firstName={user.firstName}
                          email={user.email}
                          size={44}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {user.firstName || "User"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user.email}
                          </p>
                          {!user.emailVerified && (
                            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                              ⚠️ Verify email
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Profile
                    </Link>
                    <Link
                      href="/my-listings"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="w-5 h-5" />
                      My Listings
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5" />
                      Favorites
                    </Link>
                    <Link
                      href="/bookmarks"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bookmark className="w-5 h-5" />
                      Bookmarks
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </Link>
                    <hr className="my-2 border-slate-200 dark:border-slate-800" />
                    <button
                      onClick={async () => {
                        await logout();
                        toastInfo("Signed Out", "You have been logged out of your account.");
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  /* Mobile Auth Buttons */
                  <div className="space-y-2 pt-2">
                    <Link
                      href="/login"
                      className="block w-full px-4 py-3 rounded-xl text-sm font-semibold text-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      style={{ fontFamily: "'PT Sans', 'Tahoma', sans-serif" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full px-4 py-3 rounded-xl text-sm font-semibold text-center text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                      style={{ fontFamily: "'PT Sans', 'Tahoma', sans-serif" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  );
}