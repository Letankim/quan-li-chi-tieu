import { NextRequest, NextResponse } from "next/server"

const GAS_URL =
  process.env.GAS_URL ??
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
      signal: controller.signal,
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const action = searchParams.get("action") ?? "getAllData"
  const month = searchParams.get("month") ?? ""
  const compareMonth = searchParams.get("compareMonth") ?? ""

  const params = new URLSearchParams({ action })
  if (month) params.append("month", month)
  if (compareMonth) params.append("compareMonth", compareMonth)

  const url = `${GAS_URL}?${params.toString()}`

  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("GAS Error:", response)

      return NextResponse.json(
        {
          error: "Google Apps Script error",
          status: response.status,
        },
        { status: 502 }
      )
    }

    const text = await response.text()
    const data = safeParseJSON(text)

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error("GET API Error:", error)

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout (GAS too slow)" },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetchWithTimeout(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("GAS POST Error:", errText)

      return NextResponse.json(
        {
          error: "Google Apps Script error",
          status: response.status,
        },
        { status: 502 }
      )
    }

    const text = await response.text()
    const data = safeParseJSON(text)

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error("POST API Error:", error)

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout (GAS too slow)" },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
