import type { User, JwtPayload } from '../types'

export function getUserDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim()
}

export function getUserInitials(user: User): string {
  const first = user.firstName?.charAt(0) || ''
  const last = user.lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase()
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Payload = token.split('.')[1]
    const payload = atob(base64Payload)
    return JSON.parse(payload)
  } catch {
    // global error handler shows toast
    return null
  }
}

export function jwtPayloadToUser(payload: JwtPayload): User {
  return {
    id: parseInt(payload.sub, 10),
    firstName: payload.first_name,
    lastName: payload.last_name,
    email: payload.email,
    role: payload.role as User['role'],
    tenantId: payload.tenant_id,
    companyId: payload.company_id,
    status: 'ACTIVE',
  }
}

export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'SUPER_ADMIN'
}

export function getDefaultRoute(user: User | null): string {
  if (isSuperAdmin(user)) return '/tenants'
  return '/dashboard'
}

/**
 * Filters a list of role values to only include roles visible to the current user.
 * SUPER_ADMIN is always hidden. ADMIN is hidden unless the viewer is SUPER_ADMIN.
 * DRIVER is hidden because drivers are managed in a separate tab.
 */
export function getVisibleRoles<T extends string>(
  roles: readonly T[],
  viewer: User | null
): T[] {
  return roles.filter((role) => {
    if (role === 'SUPER_ADMIN') return false
    if (role === 'DRIVER') return false
    if (role === 'ADMIN' && viewer?.role !== 'ADMIN' && !isSuperAdmin(viewer))
      return false
    return true
  })
}
