"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Single Toast Item ───────────────────────────────────────────────────────

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; accent: string }
> = {
  success: {
    icon: <CheckCircle2 size={18} color="#10b981" />,
    accent: "#10b981",
  },
  error: {
    icon: <AlertCircle size={18} color="#f43f5e" />,
    accent: "#f43f5e",
  },
  warning: {
    icon: <AlertTriangle size={18} color="#f59e0b" />,
    accent: "#f59e0b",
  },
  info: {
    icon: <Info size={18} color="#0e87e8" />,
    accent: "#0e87e8",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = variantConfig[toast.variant];
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onDismiss]);

  return (
    <div
      className="toast"
      role="alert"
      aria-live="assertive"
      style={{ borderLeft: `3px solid ${config.accent}` }}
    >
      {config.icon}
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}

// ─── Container ───────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, variant }]);
  }, []);

  const value: ToastContextValue = {
    toast: addToast,
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    warning: (msg) => addToast(msg, "warning"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
