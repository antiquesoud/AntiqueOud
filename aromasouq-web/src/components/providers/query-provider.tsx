'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'
import { AuthHydration } from './auth-hydration'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a stable QueryClient instance per component instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch on component mount
        refetchOnReconnect: false, // Don't refetch on network reconnect
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydration />
      {children}
    </QueryClientProvider>
  )
}
