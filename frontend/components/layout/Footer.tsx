import Link from "next/link";
import Image from "next/image";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">

          <div className="flex items-center gap-2">
            {/* Light mode logo */}
            <Image
              src="/Wudo_logo_light.png"
              alt="Wudo"
              width={160}
              height={40}
              className="h-10 w-auto object-contain dark:hidden"
            />
            {/* Dark mode logo */}
            <Image
              src="/Wudo_logo_dark.png"
              alt="Wudo"
              width={160}
              height={40}
              className="h-10 w-auto object-contain hidden dark:block"
            />
            <span
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
              style={{ fontFamily: "'PT Sans', 'Tahoma', sans-serif" }}
            >
              Wudo &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <Link
              href="/privacy-policy"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/support"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              Support
            </Link>
            <Link
              href="/boost"
              className="inline-flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <Zap className="h-3 w-3" />
              Boost Your Ad
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}

