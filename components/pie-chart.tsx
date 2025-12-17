"use client"

import { useEffect, useRef } from "react"
import { CATEGORY_COLORS } from "@/lib/api"

interface PieChartProps {
  data: number[]
  labels: string[]
  showLegend?: boolean
  size?: number
}

export function PieChart({ data, labels, showLegend = true, size = 200 }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Filter out zero values
    const filteredData: number[] = []
    const filteredLabels: string[] = []
    const filteredColors: string[] = []

    labels.forEach((label, i) => {
      if (data[i] > 0) {
        filteredData.push(data[i])
        filteredLabels.push(label)
        filteredColors.push(CATEGORY_COLORS[label] || "#6b7280")
      }
    })

    if (filteredData.length === 0) return

    const total = filteredData.reduce((sum, val) => sum + val, 0)
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10
    const innerRadius = radius * 0.6

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let startAngle = -Math.PI / 2

    filteredData.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fillStyle = filteredColors[index]
      ctx.fill()

      startAngle += sliceAngle
    })

    // Draw inner circle (donut hole)
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
    ctx.fillStyle = "#ffffff"
    ctx.fill()
  }, [data, labels])

  const filteredItems = labels
    .map((label, i) => ({ label, value: data[i], color: CATEGORY_COLORS[label] || "#6b7280" }))
    .filter((item) => item.value > 0)

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-14">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-5xl">📊</span>
        </div>
        <p className="text-gray-500 text-xl">Chưa có dữ liệu</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} width={size} height={size} style={{ maxWidth: "100%", height: "auto" }} />
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-3">
          {filteredItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
