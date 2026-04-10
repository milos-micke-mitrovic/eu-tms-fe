import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { toast } from 'sonner'
import { AUTH_STORAGE_KEY } from '@/shared/utils'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const httpLink = createHttpLink({
  uri: `${API_BASE_URL.replace(/\/api$/, '')}/graphql`,
})

const authLink = setContext((_, { headers }) => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const { token } = JSON.parse(stored)
      if (token) {
        return {
          headers: {
            ...headers,
            Authorization: `Bearer ${token}`,
          },
        }
      }
    }
  } catch {
    // Invalid storage
  }
  return { headers }
})

const errorLink = onError(({ error, operation }) => {
  const isMutation = operation.query.definitions.some(
    (d) => d.kind === 'OperationDefinition' && d.operation === 'mutation'
  )

  if (CombinedGraphQLErrors.is(error)) {
    let isUnauth = false
    for (const err of error.errors) {
      if (err.extensions?.classification === 'UNAUTHORIZED') {
        isUnauth = true
        break
      }
    }
    if (isUnauth) {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    } else if (isMutation) {
      // Only toast errors for mutations — query errors are handled by UI
      const message = error.errors[0]?.message
      if (message) toast.error(message)
    }
  } else if (error && 'statusCode' in error) {
    const statusCode = (error as { statusCode: number }).statusCode
    if (statusCode === 401) {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
  }
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})
