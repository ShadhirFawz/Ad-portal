"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { UserResponse } from "@/types/auth";
import { getMe, syncUser, type SyncUserPayload } from "@/lib/api/auth";

interface AuthContextValue {
  user: UserResponse | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    profile: { firstName: string; lastName?: string; phoneNumber?: string }
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          setAccessToken(session.access_token);
          try {
            const profile = await getMe(session.access_token);
            setUser(profile);
          } catch {
            // Profile may need syncing
            const synced = await syncUser(session.access_token);
            setUser(synced);
          }
        }
      } catch (err) {
        console.error("Failed to initialize session:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to Supabase Auth State changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        setAccessToken(session.access_token);
        try {
          const profile = await getMe(session.access_token);
          setUser(profile);
        } catch {
          const synced = await syncUser(session.access_token);
          setUser(synced);
        }
      } else {
        setAccessToken(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
      try {
        const profile = await syncUser(data.session.access_token);
        setUser(profile);
      } catch {
        // Ignored, user state managed by listener
      }
    }
    setLoading(false);
  };

  const signUp = async (
    email: string,
    password: string,
    profile: { firstName: string; lastName?: string; phoneNumber?: string }
  ) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone_number: profile.phoneNumber,
        },
      },
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
      const synced = await syncUser(data.session.access_token, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber,
      });
      setUser(synced);
    }
    setLoading(false);
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      throw new Error(error.message);
    }
    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        signUp,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}