import type { AuthResponse } from "@/types/auth";

const ACCESS_TOKEN_KEY = "marketplace_access_token";
const REFRESH_TOKEN_KEY = "marketplace_refresh_token";
const USER_KEY = "marketplace_user";

export function saveAuth(
  auth: AuthResponse
): void {

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    auth.accessToken
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    auth.refreshToken
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(auth.user)
  );
}

export function getAccessToken(): string | null {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
}

export function clearAuth(): void {

  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}