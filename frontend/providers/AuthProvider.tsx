"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { UserResponse } from "@/types/auth";

import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  saveAuth,
} from "@/lib/auth/auth-storage";

import {
  getMe,
  login as loginApi,
  logout as logoutApi,
  refresh as refreshApi,
} from "@/lib/api/auth";

interface AuthContextValue {
  user: UserResponse | null;
  accessToken: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [user, setUser] =
    useState<UserResponse | null>(null);

  const [accessToken, setAccessToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const initialize = async () => {

      try {

        const token = getAccessToken();

        if (!token) {
          return;
        }

        const currentUser =
          await getMe(token);

        setAccessToken(token);
        setUser(currentUser);

      } catch {

        clearAuth();

      } finally {

        setLoading(false);
      }
    };

    initialize();

  }, []);

  const login = async (
    email: string,
    password: string
  ) => {

    const auth =
      await loginApi({
        email,
        password,
      });

    saveAuth(auth);

    setAccessToken(auth.accessToken);
    setUser(auth.user);
  };

  const refreshSession = async () => {

    const refreshToken =
      getRefreshToken();

    if (!refreshToken) {
      throw new Error(
        "No refresh token available."
      );
    }

    const auth =
      await refreshApi(refreshToken);

    saveAuth(auth);

    setAccessToken(auth.accessToken);
    setUser(auth.user);
  };

  const logout = async () => {

    const token = getAccessToken();
    const refreshToken =
      getRefreshToken();

    try {

      if (token && refreshToken) {
        await logoutApi(
          token,
          refreshToken
        );
      }

    } finally {

      clearAuth();

      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}