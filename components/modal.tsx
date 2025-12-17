"use client";

import type React from "react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6  animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-[95%] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 text-2xl btn-bounce"
          >
            ✕
          </button>
        </div>
        <div className="p-6 pt-1">{children}</div>
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
