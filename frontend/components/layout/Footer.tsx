import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">

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

        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Support
          </Link>
        </div>

      </div>
    </footer>
  );
}
