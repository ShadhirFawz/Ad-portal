import { createClient } from "@/lib/supabase/client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const customHeaders = (options.headers as Record<string, string>) || {};
  let token: string | undefined = undefined;

  if (!customHeaders.Authorization && !customHeaders.authorization) {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    } catch {
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
      }
      return (text as unknown) as T;
    }
  }

  if (!response.ok) {
    const msg = (data as { message?: string } | null)?.message;
    throw new Error(msg ?? `Request failed: ${response.status} ${response.statusText}`);
  }

  return data as T;
}

/**
 * Public API request — never attaches an Authorization header.
 * Use for endpoints that are open (no JWT needed), to avoid 401s
 * caused by an expired or invalid Supabase session being forwarded.
 */
export async function publicRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`);
      }
      return (text as unknown) as T;
    }
  }

  if (!response.ok) {
    const msg = (data as { message?: string } | null)?.message;
    throw new Error(msg ?? `Request failed: ${response.status} ${response.statusText}`);
  }

  return data as T;
}