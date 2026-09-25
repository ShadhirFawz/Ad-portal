"use client";

import { useEffect, Suspense, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

function ProtectedLayoutInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const queryString = searchParams?.toString();
      const fullPath = queryString ? `${pathname}?${queryString}` : pathname;
      const redirectUrl = fullPath
        ? `/login?redirect=${encodeURIComponent(fullPath)}`
        : "/login";
      router.replace(redirectUrl);
    }
  }, [loading, user, router, pathname, searchParams]);

  if (loading || !user) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[60vh] py-20">
        <div className="flex flex-col items-center gap-3 text-slate-500 font-medium">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">
            {loading ? "Checking authentication..." : "Redirecting to login..."}
          </span>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="flex-1 flex items-center justify-center min-h-[60vh] py-20">
          <div className="flex flex-col items-center gap-3 text-slate-500 font-medium">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Loading...</span>
          </div>
        </main>
      }
    >
      <ProtectedLayoutInner>{children}</ProtectedLayoutInner>
    </Suspense>
  );
}
