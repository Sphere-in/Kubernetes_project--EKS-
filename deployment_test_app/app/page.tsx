"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Activity, Clock, AlertTriangle, Cpu, Home } from "lucide-react"

export default function HomePage() {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const callApi = async (endpoint: string, name: string) => {
    setLoading((prev) => ({ ...prev, [name]: true }))
    const startTime = Date.now()

    try {
      const response = await fetch(`/api/${endpoint}`)
      const data = await response.json()
      const duration = Date.now() - startTime

      setResponses((prev) => ({
        ...prev,
        [name]: {
          success: response.ok,
          data,
          duration,
          status: response.status,
        },
      }))
    } catch (error) {
      const duration = Date.now() - startTime
      setResponses((prev) => ({
        ...prev,
        [name]: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          duration,
          status: "Network Error",
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }))
    }
  }

  const apis = [
    {
      name: "normal",
      endpoint: "normal",
      title: "Normal Response",
      description: "Returns a quick, successful response",
      icon: Home,
      color: "bg-green-500",
    },
    {
      name: "slow",
      endpoint: "slow",
      title: "High Latency",
      description: "Simulates slow response (3-5 seconds)",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      name: "error",
      endpoint: "error",
      title: "Random Error",
      description: "Returns random HTTP errors",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    {
      name: "memory",
      endpoint: "memory",
      title: "Memory Intensive",
      description: "Consumes memory and CPU resources",
      icon: Cpu,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Kubernetes Monitoring Test App</h1>
          <p className="text-slate-600 text-lg">Test different API behaviors for monitoring and observability</p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline">Next.js</Badge>
            <Badge variant="outline">Kubernetes</Badge>
            <Badge variant="outline">Prometheus</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {apis.map((api) => {
            const Icon = api.icon
            const response = responses[api.name]
            const isLoading = loading[api.name]

            return (
              <Card key={api.name} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${api.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{api.title}</CardTitle>
                      <CardDescription className="text-sm">{api.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => callApi(api.endpoint, api.name)}
                    disabled={isLoading}
                    className="w-full mb-3"
                    variant={response?.success === false ? "destructive" : "default"}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      `Call ${api.title}`
                    )}
                  </Button>

                  {response && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <Badge variant={response.success ? "default" : "destructive"}>{response.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Duration:</span>
                        <span className="font-mono">{response.duration}ms</span>
                      </div>
                      {response.data && (
                        <div className="mt-2 p-2 bg-slate-100 rounded text-xs font-mono overflow-auto max-h-20">
                          {JSON.stringify(response.data, null, 2)}
                        </div>
                      )}
                      {response.error && (
                        <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-xs">{response.error}</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Monitoring Endpoints
            </CardTitle>
            <CardDescription>Additional endpoints for monitoring and observability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Prometheus Metrics</h3>
                <p className="text-sm text-slate-600 mb-2">Scrape endpoint for Prometheus monitoring</p>
                <Button variant="outline" size="sm" onClick={() => window.open("/api/metrics", "_blank")}>
                  View /api/metrics
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Health Check</h3>
                <p className="text-sm text-slate-600 mb-2">Basic health check endpoint for Kubernetes</p>
                <Button variant="outline" size="sm" onClick={() => callApi("health", "health")}>
                  Check Health
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
