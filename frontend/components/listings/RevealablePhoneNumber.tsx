"use client";

import { useMemo, useState } from "react";
import { PhoneCall } from "lucide-react";

type RevealablePhoneNumberProps = {
  phoneNumber: string;
  className?: string;
};

function maskPhoneNumber(phoneNumber: string) {
  const raw = phoneNumber.trim();
  let seenDigits = 0;

  return raw
    .split("")
    .map((character) => {
      if (/\d/.test(character)) {
        seenDigits += 1;
        return seenDigits <= 2 ? character : "•";
      }
      return character;
    })
    .join("");
}

export default function RevealablePhoneNumber({
  phoneNumber,
  className = "",
}: RevealablePhoneNumberProps) {
  const [revealed, setRevealed] = useState(false);

  const maskedPhone = useMemo(() => maskPhoneNumber(phoneNumber), [phoneNumber]);

  return (
    <div className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Seller Mobile
          </p>
          <div className="mt-1 flex items-center gap-2">
            <PhoneCall className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="font-semibold text-slate-900 dark:text-white tracking-wide">
              {revealed ? phoneNumber : maskedPhone}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={revealed}
          onClick={() => setRevealed((prev) => !prev)}
          className={`relative inline-flex h-8 w-16 items-center rounded-full border transition-all duration-300 ${
            revealed
              ? "border-emerald-600 bg-emerald-600"
              : "border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800"
          }`}
          aria-label={revealed ? "Hide seller phone number" : "Reveal seller phone number"}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              revealed ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="mt-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/70">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${
            revealed ? "w-full bg-emerald-500" : "w-1/3 bg-slate-400 dark:bg-slate-600"
          }`}
        />
      </div>

      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
        Slide to reveal the full number.
      </p>
    </div>
  );
}
