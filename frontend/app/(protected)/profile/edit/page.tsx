"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { updateMyProfile, UserPhoneNumberPayload } from "@/lib/api/users";
import { PHONE_E164_REGEX } from "@/lib/validation/authValidation";
import {
  uploadProfileImage,
  registerProfileImage,
  deleteProfileImage,
} from "@/services/profile-image-service";
import { ProfileImageUploader } from "@/components/auth/ProfileImageUploader";
import {
  UserCog,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Phone,
  Plus,
  Trash2,
  Star,
} from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, accessToken, loading, syncProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [publicProfile, setPublicProfile] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<UserPhoneNumberPayload[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (user && !initializedRef.current) {
      initializedRef.current = true;
      setFirstName(user.firstName);
      setLastName(user.lastName ?? "");
      setUsername(user.username ?? "");
      setBio(user.bio ?? "");
      setLocation(user.location ?? "");
      setPublicProfile(user.publicProfile);
      setAvatarUrl(user.avatarUrl ?? "");
      setCoverPhotoUrl(user.coverPhotoUrl ?? "");

      if (user.phoneNumbers && user.phoneNumbers.length > 0) {
        setPhoneNumbers(
          user.phoneNumbers.map((p) => ({
            id: p.id,
            phoneNumber: p.phoneNumber,
            isPrimary: p.isPrimary,
          }))
        );
      } else if (user.phoneNumber) {
        setPhoneNumbers([{ phoneNumber: user.phoneNumber, isPrimary: true }]);
      } else {
        setPhoneNumbers([]);
      }
    }
  }, [user]);

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

  const handleAvatarUpload = async (file: File) => {
    if (!user || !accessToken) return "";

    try {
      const storagePath = await uploadProfileImage(user.id, file, "avatar");
      const result = await registerProfileImage(accessToken, "avatar", {
        storagePath,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      setAvatarUrl(result.url);
      await syncProfile();
      return result.url;
    } catch (err) {
      throw err;
    }
  };

  const handleAvatarDelete = async () => {
    if (!accessToken) return;
    try {
      await deleteProfileImage(accessToken, "avatar");
      setAvatarUrl("");
      await syncProfile();
    } catch (err) {
      throw err;
    }
  };

  const handleCoverPhotoUpload = async (file: File) => {
    if (!user || !accessToken) return "";

    try {
      const storagePath = await uploadProfileImage(user.id, file, "cover");
      const result = await registerProfileImage(accessToken, "cover", {
        storagePath,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      setCoverPhotoUrl(result.url);
      await syncProfile();
      return result.url;
    } catch (err) {
      throw err;
    }
  };

  const handleCoverPhotoDelete = async () => {
    if (!accessToken) return;
    try {
      await deleteProfileImage(accessToken, "cover");
      setCoverPhotoUrl("");
      await syncProfile();
    } catch (err) {
      throw err;
    }
  };

  const handleAddPhoneNumber = () => {
    if (phoneNumbers.length >= 3) return;
    const isFirst = phoneNumbers.length === 0;
    setPhoneNumbers((prev) => [
      ...prev,
      { phoneNumber: "", isPrimary: isFirst },
    ]);
  };

  const handleRemovePhoneNumber = (index: number) => {
    setPhoneNumbers((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If we removed the primary number and there are remaining numbers, make the first one primary
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryPhoneNumber = (index: number) => {
    setPhoneNumbers((prev) =>
      prev.map((item, i) => ({
        ...item,
        isPrimary: i === index,
      }))
    );
  };

  const handlePhoneNumberChange = (index: number, value: string) => {
    setPhoneNumbers((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, phoneNumber: value } : item
      )
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken) {
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    // Validate phone numbers
    const validPhoneNumbers = phoneNumbers
      .map((p) => ({
        ...p,
        phoneNumber: p.phoneNumber.trim(),
      }))
      .filter((p) => p.phoneNumber.length > 0);

    if (validPhoneNumbers.length > 3) {
      setError("Maximum 3 phone numbers allowed.");
      setSaving(false);
      return;
    }

    for (const p of validPhoneNumbers) {
      if (!PHONE_E164_REGEX.test(p.phoneNumber)) {
        setError(
          `Invalid phone number format: "${p.phoneNumber}". Please use E.164 international format (e.g. +94771234567).`
        );
        setSaving(false);
        return;
      }
    }

    const numSet = new Set(validPhoneNumbers.map((p) => p.phoneNumber));
    if (numSet.size < validPhoneNumbers.length) {
      setError("Duplicate phone numbers are not allowed.");
      setSaving(false);
      return;
    }

    if (validPhoneNumbers.length > 0 && !validPhoneNumbers.some((p) => p.isPrimary)) {
      validPhoneNumbers[0].isPrimary = true;
    }

    try {
      const updated = await updateMyProfile(accessToken, {
        firstName,
        lastName,
        username,
        bio,
        location,
        publicProfile,
        phoneNumbers: validPhoneNumbers,
      });

      if (updated) {
        setFirstName(updated.firstName ?? "");
        setLastName(updated.lastName ?? "");
        setUsername(updated.username ?? "");
        setBio(updated.bio ?? "");
        setLocation(updated.location ?? "");
        setPublicProfile(updated.publicProfile ?? true);
        if (updated.phoneNumbers) {
          setPhoneNumbers(
            updated.phoneNumbers.map((p) => ({
              id: p.id,
              phoneNumber: p.phoneNumber,
              isPrimary: p.isPrimary,
            }))
          );
        }
      }

      await syncProfile();
      router.push(user.username ? `/profile/${user.username}` : "/profile");
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
      {/* Back Button */}
      <Link
        href={user.username ? `/profile/${user.username}` : "/profile"}
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Profile</span>
      </Link>

      {/* Profile Header */}
      <div className="glass-panel p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Edit Your Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Personalize your profile with images, contact info, and personal details
        </p>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Images Section */}
      <div className="glass-panel p-6 sm:p-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
            Profile Images
          </h2>

          {/* Cover Photo */}
          <div className="space-y-3 mb-8">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Cover Photo
            </h3>
            <ProfileImageUploader
              type="cover"
              currentImageUrl={coverPhotoUrl}
              onUpload={handleCoverPhotoUpload}
              onDelete={handleCoverPhotoDelete}
              onSuccess={() => {
                setError(null);
                setMessage("Cover photo updated successfully!");
                setTimeout(() => setMessage(null), 3000);
              }}
              onError={(err) => {
                setMessage(null);
                setError(err);
              }}
            />
          </div>

          {/* Avatar */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Profile Picture
            </h3>
            <ProfileImageUploader
              type="avatar"
              currentImageUrl={avatarUrl}
              onUpload={handleAvatarUpload}
              onDelete={handleAvatarDelete}
              onSuccess={() => {
                setError(null);
                setMessage("Profile picture updated successfully!");
                setTimeout(() => setMessage(null), 3000);
              }}
              onError={(err) => {
                setMessage(null);
                setError(err);
              }}
            />
          </div>
        </div>
      </div>

      {/* Profile Details & Phone Numbers Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details Section */}
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <UserCog className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Personal Details</span>
          </h2>

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
        </div>

        {/* Phone Numbers Section */}
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Phone Numbers</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Add up to 3 contact numbers. Set one as primary for buyers to reach you.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {phoneNumbers.length}/3 Numbers
            </span>
          </div>

          {phoneNumbers.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No phone numbers added yet. Add a phone number so buyers can reach you.
              </p>
              <button
                type="button"
                onClick={handleAddPhoneNumber}
                className="btn-outline text-xs px-4 py-2 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Phone Number</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {phoneNumbers.map((phoneItem, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all ${phoneItem.isPrimary
                    ? "bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10"
                    : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Phone Number {index + 1}
                        </label>
                        {phoneItem.isPrimary && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                            Primary
                          </span>
                        )}
                      </div>
                      <input
                        type="tel"
                        value={phoneItem.phoneNumber}
                        onChange={(e) =>
                          handlePhoneNumberChange(index, e.target.value)
                        }
                        placeholder="+94771234567"
                        className="input-field text-sm"
                        autoComplete="tel"
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center sm:pt-4">
                      {!phoneItem.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryPhoneNumber(index)}
                          className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>Set Primary</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemovePhoneNumber(index)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                        title="Delete phone number"
                        aria-label="Delete phone number"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {phoneNumbers.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddPhoneNumber}
                  className="w-full py-2.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Phone Number ({phoneNumbers.length}/3)</span>
                </button>
              )}
            </div>
          )}
          <p className="text-[11px] text-slate-400">
            Numbers must be in E.164 international format, e.g. <span className="font-mono text-slate-500 dark:text-slate-300">+94771234567</span>.
          </p>
        </div>

        {/* Save Bar */}
        <div className="glass-panel p-6 flex items-center justify-between flex-wrap gap-4">
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
    </main>
  );
}
