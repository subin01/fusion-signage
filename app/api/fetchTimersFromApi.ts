export async function fetchTimersFromApi() {
  const res = await fetch("/api", { method: "GET" })
  if (!res.ok) return []
  const json = await res.json()
  return json.timers ?? []
}
