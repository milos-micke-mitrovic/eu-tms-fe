import { useMutation } from '@tanstack/react-query'
import { httpClient } from '@/shared/api/http-client'
import type { LoginCredentials, LoginResponse, RefreshTokenResponse } from '../types'

// Query/Mutation keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
}

// API functions
async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return httpClient.post('/auth/login', credentials, { skipAuth: true })
}

async function logout(): Promise<void> {
  return httpClient.post('/auth/logout', {})
}

// Standalone refresh function - called from http-client, not from React components
export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  return response.json()
}

// Hooks
export function useLogin() {
  return useMutation({
    mutationKey: authKeys.session(),
    mutationFn: login,
  })
}

export function useLogout() {
  return useMutation({
    mutationKey: authKeys.session(),
    mutationFn: logout,
  })
}
