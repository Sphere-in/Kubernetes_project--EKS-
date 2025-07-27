// metrics/prometheus.ts
import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client"

// Enable collection of default metrics (CPU, memory, etc.)
collectDefaultMetrics({
  register,
  prefix: "nodejs_",
})

// API request counter
export const apiRequestsTotal = new Counter({
  name: "api_requests_total",
  help: "Total number of API requests",
  labelNames: ["endpoint", "method", "status_code"],
  registers: [register],
})

// API request duration histogram
export const apiRequestDuration = new Histogram({
  name: "api_request_duration_seconds",
  help: "Duration of API requests in seconds",
  labelNames: ["endpoint", "method"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], 
  registers: [register],
})

// HTTP request errors counter
export const httpErrorsTotal = new Counter({
  name: "http_errors_total",
  help: "Total number of HTTP errors",
  labelNames: ["endpoint", "method", "status_code", "error_type"],
  registers: [register],
})

// Memory usage gauge
export const memoryUsageBytes = new Gauge({
  name: "memory_usage_bytes",
  help: "Current memory usage in bytes",
  labelNames: ["type"],
  registers: [register],
})

// Active connections gauge
export const activeConnections = new Gauge({
  name: "active_connections",
  help: "Number of active connections",
  registers: [register],
})

// Custom business metrics
export const businessMetrics = {
  // Slow requests counter
  slowRequestsTotal: new Counter({
    name: "slow_requests_total",
    help: "Total number of slow requests (>3s)",
    labelNames: ["endpoint"],
    registers: [register],
  }),

  // Memory operations counter
  memoryOperationsTotal: new Counter({
    name: "memory_operations_total",
    help: "Total number of memory-intensive operations",
    labelNames: ["operation_type"],
    registers: [register],
  }),

  // Error rate gauge
  errorRate: new Gauge({
    name: "error_rate_percent",
    help: "Current error rate percentage",
    labelNames: ["endpoint"],
    registers: [register],
  }),

  // Response size histogram
  responseSizeBytes: new Histogram({
    name: "response_size_bytes",
    help: "Size of HTTP responses in bytes",
    labelNames: ["endpoint", "method"],
    buckets: [100, 1000, 10000, 100000, 1000000],
    registers: [register],
  }),
}

// Helper function to update memory metrics
export function updateMemoryMetrics() {
  const memUsage = process.memoryUsage()
  memoryUsageBytes.set({ type: "rss" }, memUsage.rss)
  memoryUsageBytes.set({ type: "heap_total" }, memUsage.heapTotal)
  memoryUsageBytes.set({ type: "heap_used" }, memUsage.heapUsed)
  memoryUsageBytes.set({ type: "external" }, memUsage.external)
  memoryUsageBytes.set({ type: "array_buffers" }, memUsage.arrayBuffers || 0)
}

// Helper function to track request metrics
export function trackRequest(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  responseSize?: number,
) {
  // Increment request counter
  apiRequestsTotal.inc({
    endpoint,
    method,
    status_code: statusCode.toString(),
  })

  // Record request duration
  apiRequestDuration.observe({ endpoint, method }, duration / 1000) // Convert to seconds

  // Track errors
  if (statusCode >= 400) {
    const errorType = statusCode >= 500 ? "server_error" : "client_error"
    httpErrorsTotal.inc({
      endpoint,
      method,
      status_code: statusCode.toString(),
      error_type: errorType,
    })
  }

  // Track slow requests
  if (duration > 3000) {
    businessMetrics.slowRequestsTotal.inc({ endpoint })
  }

  // Track response size if provided
  if (responseSize) {
    businessMetrics.responseSizeBytes.observe({ endpoint, method }, responseSize)
  }

  // Update memory metrics
  updateMemoryMetrics()
}

// Get the register for exporting metrics
export { register }
