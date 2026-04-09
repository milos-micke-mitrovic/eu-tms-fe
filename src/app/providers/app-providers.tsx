import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloProvider } from '@apollo/client/react'
import { Toaster, toast } from 'sonner'
import { apolloClient } from '@/shared/api/apollo-client'
import { getApiErrorMessage } from '@/shared/utils'
import { ThemeProvider } from '@/shared/components/theme-provider'
import { AuthProvider } from '@/features/auth'
import i18n from '@/i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        const message = getApiErrorMessage(error, i18n.t('common:errors.generic'))
        toast.error(message)
      },
    },
  },
})

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
