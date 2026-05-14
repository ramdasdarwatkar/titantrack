import { useState, useCallback, type ReactNode } from "react";
import {
  ToastContext,
  type Toast,
  type ToastType,
} from "@/context/ToastContext";
import { CheckCircle, XCircle, Info, X } from "@phosphor-icons/react";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
} as const;

const COLORS = {
  success: {
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.3)",
    icon: "#22c55e",
  },
  error: {
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    icon: "#ef4444",
  },
  info: {
    bg: "rgba(var(--primary-rgb, 108,168,255),0.12)",
    border: "rgba(var(--primary-rgb, 108,168,255),0.3)",
    icon: "var(--primary)",
  },
} as const;

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const Icon = ICONS[toast.type];
  const colors = COLORS[toast.type];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "18px",
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        minWidth: "280px",
        maxWidth: "340px",
        animation: "toast-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      <Icon
        size={20}
        weight="fill"
        color={colors.icon}
        style={{ flexShrink: 0 }}
      />

      <span
        style={{
          flex: 1,
          fontSize: "14px",
          fontWeight: 600,
          color: "var(--text-main)",
          lineHeight: 1.4,
        }}
      >
        {toast.message}
      </span>

      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: "none",
          border: "none",
          padding: "2px",
          cursor: "pointer",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto-dismiss after 3.5s
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container — fixed, above everything */}
      <div
        style={{
          position: "fixed",
          bottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: "auto" }}>
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>

      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
