export interface Expense {
  id: number
  date: string
  category: string
  amount: number
  description: string
}

export interface CategorySummary {
  spent: number
  budget: number
  percentage: number
  status: "safe" | "warning" | "over" | "no-budget"
}

export interface DashboardData {
  summary: Record<string, CategorySummary>
  monthlyTotal: number
  pieData: {
    labels: string[]
    data: number[]
  }
}

export interface AllData {
  dashboard: DashboardData
  expenses: Expense[]
  warning?: string
}

export interface ComparisonData {
  main: string
  compare: string
  mainData: DashboardData
  compareData: DashboardData
  totalDiff: number
  diff: Record<string, { main: number; compare: number; change: number }>
}

export const CATEGORIES = ["Ăn uống", "Di chuyển", "Giải trí", "Mua sắm", "Hóa đơn", "Y tế", "Khác"]

export const CATEGORY_ICONS: Record<string, string> = {
  "Ăn uống": "🍜",
  "Di chuyển": "🚗",
  "Giải trí": "🎮",
  "Mua sắm": "🛒",
  "Hóa đơn": "📄",
  "Y tế": "💊",
  Khác: "📦",
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Ăn uống": "#f97316",
  "Di chuyển": "#3b82f6",
  "Giải trí": "#8b5cf6",
  "Mua sắm": "#ec4899",
  "Hóa đơn": "#14b8a6",
  "Y tế": "#ef4444",
  Khác: "#6b7280",
}

async function fetchApi(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })
  return response.json()
}

export async function getAllData(month?: string): Promise<AllData> {
  const params = new URLSearchParams({ action: "getAllData" })
  if (month) params.append("month", month)
  return fetchApi(`/api/expenses?${params}`)
}

export async function getDashboardData(month?: string): Promise<DashboardData> {
  const params = new URLSearchParams({ action: "getDashboardData" })
  if (month) params.append("month", month)
  return fetchApi(`/api/expenses?${params}`)
}

export async function getComparisonData(mainMonth: string, compareMonth: string): Promise<ComparisonData> {
  const params = new URLSearchParams({
    action: "getComparisonData",
    month: mainMonth,
    compareMonth,
  })
  return fetchApi(`/api/expenses?${params}`)
}

export async function addExpense(expense: { amount: number; category: string; description: string }) {
  return fetchApi("/api/expenses", {
    method: "POST",
    body: JSON.stringify({ action: "addExpense", expense }),
  })
}

export async function updateExpense(id: number, expense: { amount: number; category: string; description: string }) {
  return fetchApi("/api/expenses", {
    method: "POST",
    body: JSON.stringify({ action: "updateExpense", id, expense }),
  })
}

export async function deleteExpense(id: number) {
  return fetchApi("/api/expenses", {
    method: "POST",
    body: JSON.stringify({ action: "deleteExpense", id }),
  })
}

export async function setBudgets(budgets: Record<string, number>) {
  return fetchApi("/api/expenses", {
    method: "POST",
    body: JSON.stringify({ action: "setBudgets", budgets }),
  })
}

export function formatMoney(amount: number): string {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1).replace(".0", "") + "M"
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + "K"
  }
  return amount.toLocaleString("vi-VN")
}

export function formatMoneyFull(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND"
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
