export type UserRole =
  | "USER"
  | "ADMIN";

export type UserStatus =
  | "PENDING_EMAIL_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "BANNED"
  | "DELETED";

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  coverPhotoUrl: string | null;
  bio: string | null;
  location: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  publicProfile: boolean;
  createdAt: string;
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