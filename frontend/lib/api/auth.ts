import {
  apiRequest,
} from "@/lib/api/client";

import type {
  ApiResponse,
  AuthResponse,
  UserResponse,
} from "@/types/auth";

export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

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
  const response = await apiRequest<ApiResponse<UserResponse>>(
    "/auth/sync",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload ?? {}),
    }
  );

  return response.data;
}

export async function register(
  request: RegisterRequest
): Promise<UserResponse> {

  const response =
    await apiRequest<ApiResponse<UserResponse>>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

  return response.data;
}

export async function login(
  request: LoginRequest
): Promise<AuthResponse> {

  const response =
    await apiRequest<ApiResponse<AuthResponse>>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

  return response.data;
}

export async function refresh(
  refreshToken: string
): Promise<AuthResponse> {

  const response =
    await apiRequest<ApiResponse<AuthResponse>>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

  return response.data;
}

export async function getMe(
  accessToken: string
): Promise<UserResponse> {

  const response =
    await apiRequest<ApiResponse<UserResponse>>(
      "/auth/me",
      {
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );

  return response.data;
}

export async function logout(
  accessToken: string,
  refreshToken: string
): Promise<void> {

  await apiRequest<ApiResponse<null>>(
    "/auth/logout",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        refreshToken,
      }),
    }
  );
}