import type { ReactNode } from 'react'

import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { appConfig } from '@/core/data-access/app-config'
import { ThemeProvider } from '@/core/data-access/theme-provider'

const queryClient = new QueryClient()

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider {...appConfig.privy}>{children}</PrivyProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
