export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
export const MAX_TIMERS = 7

export type PowerTimer = {
  timerNumber: number
  enabled: boolean
  powerOffTime: string // hh24:mm
  powerOnTime: string // hh24:mm
  daysOfWeek: string[] // "MONDAY" | ... | "SUNDAY"
}

export async function fetchPowerTimers() {
  const res = await fetch("/api", { method: "GET" })
  if (!res.ok) throw new Error("Failed to fetch timers")
  const json = await res.json()
  return json.timers ?? []
}

export async function savePowerTimers(timers: PowerTimer[]) {
  const res = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ timers }),
  })
  if (!res.ok) throw new Error("Failed to save timers")
  return res.json()
}
