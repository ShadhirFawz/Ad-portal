import type { UserResponse } from "@/types/auth";

export type ProfileImageType = "avatar" | "cover";

export interface ProfileImageResponse {
  imageType: ProfileImageType;
  storagePath: string;
  url: string;
  user: UserResponse;
}

export interface RegisterProfileImagePayload {
  storagePath: string;
  fileName?: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
}
