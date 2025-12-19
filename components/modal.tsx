"use client";

import type React from "react";
import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        bg-black/50 backdrop-blur-sm
        flex items-center justify-center
        p-4
        animate-in fade-in duration-150
      "
      onClick={onClose}
    >
      <div
        className="
          bg-white
          w-full max-w-2xl
          max-h-[90vh]
          rounded-xl
          border border-gray-200
          shadow-xl
          overflow-hidden
          animate-in zoom-in-95 duration-150
        "
        onClick={(e) => e.stopPropagation()}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              w-9 h-9
              flex items-center justify-center
              rounded-md
              text-gray-500
              hover:bg-gray-100 hover:text-gray-800
              transition
            "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto max-h-[calc(90vh-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ isOpen, onClose, onConfirm }: DeleteModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-[400px] p-6 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <span className="text-5xl">🗑️</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Xác nhận xóa</h3>
        <p className="text-gray-500 text-lg mb-6">
          Bạn có chắc muốn xóa chi tiêu này?
          <br />
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-4 font-semibold text-lg btn-bounce"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 gradient-danger text-white rounded-2xl py-4 font-semibold text-lg shadow-lg btn-bounce"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
