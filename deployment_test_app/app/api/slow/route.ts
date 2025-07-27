// slow/route.ts
import { NextResponse } from "next/server"
import { trackRequest, businessMetrics } from "../metrics/prometheus"

export async function GET() {
  const start = Date.now()
  const endpoint = "slow"
  const method = "GET"

  try {
    // Simulate high latency (3-5 seconds)
    const delay = 3000 + Math.random() * 2000
    await new Promise((resolve) => setTimeout(resolve, delay))

    const response = {
      status: "success",
      message: "Slow API response completed",
      timestamp: new Date().toISOString(),
      delay: Math.round(delay),
      data: {
        processed: true,
        heavy_computation: Array.from({ length: 100 }, (_, i) => i * Math.random()),
      },
    }

    const duration = Date.now() - start
    const responseSize = JSON.stringify(response).length

    // Track metrics
    trackRequest(endpoint, method, 200, duration, responseSize)

    // Track slow request business metric
    businessMetrics.slowRequestsTotal.inc({ endpoint })

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - start
    trackRequest(endpoint, method, 500, duration)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
