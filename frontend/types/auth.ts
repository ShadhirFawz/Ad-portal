import type { OpeningHour } from "@/lib/openingHours";

export type UserRole =
  | "MEMBER"
  | "SELLER"
  | "VERIFIED_SELLER"
  | "ADMIN"
  | "USER";

export type UserStatus =
  | "PENDING_EMAIL_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "BANNED"
  | "DELETED";

export interface UserPhoneNumber {
  id?: string;
  phoneNumber: string;
  isPrimary: boolean;
  isWhatsapp?: boolean;
  isBusiness?: boolean;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  email: string;
  phoneNumber: string | null;
  phoneNumbers?: UserPhoneNumber[];
  avatarUrl: string | null;
  coverPhotoUrl: string | null;
  bio: string | null;
  businessName?: string | null;
  businessEmail?: string | null;
  location: string | null;
  role: UserRole;
  status: UserStatus;
  accountStatus?: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  publicProfile: boolean;
  createdAt: string;
  openingHours?: OpeningHour[];
}

export interface BecomeSellerRequest {
  phoneNumber: string;
  acceptTerms: boolean;
  isWhatsapp?: boolean;
  preferredContactMethod?: "CALL" | "WHATSAPP" | "BOTH";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}