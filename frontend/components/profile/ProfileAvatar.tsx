import Image from "next/image";

export interface ProfileAvatarProps {
  avatarUrl?: string | null;
  firstName?: string | null;
  email?: string | null;
  username?: string | null;
  initial?: string | null;
  size?: number;
  className?: string;
  alt?: string;
}

export interface ParticipantAvatarItem {
  id?: string;
  avatarUrl?: string | null;
  initial?: string | null;
  firstName?: string | null;
  email?: string | null;
  username?: string | null;
}

export interface ParticipantAvatarGroupProps {
  participants: ParticipantAvatarItem[];
  totalCount: number;
  size?: number;
  emptyLabel?: string;
  className?: string;
}

export function getProfileInitial({
  firstName,
  email,
  username,
  initial,
}: Pick<
  ProfileAvatarProps,
  "firstName" | "email" | "username" | "initial"
>): string {
  if (initial?.trim()) {
    return initial.trim().charAt(0).toUpperCase();
  }

  return (
    firstName?.[0] ??
    email?.[0] ??
    username?.[0] ??
    "U"
  ).toUpperCase();
}

export default function ProfileAvatar({
  avatarUrl,
  firstName,
  email,
  username,
  initial,
  size = 28,
  className = "",
  alt = "Avatar",
}: ProfileAvatarProps) {
  const letter = getProfileInitial({ firstName, email, username, initial });

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full object-cover border border-emerald-500/30 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const fontSize =
    size <= 24 ? "0.625rem" : size <= 28 ? "0.75rem" : "0.875rem";

  return (
    <div
      className={`rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize }}
      aria-hidden={alt === ""}
    >
      {letter}
    </div>
  );
}

export function ParticipantAvatarGroup({
  participants,
  totalCount,
  size = 28,
  emptyLabel = "No bids yet",
  className = "",
}: ParticipantAvatarGroupProps) {
  const visible = participants.slice(0, 3);
  const overflow = Math.max(0, totalCount - visible.length);

  if (totalCount === 0) {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-500">
        {emptyLabel}
      </span>
    );
  }

  const overflowFontSize =
    size <= 24 ? "0.625rem" : size <= 28 ? "0.75rem" : "0.875rem";

  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center -space-x-2">
        {visible.map((participant, index) => (
          <div
            key={participant.id ?? `participant-${index}`}
            className="relative rounded-full ring-2 ring-white dark:ring-slate-900"
            style={{ zIndex: visible.length - index }}
            title="Participant"
          >
            <ProfileAvatar
              avatarUrl={participant.avatarUrl}
              initial={participant.initial}
              firstName={participant.firstName}
              email={participant.email}
              username={participant.username}
              size={size}
              alt=""
            />
          </div>
        ))}
      </div>
      {overflow > 0 && (
        <div
          className="relative -ml-1 z-10 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 ring-2 ring-white dark:ring-slate-900 shrink-0"
          style={{ width: size, height: size, fontSize: overflowFontSize }}
          title={`${overflow} more participant${overflow === 1 ? "" : "s"}`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
