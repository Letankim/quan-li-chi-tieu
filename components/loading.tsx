"use client";

import { RotateCw } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-[10000]">
      <div className="text-center animate-in fade-in duration-300">
        <div className="relative w-24 h-24 mx-auto">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-100"></div>
          <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-indigo-500 absolute top-0 left-0 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">💰</span>
          </div>
        </div>
        <p className="text-2xl text-gray-700 mt-6 font-semibold">
          Đợi xíu bé ơi...
        </p>
        <p className="text-lg text-gray-400 mt-2">Đợi anh xíu nha</p>
      </div>
    </div>
  );
}

export function ErrorMessage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-[9998] p-8">
      <div className="text-center animate-in zoom-in duration-300">
        <div className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <span className="text-6xl">📡</span>
        </div>
        <p className="text-2xl font-bold text-gray-800 mb-3">Có lỗi xảy ra</p>
        <p className="text-gray-500 mb-8 text-lg">
          Lỗi rồi bé yêu ơi.
          <br />
          Nhắn tin anh liền đi bé.
        </p>
        <button
          onClick={onRetry}
          className="gradient-primary text-white rounded-2xl px-12 py-5 text-xl font-semibold shadow-xl btn-bounce flex items-center gap-3"
        >
          <RotateCw className="w-6 h-6" />
          Thử lại
        </button>
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer-bg rounded-2xl ${className}`}></div>;
}
