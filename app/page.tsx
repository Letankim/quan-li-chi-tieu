"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import {
  getAllData,
  getDashboardData,
  getComparisonData,
  addExpense,
  updateExpense,
  deleteExpense,
  setBudgets,
  formatMoney,
  formatMoneyFull,
  formatDate,
  CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  type Expense,
  type DashboardData,
  type ComparisonData,
} from "@/lib/api";
import { Toast } from "@/components/toast";
import { LoadingOverlay, ErrorMessage } from "@/components/loading";
import { Modal, DeleteModal } from "@/components/modal";
import { ExpenseForm } from "@/components/expense-form";
import { PieChart } from "@/components/pie-chart";

import {
  Home,
  History,
  BarChart3,
  Wallet,
  Plus,
  RefreshCw,
  Calendar,
  TrendingUp,
  PieChart as PieChartIcon,
  Search,
  Receipt,
  Pencil,
  Trash2,
  Target,
  Save,
} from "lucide-react";

type Tab = "overview" | "history" | "compare" | "budget";
type ToastType = "success" | "error" | "warning" | "info";

export default function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [mainMonth, setMainMonth] = useState(selectedMonth);
  const [compareMonth, setCompareMonth] = useState(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const data = await getAllData();
      setDashboard(data.dashboard);
      setExpenses(data.expenses || []);
      setFilteredExpenses(data.expenses || []);
      if (data.warning) {
        showToast(data.warning, "warning");
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMonthData = async (month: string) => {
    try {
      showToast("Đang tải dữ liệu tháng...", "info");
      const data = await getDashboardData(month);
      setDashboard(data);
      showToast("Đã tải xong!", "success");
    } catch {
      showToast("Lỗi khi tải dữ liệu", "error");
    }
  };

  const loadComparison = async () => {
    if (!mainMonth || !compareMonth) {
      showToast("Vui lòng chọn cả 2 tháng", "warning");
      return;
    }
    try {
      showToast("Đang so sánh...", "info");
      const data = await getComparisonData(mainMonth, compareMonth);
      setComparison(data);
      showToast("Đã so sánh xong!", "success");
    } catch {
      showToast("Lỗi khi so sánh", "error");
    }
  };

  const handleAddExpense = async (expense: {
    amount: number;
    category: string;
    description: string;
  }) => {
    try {
      setIsSubmitting(true);
      const result = await addExpense(expense);
      setDashboard(result.dashboard);
      setExpenses(result.expenses || []);
      setFilteredExpenses(result.expenses || []);
      setShowAddModal(false);
      showToast("Đã thêm thành công!", "success");
    } catch {
      showToast("Lỗi khi thêm", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExpense = async (expense: {
    amount: number;
    category: string;
    description: string;
  }) => {
    if (!editingExpense) return;
    try {
      setIsSubmitting(true);
      const result = await updateExpense(editingExpense.id, expense);
      setDashboard(result.dashboard);
      setExpenses(result.expenses || []);
      setFilteredExpenses(result.expenses || []);
      setShowAddModal(false);
      setEditingExpense(null);
      showToast("Đã cập nhật thành công!", "success");
    } catch {
      showToast("Lỗi khi cập nhật", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteId) return;
    try {
      setShowDeleteModal(false);
      showToast("Đang xóa...", "info");
      const result = await deleteExpense(deleteId);
      setDashboard(result.dashboard);
      setExpenses(result.expenses || []);
      setFilteredExpenses(result.expenses || []);
      setDeleteId(null);
      showToast("Đã xóa thành công!", "success");
    } catch {
      showToast("Lỗi khi xóa", "error");
    }
  };

  const handleSaveBudgets = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const budgets: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      budgets[cat] =
        Number.parseInt(formData.get(`budget_${cat}`) as string) || 0;
    });
    try {
      setIsSubmitting(true);
      showToast("Đang lưu ngân sách...", "info");
      await setBudgets(budgets);
      showToast("Đã lưu ngân sách thành công!", "success");
      loadData();
    } catch {
      showToast("Lỗi khi lưu ngân sách", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (exp) =>
          (exp.description || "").toLowerCase().includes(query) ||
          exp.category.toLowerCase().includes(query)
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((exp) => exp.category === filterCategory);
    }

    if (filterFromDate) {
      filtered = filtered.filter(
        (exp) => exp.date.split("T")[0] >= filterFromDate
      );
    }

    if (filterToDate) {
      filtered = filtered.filter(
        (exp) => exp.date.split("T")[0] <= filterToDate
      );
    }

    setFilteredExpenses(filtered);
    setShowFilter(false);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setFilterFromDate("");
    setFilterToDate("");
    setFilteredExpenses(expenses);
    setShowFilter(false);
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setShowAddModal(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddModal(true);
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const filterPieData = (
    pieData: { labels: string[]; data: number[] } | undefined
  ) => {
    if (!pieData || !pieData.data || pieData.data.length === 0) return null;

    const filteredLabels: string[] = [];
    const filteredValues: number[] = [];

    pieData.data.forEach((value, index) => {
      if (value > 0) {
        filteredValues.push(value);
        filteredLabels.push(pieData.labels[index]);
      }
    });

    if (filteredValues.length === 0) return null;

    return { labels: filteredLabels, data: filteredValues };
  };

  if (isLoading) return <LoadingOverlay />;
  if (hasError) return <ErrorMessage onRetry={loadData} />;

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-32">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="px-4 py-4 border-b border-gray-100/50 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-xl z-40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Chi Tiêu</h1>
            <p className="text-sm text-gray-400">Quản lý thông minh</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg btn-bounce"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button
            onClick={loadData}
            className="w-12 h-12 rounded-2xl bg-gray-100 active:bg-gray-200 flex items-center justify-center btn-bounce"
          >
            <RefreshCw className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Month Selector for Overview */}
      {activeTab === "overview" && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-soft border border-gray-100">
            <Calendar className="w-6 h-6 text-gray-600" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                loadMonthData(e.target.value);
              }}
              className="flex-1 bg-transparent border-none text-gray-700 font-semibold text-lg outline-none"
            />
          </div>
        </div>
      )}

      {activeTab === "overview" && dashboard && (
        <div className="px-4 py-5 space-y-5">
          <div className="gradient-primary rounded-3xl shadow-xl p-7 text-white text-center relative overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <p className="text-white/80 text-base font-medium uppercase tracking-wider">
              Tổng chi tháng này
            </p>
            <p className="text-3xl font-extrabold mt-3">
              {formatMoneyFull(dashboard.monthlyTotal || 0)}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-white/70 text-sm">
              <TrendingUp className="w-5 h-5" />
              <span>Cập nhật realtime</span>
            </div>
          </div>

          {/* Budget Cards */}
          <div className="grid grid-cols-2 gap-3">
            {dashboard.summary &&
              Object.entries(dashboard.summary).map(([cat, info]) => {
                const icon = CATEGORY_ICONS[cat] || "📦";
                const spent = info.spent || 0;
                const budget = info.budget || 0;
                const percentage =
                  budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

                let statusColor = "bg-emerald-500";
                if (percentage > 80) statusColor = "bg-red-500";
                else if (percentage > 50) statusColor = "bg-amber-500";

                return (
                  <div
                    key={cat}
                    className="bg-white rounded-2xl shadow-soft p-4 border border-gray-100 animate-in fade-in duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{icon}</span>
                      <span className="text-base font-semibold text-gray-800 truncate">
                        {cat}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {formatMoney(spent)}
                    </p>
                    {budget > 0 ? (
                      <div className="mt-3">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`${statusColor} h-full rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          /{formatMoney(budget)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 mt-3">
                        Chưa đặt ngân sách
                      </p>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-3xl shadow-soft p-5 border border-gray-100 animate-in slide-in-from-bottom duration-300">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <PieChartIcon className="w-5 h-5 text-indigo-600" />
              </div>
              Phân bố chi tiêu
            </h2>
            {(() => {
              const filtered = filterPieData(dashboard.pieData);
              return filtered ? (
                <PieChart data={filtered.data} labels={filtered.labels} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <PieChartIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">Chưa có dữ liệu</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="px-4 py-5 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Lịch sử chi tiêu
            </h2>
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="w-12 h-12 rounded-2xl bg-indigo-100 active:bg-indigo-200 flex items-center justify-center btn-bounce"
            >
              <Search className="w-6 h-6 text-indigo-600" />
            </button>
          </div>

          {/* Filter Form */}
          {showFilter && (
            <div className="bg-white rounded-2xl shadow-soft p-4 border border-gray-100 space-y-4 animate-in slide-in-from-top duration-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block font-medium">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-3.5 text-base"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block font-medium">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-3 py-3.5 text-base"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block font-medium">
                  Danh mục
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-3 py-3.5 text-base appearance-none bg-white"
                >
                  <option value="">Tất cả</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-2xl py-3.5 font-semibold text-base active:bg-gray-200 btn-bounce"
                >
                  Xóa lọc
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 gradient-primary text-white rounded-2xl py-3.5 font-semibold text-base shadow-lg btn-bounce"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}

          {/* Summary Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold">
              {filteredExpenses.length} giao dịch
            </span>
            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
              {formatMoneyFull(totalFiltered)}
            </span>
          </div>

          {/* Expense List */}
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Receipt className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-xl font-medium">
                Không có chi tiêu nào
              </p>
              <p className="text-gray-400 text-base mt-2">
                Thêm chi tiêu mới để bắt đầu!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...filteredExpenses]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((exp, index) => {
                  const icon = CATEGORY_ICONS[exp.category] || "📦";
                  const color = CATEGORY_COLORS[exp.category] || "#6b7280";

                  return (
                    <div
                      key={index} // Đã thay đổi thành index để đảm bảo key luôn unique (tránh lỗi duplicate key nếu dữ liệu có id trùng)
                      className="bg-white rounded-2xl shadow-soft p-4 border border-gray-100 animate-in fade-in duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                          style={{ background: `${color}20` }}
                        >
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-base truncate">
                            {exp.description || "Không có mô tả"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {exp.category}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(exp.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">
                            {formatMoney(exp.amount)}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => openEditModal(exp)}
                              className="w-10 h-10 rounded-xl bg-blue-50 active:bg-blue-100 flex items-center justify-center btn-bounce"
                            >
                              <Pencil className="w-5 h-5 text-blue-600" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(exp.id)}
                              className="w-10 h-10 rounded-xl bg-red-50 active:bg-red-100 flex items-center justify-center btn-bounce"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Tab: So sánh */}
      {activeTab === "compare" && (
        <div className="px-4 py-5 space-y-5">
          <div className="bg-white rounded-2xl shadow-soft p-4 border border-gray-100">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full gradient-primary"></span>
                  Tháng chính
                </label>
                <input
                  type="month"
                  value={mainMonth}
                  onChange={(e) => setMainMonth(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-3 py-3.5 text-base"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                  Tháng so sánh
                </label>
                <input
                  type="month"
                  value={compareMonth}
                  onChange={(e) => setCompareMonth(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-3 py-3.5 text-base"
                />
              </div>
            </div>
            <button
              onClick={loadComparison}
              className="mt-4 w-full gradient-primary text-white rounded-2xl py-3.5 font-semibold text-base shadow-lg btn-bounce"
            >
              <BarChart3 className="w-5 h-5 inline-block mr-2" />
              So sánh
            </button>
          </div>

          {comparison && (
            <div className="space-y-5 animate-in slide-in-from-bottom duration-300">
              <p className="text-center text-lg font-bold text-gray-800">
                {comparison.mainMonth} vs {comparison.compareMonth}
              </p>

              {/* Tổng thay đổi */}
              <div
                className={`${
                  comparison.totalDiff > 0
                    ? "gradient-danger"
                    : comparison.totalDiff < 0
                    ? "gradient-success"
                    : "gradient-primary"
                } rounded-2xl shadow-xl p-6 text-white text-center relative overflow-hidden`}
              >
                <p className="text-white/80 text-base font-medium">
                  Thay đổi tổng chi
                </p>
                <p className="text-2xl font-extrabold mt-2">
                  {comparison.totalDiff > 0
                    ? "+"
                    : comparison.totalDiff < 0
                    ? "-"
                    : ""}
                  {formatMoneyFull(Math.abs(comparison.totalDiff))}
                </p>
                <p className="text-base mt-2 text-white/80">
                  {comparison.compareData?.monthlyTotal > 0
                    ? `${
                        comparison.totalDiff > 0
                          ? "+"
                          : comparison.totalDiff < 0
                          ? "-"
                          : ""
                      }${Math.abs(
                        (comparison.totalDiff /
                          comparison.compareData.monthlyTotal) *
                          100
                      ).toFixed(1)}%`
                    : "0%"}{" "}
                  so với tháng trước
                </p>
              </div>

              {/* Category diff - hiển thị tất cả */}
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const data = comparison.diff?.[cat] || {
                    main: 0,
                    compare: 0,
                  };
                  const change = data.main - data.compare;

                  return (
                    <div
                      key={cat}
                      className="bg-white rounded-2xl shadow-soft p-4 border border-gray-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {CATEGORY_ICONS[cat] || "📦"}
                        </span>
                        <span className="font-semibold text-gray-800 text-sm">
                          {cat}
                        </span>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          change > 0
                            ? "text-red-500"
                            : change < 0
                            ? "text-emerald-500"
                            : "text-gray-500"
                        }`}
                      >
                        {change > 0 ? "+" : change < 0 ? "-" : ""}
                        {formatMoney(Math.abs(change))}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatMoney(data.main)} / {formatMoney(data.compare)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl shadow-soft p-4 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 text-center">
                    {comparison.mainMonth}
                  </h3>
                  {(() => {
                    const filtered = filterPieData(
                      comparison.mainData?.pieData
                    );
                    return filtered ? (
                      <PieChart
                        data={filtered.data}
                        labels={filtered.labels}
                        showLegend={false}
                        size={140}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                          <PieChartIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-xs">Chưa có dữ liệu</p>
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-white rounded-2xl shadow-soft p-4 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-3 text-center">
                    {comparison.compareMonth}
                  </h3>
                  {(() => {
                    const filtered = filterPieData(
                      comparison.compareData?.pieData
                    );
                    return filtered ? (
                      <PieChart
                        data={filtered.data}
                        labels={filtered.labels}
                        showLegend={false}
                        size={140}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                          <PieChartIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-xs">Chưa có dữ liệu</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "budget" && (
        <div className="px-4 py-5">
          <div className="bg-white rounded-2xl shadow-soft p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Ngân sách tháng
                </h2>
                <p className="text-sm text-gray-500">
                  Thiết lập giới hạn chi tiêu
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBudgets} className="space-y-4">
              {CATEGORIES.map((cat) => {
                const icon = CATEGORY_ICONS[cat];
                const budget = dashboard?.summary?.[cat]?.budget || 0;

                return (
                  <div
                    key={cat}
                    className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4"
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="flex-1 font-semibold text-gray-700 text-base">
                      {cat}
                    </span>
                    <input
                      type="number"
                      name={`budget_${cat}`}
                      defaultValue={budget || undefined}
                      placeholder="0"
                      inputMode="numeric"
                      className="w-32 border border-gray-200 rounded-xl px-3 py-3 text-base text-right font-medium"
                    />
                  </div>
                );
              })}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-primary text-white font-semibold rounded-2xl px-5 py-4 text-base shadow-lg btn-bounce mt-6 disabled:opacity-50"
              >
                <Save className="w-5 h-5 inline-block mr-2" />
                {isSubmitting ? "Đang lưu..." : "Lưu ngân sách"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-gray-200 shadow-2xl z-[100] safe-bottom">
        <div className="grid grid-cols-4 py-3">
          {[
            { id: "overview" as Tab, Icon: Home, label: "Tổng quan" },
            { id: "history" as Tab, Icon: History, label: "Lịch sử" },
            { id: "compare" as Tab, Icon: BarChart3, label: "So sánh" },
            { id: "budget" as Tab, Icon: Wallet, label: "Ngân sách" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center py-2 ${
                activeTab === tab.id ? "text-indigo-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-12 h-9 rounded-2xl flex items-center justify-center mb-1 ${
                  activeTab === tab.id ? "bg-indigo-100" : ""
                }`}
              >
                <tab.Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? "Sửa chi tiêu" : "Thêm chi tiêu mới"}
      >
        <ExpenseForm
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          onCancel={() => {
            setShowAddModal(false);
            setEditingExpense(null);
          }}
          initialData={editingExpense}
          isLoading={isSubmitting}
        />
      </Modal>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        onConfirm={handleDeleteExpense}
      />
    </div>
  );
}
