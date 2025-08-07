"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { PrivyProvider } from '@privy-io/react-auth'
import { privyAppId, privyConfig } from './privy-config'
import { useState } from "react"

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  
  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </PrivyProvider>
  )
}