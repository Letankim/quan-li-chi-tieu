"use client"

import { useEffect } from "react"

interface ToastProps {
  message: string
  type: "success" | "error" | "warning" | "info"
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-indigo-500",
  }

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  }

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-[10001] ${colors[type]} text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top duration-300`}
    >
      <span className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl font-bold">
        {icons[type]}
      </span>
      <span className="flex-1 text-lg font-medium">{message}</span>
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-xl"
      >
        ✕
      </button>
    </div>
  )
}
