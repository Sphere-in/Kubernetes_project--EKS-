//memory/route.ts
import { NextResponse } from "next/server"
import { trackRequest, businessMetrics, memoryUsageBytes } from "../metrics/prometheus"

export async function GET() {
  const start = Date.now()
  const endpoint = "memory"
  const method = "GET"
  const initialMemory = process.memoryUsage()

  try {
    // Track memory operation
    businessMetrics.memoryOperationsTotal.inc({ operation_type: "intensive_computation" })

    // Simulate memory-intensive operation
    const largeArray: number[][] = []
    const iterations = 1000 + Math.floor(Math.random() * 2000)

    for (let i = 0; i < iterations; i++) {
      // Create arrays of random data
      largeArray.push(Array.from({ length: 100 }, () => Math.random()))

      // Simulate CPU-intensive calculation
      if (i % 100 === 0) {
        let sum = 0
        for (let j = 0; j < 10000; j++) {
          sum += Math.sqrt(j) * Math.sin(j)
        }
      }
    }

    // Force garbage collection awareness
    const finalMemory = process.memoryUsage()
    const memoryDelta = finalMemory.heapUsed - initialMemory.heapUsed

    // Update memory metrics
    memoryUsageBytes.set({ type: "heap_used_after_operation" }, finalMemory.heapUsed)
    memoryUsageBytes.set({ type: "memory_delta" }, memoryDelta)

    const response = {
      status: "success",
      message: "Memory intensive operation completed",
      timestamp: new Date().toISOString(),
      stats: {
        iterations,
        arrayLength: largeArray.length,
        memoryUsage: {
          initial: initialMemory,
          final: finalMemory,
          delta: memoryDelta,
        },
        processingTime: Date.now() - start,
      },
    }

    const duration = Date.now() - start
    const responseSize = JSON.stringify(response).length

    trackRequest(endpoint, method, 200, duration, responseSize)

    // Clear the large array to help with garbage collection
    largeArray.length = 0

    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - start
    trackRequest(endpoint, method, 500, duration)

    return NextResponse.json({ error: "Memory operation failed" }, { status: 500 })
  }
}
