export type User = {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'DRIVER' | 'ACCOUNTING' | 'USER'
  tenantId: number
  companyId?: number
  department?: string
  status: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export type RefreshTokenRequest = {
  refreshToken: string
}

export type RefreshTokenResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export type JwtPayload = {
  sub: string
  tenant_id: number
  role: string
  first_name: string
  last_name: string
  email: string
  company_id?: number
  exp: number
  iat: number
}

export type AuthState = {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}
