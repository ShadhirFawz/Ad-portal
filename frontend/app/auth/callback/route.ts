import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Auth callback route — handles both:
 *   1. OAuth sign-in (Google) — exchanges code for session, redirects to `next`
 *   2. Password recovery — Supabase sends `type=recovery` with a `code`; we
 *      exchange it and redirect the user to /reset-password so they can set
 *      a new password while temporarily authenticated.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "recovery" for password reset emails
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method is called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      // For password recovery, always redirect to /reset-password
      const destination = type === "recovery" ? "/reset-password" : next;

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${destination}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${destination}`);
      } else {
        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  // If code exchange failed, redirect to login with an error indicator
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
