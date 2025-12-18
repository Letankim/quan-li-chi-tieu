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

export const CATEGORIES = [
  "Ăn uống",
  "Di chuyển",
  "Giải trí",
  "Mua sắm",
  "Hóa đơn",
  "Y tế",
  "Khác",
]

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

const GAS_URL =
  process.env.NEXT_PUBLIC_GAS_URL ??
  "https://3docorp.id.vn/api.php"

const TIMEOUT_MS = 8000

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = TIMEOUT_MS
) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(url, {
      ...options,
      cache: "no-store",
    })
    return res
  } finally {
    clearTimeout(id)
  }
}

function safeParseJSON(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("Response is not JSON")
    return JSON.parse(match[0])
  }
}

async function fetchGAS(
  params?: URLSearchParams,
  body?: any
) {
  const url = params
    ? `${GAS_URL}?${params.toString()}`
    : GAS_URL

  const res = await fetchWithTimeout(url, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GAS Error ${res.status}: ${text}`)
  }

  const text = await res.text()
  return safeParseJSON(text)
}

export async function getAllData(month?: string): Promise<AllData> {
  const params = new URLSearchParams({ action: "getAllData" })
  if (month) params.append("month", month)
  return fetchGAS(params)
}

export async function getDashboardData(
  month?: string
): Promise<DashboardData> {
  const params = new URLSearchParams({
    action: "getDashboardData",
  })
  if (month) params.append("month", month)
  return fetchGAS(params)
}

export async function getComparisonData(
  mainMonth: string,
  compareMonth: string
): Promise<ComparisonData> {
  const params = new URLSearchParams({
    action: "getComparisonData",
    month: mainMonth,
    compareMonth,
  })
  return fetchGAS(params)
}

export async function addExpense(expense: {
  amount: number
  category: string
  description: string
}) {
  return fetchGAS(undefined, {
    action: "addExpense",
    expense,
  })
}

export async function updateExpense(
  id: number,
  expense: {
    amount: number
    category: string
    description: string
  }
) {
  return fetchGAS(undefined, {
    action: "updateExpense",
    id,
    expense,
  })
}

export async function deleteExpense(id: number) {
  return fetchGAS(undefined, {
    action: "deleteExpense",
    id,
  })
}

export async function setBudgets(
  budgets: Record<string, number>
) {
  return fetchGAS(undefined, {
    action: "setBudgets",
    budgets,
  })
}

// ================== FORMAT HELPERS ==================
export function formatMoney(amount: number): string {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace(".0", "") + "M"
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + "K"
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
