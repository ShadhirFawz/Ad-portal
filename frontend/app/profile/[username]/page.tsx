import { getPublicProfile } from "@/lib/api/users";
import { getListingsByUsername } from "@/lib/api/listings";
import UserListingsSection from "@/components/profile/UserListingsSection";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Phone, Search } from "lucide-react";
import OpeningHoursDisplay from "@/components/profile/OpeningHoursDisplay";
import VerifiedSellerBadge from "@/components/common/VerifiedSellerBadge";
import MemberBadge from "@/components/common/MemberBadge";
import BioWithToggle from "@/components/profile/BioWithToggle";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  let user = null;
  let initialListingsPage = null;

  try {
    const [userRes, listingsRes] = await Promise.all([
      getPublicProfile(username),
      getListingsByUsername(username, 0, 8).catch(() => ({
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: 8,
        number: 0,
        first: true,
        last: true,
      })),
    ]);
    user = userRes;
    initialListingsPage = listingsRes;
  } catch {
    user = null;
  }

  if (!user) {
    return (
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-20 text-center">
        <div className="glass-panel p-8 space-y-4">
          <div className="text-4xl"><Search size={48} color="red" /></div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            User Not Found
          </h2>
          <p className="text-sm text-slate-500">
            The profile @{username} doesn&apos;t exist or is not public.
          </p>
          <Link href="/" className="btn-primary text-xs px-4 py-2 inline-block">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const isVerifiedSeller = user.role === "VERIFIED_SELLER";
  const isSeller = user.role === "SELLER";
  const isAdmin = user.role === "ADMIN";

  const businessPhone = user.phoneNumbers?.find((p) => p.isBusiness)?.phoneNumber ?? null;
  const primaryPhone = user.phoneNumbers?.find((p) => p.isPrimary)?.phoneNumber ?? user.phoneNumber ?? null;
  const displayPhone = isVerifiedSeller
    ? businessPhone
    : isSeller
      ? primaryPhone
      : null;

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6 lg:gap-8 items-start">

        {/* Seller Info Card */}
        <aside className="lg:sticky lg:top-20">
          <div className="glass-panel overflow-hidden">

            {/* Cover Photo Banner */}
            {user.coverPhotoUrl ? (
              <div className="h-24 sm:h-32 lg:h-28 relative overflow-hidden">
                <Image
                  src={user.coverPhotoUrl}
                  alt="Cover photo"
                  width={900}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-24 sm:h-32 lg:h-28 bg-gradient-to-b from-slate-200 via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors" />
            )}

            {/* Profile Card Body */}
            <div className="p-5 sm:p-6 relative pt-0">

              {/* Avatar Badge Overlapping Banner */}
              <div className="-mt-12 sm:-mt-14 mb-3">
                {user.avatarUrl ? (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center border-4 border-white dark:border-[#0b0f19] shadow-xl overflow-hidden relative">
                    <Image
                      src={user.avatarUrl}
                      alt="Profile picture"
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-900 text-white font-bold text-3xl sm:text-4xl flex items-center justify-center border-4 border-white dark:border-[#0b0f19] shadow-xl">
                    {user.firstName[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Badges — VerifiedSellerBadge + MemberBadge for VERIFIED_SELLER,
                  MemberBadge only for SELLER */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {isVerifiedSeller && (
                  <>
                    <VerifiedSellerBadge size="md" />
                    <MemberBadge size="sm" />
                  </>
                )}
                {isSeller && <MemberBadge size="sm" />}
              </div>

              {/* Name & Handle */}
              <div className="space-y-1">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight break-words">
                  {user.businessName && isVerifiedSeller
                    ? user.businessName
                    : `${user.firstName} ${user.lastName ?? ""}`}
                </h1>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 break-all">
                  @{user.username}
                </p>
              </div>

              {/* Location & Meta info */}
              <div className="mt-4 flex flex-col gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {user.location && (
                  <span className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="break-words">{user.location}</span>
                  </span>
                )}
                <span className="flex items-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </span>
                {displayPhone && (
                  <a
                    href={`tel:${displayPhone}`}
                    className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors break-all"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{displayPhone}</span>
                  </a>
                )}
              </div>

              {/* Bio - Exclusive to Verified Sellers and Admins */}
              {(isVerifiedSeller || isAdmin) && user.bio && (
                <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    About
                  </h3>
                  <BioWithToggle bio={user.bio} />
                </div>
              )}

              {/* Opening Hours - Exclusive to Verified Sellers and Admins */}
              {(isVerifiedSeller || isAdmin) && (
                <OpeningHoursDisplay hours={user.openingHours} />
              )}

            </div>
          </div>
        </aside>

        {/* Listings Section */}
        <section className="min-w-0">
          <UserListingsSection
            username={username}
            initialListings={initialListingsPage?.content ?? []}
            initialTotalPages={initialListingsPage?.totalPages ?? 0}
            initialTotalElements={initialListingsPage?.totalElements ?? 0}
            pageSize={8}
          />
        </section>

      </div>
    </main>
  );
}