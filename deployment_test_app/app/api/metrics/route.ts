//metrics/route.ts
import { NextResponse } from "next/server"
import { register } from "./prometheus"

export async function GET() {
  try {
    const metrics = await register.metrics()

    return new NextResponse(metrics, {
      headers: {
        "Content-Type": register.contentType,
      },
    })
  } catch (error) {
    console.error("Error generating metrics:", error)
    return NextResponse.json({ error: "Failed to generate metrics" }, { status: 500 })
  }
}
