"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { UserResponse } from "@/types/auth";
import { getMe, syncUser } from "@/lib/api/auth";

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
  syncProfile: () => Promise<UserResponse | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapSupabaseUserToUserResponse(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}): UserResponse {
  const metadata = supabaseUser.user_metadata ?? {};
  const email = supabaseUser.email ?? "";
  const firstName =
    (typeof metadata.first_name === "string" && metadata.first_name.trim()) ||
    (typeof metadata.full_name === "string" && metadata.full_name.split(" ")[0]) ||
    (email.includes("@") ? email.substring(0, email.indexOf("@")) : "User");
  const lastName =
    (typeof metadata.last_name === "string" && metadata.last_name.trim()) ||
    "";
  const phoneNumber =
    (typeof metadata.phone_number === "string" && metadata.phone_number.trim()) ||
    (typeof metadata.phone === "string" && metadata.phone.trim()) ||
    "";

  return {
    id: supabaseUser.id,
    firstName,
    lastName,
    username: (typeof metadata.username === "string" && metadata.username) || "",
    email,
    phoneNumber: phoneNumber || null,
    phoneNumbers: phoneNumber ? [{ phoneNumber, isPrimary: true }] : [],
    avatarUrl: (typeof metadata.avatar_url === "string" && metadata.avatar_url) || "",
    coverPhotoUrl: "",
    bio: "",
    location: "",
    role: "USER",
    status: "ACTIVE",
    emailVerified: true,
    phoneVerified: false,
    publicProfile: true,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep a ref of the latest user to avoid overwriting rich profile on token refresh
  const userRef = useRef<UserResponse | null>(null);
  userRef.current = user;

  const syncBackendProfile = async (token: string, fallbackUser?: UserResponse) => {
    try {
      const profile = await getMe(token);
      setUser(profile);
      return profile;
    } catch {
      try {
        const synced = await syncUser(token, fallbackUser ? {
          email: fallbackUser.email,
          firstName: fallbackUser.firstName,
          lastName: fallbackUser.lastName,
          phoneNumber: fallbackUser.phoneNumber,
        } : undefined);
        setUser(synced);
        return synced;
      } catch (err) {
        console.warn("Backend profile sync notice:", err);
        return null;
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user && session?.access_token) {
          const fallback = mapSupabaseUserToUserResponse(session.user);
          setAccessToken(session.access_token);
          setUser(fallback);

          // Sync full profile with backend
          void syncBackendProfile(session.access_token, fallback);
        } else {
          setAccessToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to initialize session:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setAccessToken(null);
        setUser(null);
        setLoading(false);
        return;
      }

      if (session.user && session.access_token) {
        setAccessToken(session.access_token);

        if (event === "TOKEN_REFRESHED" && userRef.current?.id === session.user.id) {
          setLoading(false);
          return;
        }

        if (!userRef.current || userRef.current.id !== session.user.id) {
          const fallback = mapSupabaseUserToUserResponse(session.user);
          setUser(fallback);
          void syncBackendProfile(session.access_token, fallback);
        }
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    if (data.session?.user && data.session?.access_token) {
      const fallback = mapSupabaseUserToUserResponse(data.session.user);
      setAccessToken(data.session.access_token);
      setUser(fallback);
      void syncBackendProfile(data.session.access_token, fallback);
    }
    setLoading(false);
  };

  const signUp = async (
    email: string,
    password: string,
    profile: { firstName: string; lastName?: string; phoneNumber?: string }
  ) => {
    setLoading(true);
    const supabase = createClient();
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

    if (data.session?.user && data.session?.access_token) {
      const fallback = mapSupabaseUserToUserResponse(data.session.user);
      setAccessToken(data.session.access_token);
      setUser(fallback);
      void syncBackendProfile(data.session.access_token, fallback);
    }
    setLoading(false);
  };

  const refreshSession = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      throw new Error(error.message);
    }
    if (data.session?.access_token) {
      setAccessToken(data.session.access_token);
    }
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAccessToken(null);
    setUser(null);
  };

  const syncProfile = async () => {
    if (accessToken && user) {
      return await syncBackendProfile(accessToken, user);
    }
    return null;
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
        syncProfile,
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