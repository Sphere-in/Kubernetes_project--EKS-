//health/route.ts
import { NextResponse } from "next/server"
import { trackRequest, activeConnections } from "../metrics/prometheus"

export async function GET() {
  const start = Date.now()
  const endpoint = "health"
  const method = "GET"

  try {
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    // Simulate active connections (in a real app, this would be actual connection count)
    activeConnections.set(Math.floor(Math.random() * 50) + 10)

    const response = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      version: process.version,
      platform: process.platform,
      nodeEnv: process.env.NODE_ENV,
    }

    const duration = Date.now() - start
    const responseSize = JSON.stringify(response).length

    trackRequest(endpoint, method, 200, duration, responseSize)

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - start
    trackRequest(endpoint, method, 500, duration)

    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
