"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { updateMyProfile } from "@/lib/api/users";
import { ExternalLink, UserCog, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, accessToken, loading, syncProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [publicProfile, setPublicProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }

    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName ?? "");
      setUsername(user.username ?? "");
      setBio(user.bio ?? "");
      setLocation(user.location ?? "");
      setPublicProfile(user.publicProfile);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken) {
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await updateMyProfile(accessToken, {
        firstName,
        lastName,
        username,
        bio,
        location,
        publicProfile,
      });

      if (updated) {
        setFirstName(updated.firstName ?? "");
        setLastName(updated.lastName ?? "");
        setUsername(updated.username ?? "");
        setBio(updated.bio ?? "");
        setLocation(updated.location ?? "");
        setPublicProfile(updated.publicProfile ?? true);
      }

      await syncProfile();
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Header Banner */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 border-2 border-white/20">
            {(user.firstName?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {user.firstName || user.email?.split("@")[0] || "User"} {user.lastName || ""}
              </h1>
              
              <span className="badge-emerald">
                {user.role}
              </span>

              {!user.emailVerified && (
                <span className="badge-indigo">
                  Email Unverified
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user.email} • Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {user.username && (
          <Link
            href={`/profile/${user.username}`}
            className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Profile</span>
          </Link>
        )}
      </div>

      {/* Main Settings Form Card */}
      <div className="glass-panel p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2.5">
          <UserCog className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Edit Personal Details</span>
        </h2>

        {/* Alerts */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. john_doe"
                className="input-field"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Colombo, Sri Lanka"
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Bio / About Me
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers and sellers a bit about yourself..."
              rows={4}
              maxLength={500}
              className="input-field resize-none"
            />
            <div className="text-right text-xs text-slate-400">
              {bio.length}/500 characters
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={publicProfile}
                onChange={(e) => setPublicProfile(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Publicly visible profile page
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm px-6 py-2.5"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>

    </main>
  );
}