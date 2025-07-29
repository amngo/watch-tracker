'use client'

import { api } from '@/trpc/react'

export function useNavigationCounts() {
  const {
    data: counts,
    isLoading,
    error,
  } = api.stats.navigationCounts.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 15000, // Consider data stale after 15 seconds
    }
  )

  return {
    counts: counts || {
      queue: 0,
      library: 0,
      notes: 0,
    },
    isLoading,
    error,
  }
}