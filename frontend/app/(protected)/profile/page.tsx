"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { ExternalLink, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Cover Photo Section */}
      <div className="glass-panel overflow-hidden">
        {/* Cover Photo Banner */}
        {user.coverPhotoUrl ? (
          <div className="h-32 sm:h-48 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.coverPhotoUrl}
              alt="Cover photo"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 sm:h-48 bg-linear-to-r from-emerald-600 via-teal-600 to-indigo-700" />
        )}

        {/* Profile Card Body */}
        <div className="p-6 sm:p-8 relative pt-0">
          
          {/* Avatar Badge Overlapping Banner */}
          <div className="-mt-16 sm:-mt-20 mb-4 flex items-end justify-between flex-wrap gap-4">
            {user.avatarUrl ? (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-200 dark:bg-slate-700 text-white font-bold text-4xl sm:text-5xl flex items-center justify-center border-4 border-white dark:border-[#0b0f19] shadow-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl}
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-900 text-white font-bold text-4xl sm:text-5xl flex items-center justify-center border-4 border-white dark:border-[#0b0f19] shadow-xl">
                {user.firstName[0]?.toUpperCase()}
              </div>
            )}

            <span className="badge-emerald px-3 py-1 text-sm">
              {user.role === "ADMIN" ? "Admin" : "Member"}
            </span>
          </div>

          {/* Name & Handle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {user.firstName} {user.lastName ?? ""}
            </h1>
            {user.username && (
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                @{user.username}
              </p>
            )}
          </div>

          {/* Location & Meta info */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            {user.location && (
              <span className="flex items-center gap-1">
                📍 {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              📅 Joined {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                About
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {user.bio}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 flex-wrap">
            <Link
              href="/profile/edit"
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>

            {user.username && user.publicProfile && (
              <Link
                href={`/profile/${user.username}`}
                className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Profile</span>
              </Link>
            )}
          </div>
        </div>
      </div>

    </main>
  );
}