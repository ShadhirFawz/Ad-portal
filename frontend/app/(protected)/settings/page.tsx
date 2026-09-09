"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile/edit");
  }, [router]);

  return (
    <main className="flex-1 flex items-center justify-center py-20 min-h-[50vh]">
      <div className="flex items-center gap-3 text-slate-500 font-medium">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        Redirecting to Settings...
      </div>
    </main>
  );
}
