import { AUTH_STORAGE_KEY } from '@/shared/utils'
import { refreshAccessToken } from '@/features/auth/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

type RequestOptions = {
  headers?: Record<string, string>
  signal?: AbortSignal
  skipAuth?: boolean
  tenantId?: number
}

class HttpError extends Error {
  status: number
  statusText: string
  data?: unknown

  constructor(status: number, statusText: string, data?: unknown) {
    super(`HTTP ${status}: ${statusText}`)
    this.name = 'HttpError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

// Track if a refresh is in progress to prevent multiple concurrent refresh attempts
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

// Get stored auth data from localStorage
function getStoredAuth(): { token: string; refreshToken: string; user: unknown } | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Invalid JSON
  }
  return null
}

// Get token from localStorage
function getAuthToken(): string | null {
  const auth = getStoredAuth()
  return auth?.token || null
}

// Get refresh token from localStorage
function getRefreshToken(): string | null {
  const auth = getStoredAuth()
  return auth?.refreshToken || null
}

// Update tokens in localStorage
function updateStoredTokens(token: string, refreshToken: string): void {
  const auth = getStoredAuth()
  if (auth) {
    auth.token = token
    auth.refreshToken = refreshToken
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
  }
}

// Signal auth failure — AuthProvider handles cleanup and navigation
function handleUnauthorized() {
  window.dispatchEvent(new CustomEvent('auth:logout'))
}

// Attempt to refresh the access token
async function attemptTokenRefresh(): Promise<boolean> {
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  const currentRefreshToken = getRefreshToken()
  if (!currentRefreshToken) {
    return false
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const response = await refreshAccessToken(currentRefreshToken)
      updateStoredTokens(response.accessToken, response.refreshToken)
      window.dispatchEvent(
        new CustomEvent('auth:tokens-updated', {
          detail: { accessToken: response.accessToken, refreshToken: response.refreshToken },
        })
      )
      return true
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function handleResponse<T>(
  response: Response,
  retryFn?: () => Promise<Response>
): Promise<T> {
  // Handle 401/403 (Unauthorized/Forbidden) - try to refresh token
  if ((response.status === 401 || response.status === 403) && retryFn) {
    const refreshed = await attemptTokenRefresh()
    if (refreshed) {
      // Retry the original request with new token
      const retryResponse = await retryFn()
      return handleResponse<T>(retryResponse)
    }
    // Refresh failed, logout
    handleUnauthorized()
    throw new HttpError(response.status, response.statusText)
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new HttpError(response.status, response.statusText, data)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

function getHeaders(options: RequestOptions = {}): Headers {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers,
  })

  if (!options.skipAuth) {
    const token = getAuthToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  if (options.tenantId !== undefined) {
    headers.set('X-Tenant-Id', String(options.tenantId))
  }

  return headers
}

export const httpClient = {
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const makeRequest = () =>
      fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders(options),
        signal: options.signal,
      })

    const response = await makeRequest()
    const retryFn = options.skipAuth ? undefined : makeRequest
    return handleResponse<T>(response, retryFn)
  },

  async post<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const makeRequest = () =>
      fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(options),
        body: data ? JSON.stringify(data) : undefined,
        signal: options.signal,
      })

    const response = await makeRequest()
    const retryFn = options.skipAuth ? undefined : makeRequest
    return handleResponse<T>(response, retryFn)
  },

  async put<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const makeRequest = () =>
      fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(options),
        body: data ? JSON.stringify(data) : undefined,
        signal: options.signal,
      })

    const response = await makeRequest()
    const retryFn = options.skipAuth ? undefined : makeRequest
    return handleResponse<T>(response, retryFn)
  },

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const makeRequest = () =>
      fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(options),
        body: data ? JSON.stringify(data) : undefined,
        signal: options.signal,
      })

    const response = await makeRequest()
    const retryFn = options.skipAuth ? undefined : makeRequest
    return handleResponse<T>(response, retryFn)
  },

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const makeRequest = () =>
      fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(options),
        signal: options.signal,
      })

    const response = await makeRequest()
    const retryFn = options.skipAuth ? undefined : makeRequest
    return handleResponse<T>(response, retryFn)
  },
}

export { HttpError }
