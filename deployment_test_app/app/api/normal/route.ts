// normal/route.ts
import { NextResponse } from "next/server"
import { trackRequest } from "../metrics/prometheus"

export async function GET() {
  const start = Date.now()
  const endpoint = "normal"
  const method = "GET"

  try {
    // Simulate normal processing
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 100))

    const response = {
      status: "success",
      message: "Normal API response",
      timestamp: new Date().toISOString(),
      data: {
        id: Math.floor(Math.random() * 1000),
        value: Math.random() * 100,
        processed: true,
      },
    }

    const duration = Date.now() - start
    const responseSize = JSON.stringify(response).length

    // Track metrics
    trackRequest(endpoint, method, 200, duration, responseSize)

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - start
    trackRequest(endpoint, method, 500, duration)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
