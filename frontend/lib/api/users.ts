import {
  apiRequest,
} from "@/lib/api/client";

import type {
  ApiResponse,
  UserResponse,
} from "@/types/auth";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  location?: string;
  publicProfile?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export async function getMyProfile(
  accessToken: string
): Promise<UserResponse> {

  const response =
    await apiRequest<ApiResponse<UserResponse>>(
      "/users/me",
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );

  return response.data;
}

export async function updateMyProfile(
  accessToken: string,
  request: UpdateProfileRequest
): Promise<UserResponse> {

  const response =
    await apiRequest<ApiResponse<UserResponse>>(
      "/users/me",
      {
        method: "PATCH",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: JSON.stringify(request),
      }
    );

  return response.data;
}

export async function changePassword(
  accessToken: string,
  request: ChangePasswordRequest
): Promise<void> {

  await apiRequest<ApiResponse<null>>(
    "/users/me/password",
    {
      method: "PATCH",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    }
  );
}

export async function deleteAccount(
  accessToken: string
): Promise<void> {

  await apiRequest<ApiResponse<null>>(
    "/users/me",
    {
      method: "DELETE",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
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