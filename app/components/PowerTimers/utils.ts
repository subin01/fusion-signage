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
  return Array.isArray(json) ? json : []
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

type PowerTimerForm = PowerTimer & { isNew?: boolean }
export type FormData = { timers: PowerTimerForm[] }
export type FormError = Record<string, { type: "client" | "server"; message: string }> | undefined

export async function validator(values: FormData) {
  let errors: { timers?: Array<FormError> } = { timers: [] }
  let hasError = false
  values.timers.forEach((timer, i) => {
    if (timer.enabled) {
      const timerErrors: FormError = {}
      if (!timer.powerOffTime) {
        timerErrors.powerOffTime = { type: "client", message: "Power Off time is required." }
      }
      if (!timer.powerOnTime) {
        timerErrors.powerOnTime = { type: "client", message: "Power On time is required." }
      }
      const selectedDays = (timer.daysOfWeek || []).filter(Boolean)
      if (selectedDays.length === 0) {
        timerErrors.daysOfWeek = {
          type: "client",
          message: "At least one day must be selected.",
        }
      }
      if (Object.keys(timerErrors).length > 0) {
        errors.timers![i] = timerErrors
        hasError = true
      } else {
        errors.timers![i] = undefined
      }
    } else {
      errors.timers![i] = undefined
    }
  })
  if (!hasError) {
    errors = {}
  }
  return { values, errors }
}
