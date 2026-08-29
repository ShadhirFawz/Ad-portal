export type PasswordStrength = {
  label: string;
  color: string;
  width: string;
};

export function getPasswordStrength(pw: string): PasswordStrength {
  if (!pw) return { label: "", color: "bg-slate-200 dark:bg-slate-700", width: "0%" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Very Weak", color: "bg-rose-500", width: "20%" };
  if (score === 2) return { label: "Weak", color: "bg-orange-500", width: "40%" };
  if (score === 3) return { label: "Fair", color: "bg-amber-500", width: "60%" };
  if (score === 4) return { label: "Strong", color: "bg-emerald-400", width: "80%" };
  return { label: "Very Strong", color: "bg-emerald-500", width: "100%" };
}
