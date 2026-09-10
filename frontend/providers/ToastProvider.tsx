"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
  duration?: number; // ms; 0 = sticky
}

interface ToastContextValue {
  toast: (
    title: string,
    message?: string,
    variant?: ToastVariant,
    duration?: number
  ) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Variant Styles ───────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<
  ToastVariant,
  {
    wrapper: string;
    icon: string;
    bar: string;
    badgeBg: string;
    IconCmp: typeof CheckCircle2;
  }
> = {
  success: {
    wrapper:
      "bg-white dark:bg-slate-900 border-emerald-500/25 dark:border-emerald-500/30 text-slate-800 dark:text-slate-100 shadow-lg shadow-emerald-500/5",
    icon: "text-emerald-500 dark:text-emerald-400",
    bar: "bg-emerald-500",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
    IconCmp: CheckCircle2,
  },
  error: {
    wrapper:
      "bg-white dark:bg-slate-900 border-red-500/25 dark:border-red-500/30 text-slate-800 dark:text-slate-100 shadow-lg shadow-red-500/5",
    icon: "text-red-500 dark:text-red-400",
    bar: "bg-red-500",
    badgeBg: "bg-red-50 dark:bg-red-950/50",
    IconCmp: XCircle,
  },
  warning: {
    wrapper:
      "bg-white dark:bg-slate-900 border-amber-500/25 dark:border-amber-500/30 text-slate-800 dark:text-slate-100 shadow-lg shadow-amber-500/5",
    icon: "text-amber-500 dark:text-amber-400",
    bar: "bg-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/50",
    IconCmp: AlertTriangle,
  },
  info: {
    wrapper:
      "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-lg shadow-slate-500/5",
    icon: "text-indigo-500 dark:text-indigo-400",
    bar: "bg-indigo-500",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/50",
    IconCmp: Info,
  },
};

const DEFAULT_DURATION = 4000;

// ─── Individual Toast Item ────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const duration = toast.duration ?? DEFAULT_DURATION;

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 320);
  }, [exiting, onDismiss, toast.id]);

  // Entrance slide-in from right animation
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration <= 0) return;
    timerRef.current = setTimeout(dismiss, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss, duration]);

  const styles = VARIANT_STYLES[toast.variant];
  const Icon = styles.IconCmp;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        transition: exiting
          ? "transform 0.32s cubic-bezier(0.4, 0, 1, 1), opacity 0.28s ease-in"
          : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease-out",
        transform:
          visible && !exiting
            ? "translateX(0)"
            : "translateX(calc(100% + 2rem))",
        opacity: visible && !exiting ? 1 : 0,
        overflow: "hidden",
        position: "relative",
      }}
      className={`w-full max-w-sm rounded-xl border backdrop-blur-md ${styles.wrapper} pointer-events-auto select-none`}
    >
      <div className="flex items-start gap-3 p-3.5">
        {/* Icon with subtle background */}
        <div
          className={`shrink-0 p-1.5 rounded-lg ${styles.badgeBg} flex items-center justify-center mt-0.5`}
        >
          <Icon className={`w-4 h-4 ${styles.icon}`} />
        </div>

        {/* Content: Title and Subtitle */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white truncate">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug break-words">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      {duration > 0 && (
        <div
          className={`h-[2.5px] ${styles.bar} w-full opacity-80`}
          style={{
            animation: `toast-shrink ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

// ─── Toast Container (portal) ─────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div
      aria-label="Notifications"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none items-end"
      style={{ maxWidth: "min(calc(100vw - 2.5rem), 24rem)" }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

let _counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (
      title: string,
      message?: string,
      variant: ToastVariant = "info",
      duration?: number
    ) => {
      const id = `toast-${++_counter}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, title, message, variant, duration }]);
    },
    []
  );

  const success = useCallback(
    (title: string, message?: string, duration?: number) =>
      toast(title, message, "success", duration),
    [toast]
  );
  const error = useCallback(
    (title: string, message?: string, duration?: number) =>
      toast(title, message, "error", duration),
    [toast]
  );
  const warning = useCallback(
    (title: string, message?: string, duration?: number) =>
      toast(title, message, "warning", duration),
    [toast]
  );
  const info = useCallback(
    (title: string, message?: string, duration?: number) =>
      toast(title, message, "info", duration),
    [toast]
  );

  return (
    <ToastContext.Provider
      value={{ toast, success, error, warning, info, dismiss }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
