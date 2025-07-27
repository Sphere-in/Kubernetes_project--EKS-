//error/route.ts
import { NextResponse } from "next/server"
import { trackRequest, businessMetrics } from "../metrics/prometheus"

const errorScenarios = [
  { status: 400, message: "Bad Request - Invalid parameters" },
  { status: 401, message: "Unauthorized - Authentication required" },
  { status: 403, message: "Forbidden - Access denied" },
  { status: 404, message: "Not Found - Resource does not exist" },
  { status: 429, message: "Too Many Requests - Rate limit exceeded" },
  { status: 500, message: "Internal Server Error - Something went wrong" },
  { status: 502, message: "Bad Gateway - Upstream server error" },
  { status: 503, message: "Service Unavailable - Server overloaded" },
]

export async function GET() {
  const start = Date.now()
  const endpoint = "error"
  const method = "GET"

  try {
    // 20% chance of success, 80% chance of error
    if (Math.random() < 0.2) {
      const response = {
        status: "success",
        message: "Lucky! This time it worked",
        timestamp: new Date().toISOString(),
        attempts: Math.floor(Math.random() * 5) + 1,
      }

      const duration = Date.now() - start
      const responseSize = JSON.stringify(response).length

      trackRequest(endpoint, method, 200, duration, responseSize)

      // Update error rate (20% success = 80% error rate)
      businessMetrics.errorRate.set({ endpoint }, 80)

      return NextResponse.json(response)
    }

    // Random error scenario
    const scenario = errorScenarios[Math.floor(Math.random() * errorScenarios.length)]
    const duration = Date.now() - start

    const errorResponse = {
      error: scenario.message,
      timestamp: new Date().toISOString(),
      code: scenario.status,
      retry_after: Math.floor(Math.random() * 60) + 1,
    }

    const responseSize = JSON.stringify(errorResponse).length

    trackRequest(endpoint, method, scenario.status, duration, responseSize)

    // Update error rate
    businessMetrics.errorRate.set({ endpoint }, 80)

    return NextResponse.json(errorResponse, { status: scenario.status })
  } catch (error) {
    const duration = Date.now() - start
    trackRequest(endpoint, method, 500, duration)

    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 })
  }
}
