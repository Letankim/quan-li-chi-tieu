import { type NextRequest, NextResponse } from "next/server"

const GAS_URL = process.env.GAS_URL || "https://script.google.com/macros/s/AKfycbwDbn2BpKTxHN5kgRaZcaeChU5QQAqtZvUrBVIOWxz2/dev"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get("action") || "getAllData"
  const month = searchParams.get("month") || ""
  const compareMonth = searchParams.get("compareMonth") || ""

  try {
    const params = new URLSearchParams({ action })
    if (month) params.append("month", month)
    if (compareMonth) params.append("compareMonth", compareMonth)

    const response = await fetch(`${GAS_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const text = await response.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid response format")
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const text = await response.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Invalid response format")
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
