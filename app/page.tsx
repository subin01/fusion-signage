import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

import PowerTimers from "@/app/components/PowerTimers"

import { fetchPowerTimers } from "@/app/components/PowerTimers/utils"

export default async function Home() {
  const queryClient = new QueryClient()

  // Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: ["timers"],
    queryFn: fetchPowerTimers,
  })

  return (
    <main>
      <h1>Edit Power Timers</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PowerTimers />
      </HydrationBoundary>
    </main>
  )
}
