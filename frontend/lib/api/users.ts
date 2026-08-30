import {
  apiRequest,
} from "@/lib/api/client";

import type {
  ApiResponse,
  UserResponse,
} from "@/types/auth";

export interface UserPhoneNumberPayload {
  id?: string;
  phoneNumber: string;
  isPrimary: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  location?: string;
  publicProfile?: boolean;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  phoneNumbers?: UserPhoneNumberPayload[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export async function getMyProfile(
  accessToken?: string | null
): Promise<UserResponse> {

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response =
    await apiRequest<ApiResponse<UserResponse>>(
      "/users/me",
      {
        headers,
      }
    );

  return response.data;
}

export async function updateMyProfile(
  accessToken: string | undefined | null,
  request: UpdateProfileRequest
): Promise<UserResponse> {

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response =
    await apiRequest<ApiResponse<UserResponse>>(
      "/users/me",
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(request),
      }
    );

  return response.data;
}

export async function changePassword(
  accessToken: string | undefined | null,
  request: ChangePasswordRequest
): Promise<void> {

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  await apiRequest<ApiResponse<null>>(
    "/users/me/password",
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(request),
    }
  );
}

export async function deleteAccount(
  accessToken?: string | null
): Promise<void> {

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  await apiRequest<ApiResponse<null>>(
    "/users/me",
    {
      method: "DELETE",
      headers,
    }
  );
}

export async function getPublicProfile(
  username: string
): Promise<UserResponse> {

  const response =
    await apiRequest<ApiResponse<UserResponse>>(
      `/users/${encodeURIComponent(username)}`
    );

  return response.data;
}