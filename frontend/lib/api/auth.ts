import { apiRequest } from "@/lib/api/client";
import type { ApiResponse, UserResponse } from "@/types/auth";

export interface SyncUserPayload {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  username?: string | null;
}

export async function syncUser(
  accessToken: string,
  payload?: SyncUserPayload
): Promise<UserResponse> {
  const response = await apiRequest<ApiResponse<UserResponse>>("/auth/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload ?? {}),
  });

  return response.data;
}

export async function getMe(accessToken: string): Promise<UserResponse> {
  const response = await apiRequest<ApiResponse<UserResponse>>("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}