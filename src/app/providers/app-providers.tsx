import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApolloProvider } from '@apollo/client/react'
import { Toaster, toast } from 'sonner'
import { apolloClient } from '@/shared/api/apollo-client'
import { getApiErrorMessage } from '@/shared/utils'
import { HttpError } from '@/shared/api/http-client'
import { ThemeProvider, useTheme } from '@/shared/components/theme-provider'
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
        if (error instanceof HttpError) {
          if (error.status === 403) {
            toast.error(i18n.t('common:errors.unauthorized'))
            return
          }
          if (error.status === 404) {
            toast.error(i18n.t('common:errors.notFound'))
            return
          }
        }
        const message = getApiErrorMessage(
          error,
          i18n.t('common:errors.generic')
        )
        toast.error(message)
      },
    },
  },
})

type AppProvidersProps = {
  children: ReactNode
}

function ThemedToaster() {
  const { theme } = useTheme()
  return (
    <Toaster position="bottom-right" richColors closeButton theme={theme} />
  )
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            {children}
            <ThemedToaster />
          </AuthProvider>
        </ApolloProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
