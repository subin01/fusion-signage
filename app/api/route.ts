import { NextRequest, NextResponse } from "next/server"

import { PowerTimer } from "./common"

async function fetchPowerTimers(): Promise<PowerTimer[]> {
  const defaultTimer = {
    timerNumber: 1,
    enabled: true,
    powerOffTime: "22:00",
    powerOnTime: "07:00",
    daysOfWeek: ["MONDAY"],
  }
  return [defaultTimer]
}

async function savePowerTimers(powerTimers: PowerTimer[]): Promise<{ message: string }> {
  console.log("Server -- Saving timers:", powerTimers)
  await new Promise((resolve) => setTimeout(resolve, 5000)) // 5 second delay

  return Promise.resolve({ message: "Timers saved successfully!" })
}

export async function GET() {
  try {
    const timers = await fetchPowerTimers()
    return NextResponse.json(timers)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await savePowerTimers(body)

    return NextResponse.json({
      message: "success",
      receivedData: body,
    })
  } catch {
    return NextResponse.json({ error: "error" }, { status: 400 })
  }
}
