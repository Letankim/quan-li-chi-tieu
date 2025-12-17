"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { CATEGORIES, CATEGORY_ICONS, type Expense } from "@/lib/api";

interface ExpenseFormProps {
  onSubmit: (expense: {
    category: string;
    amount: number;
    description: string;
  }) => void;
  onCancel: () => void;
  initialData?: Expense | null;
  isLoading?: boolean;
}

export function ExpenseForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: ExpenseFormProps) {
  const [category, setCategory] = useState(initialData?.category || "");
  const [formattedAmount, setFormattedAmount] = useState("");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setFormattedAmount(
        initialData.amount > 0 ? initialData.amount.toLocaleString("vi-VN") : ""
      );
      setDescription(initialData.description || "");
    } else {
      setCategory("");
      setFormattedAmount("");
      setDescription("");
    }
  }, [initialData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digitsOnly = input.replace(/\D/g, "");
    const formatted = digitsOnly
      ? Number(digitsOnly).toLocaleString("vi-VN")
      : "";
    setFormattedAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const rawAmount = formattedAmount
      ? Number(formattedAmount.replace(/\./g, ""))
      : 0;

    if (!rawAmount || rawAmount <= 0 || !category) {
      return;
    }

    onSubmit({
      category,
      amount: rawAmount,
      description,
    });
  };

  const rawAmount = formattedAmount
    ? Number(formattedAmount.replace(/\./g, ""))
    : 0;
  const isSubmitDisabled = isLoading || rawAmount <= 0 || !category;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-base font-semibold text-gray-700 mb-2 block">
          Số tiền (VND)
        </label>
        <input
          type="text" 
          inputMode="numeric"
          value={formattedAmount}
          onChange={handleAmountChange}
          required
          placeholder="0"
          className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-xl font-semibold text-right focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
        />
      </div>

      <div>
        <label className="text-base font-semibold text-gray-700 mb-2 block">
          Danh mục
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg appearance-none bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
        >
          <option value="">Chọn danh mục</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_ICONS[cat]} {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-base font-semibold text-gray-700 mb-2 block">
          Mô tả
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả chi tiêu (tùy chọn)"
          className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
        />
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-4 font-semibold text-lg btn-bounce disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="flex-1 gradient-primary text-white rounded-2xl py-4 font-semibold text-lg shadow-lg btn-bounce disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>✓ Lưu</>
          )}
        </button>
      </div>
    </form>
  );
}
