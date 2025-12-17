"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: "bg-emerald-500",
      icon: CheckCircle,
    },
    error: {
      bg: "bg-red-500",
      icon: XCircle,
    },
    warning: {
      bg: "bg-amber-500",
      icon: AlertTriangle,
    },
    info: {
      bg: "bg-indigo-500",
      icon: Info,
    },
  };

  const Icon = styles[type].icon;

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-[10001]
      ${styles[type].bg}
      text-white px-5 py-4 rounded-2xl shadow-xl
      flex items-center gap-4
      animate-in slide-in-from-top duration-300`}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>

      {/* Message */}
      <div className="flex-1 text-base font-medium">{message}</div>

      {/* Close */}
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-xl bg-white/20
        flex items-center justify-center
        hover:bg-white/30 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
