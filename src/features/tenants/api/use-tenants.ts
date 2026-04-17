import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/shared/api/http-client'
import type { Tenant, TenantAdmin, TenantCompany } from '../types'

export function useTenants(activeOnly = false) {
  return useQuery<Tenant[]>({
    queryKey: ['tenants', { activeOnly }],
    queryFn: () => httpClient.get(activeOnly ? '/tenants/active' : '/tenants'),
  })
}

export function useSearchTenants(name: string) {
  return useQuery<Tenant[]>({
    queryKey: ['tenants', 'search', name],
    queryFn: () =>
      httpClient.get(`/tenants/search?name=${encodeURIComponent(name)}`),
    enabled: name.length > 0,
  })
}

export function useTenantAdmins(tenantId: number) {
  return useQuery<TenantAdmin[]>({
    queryKey: ['tenants', 'admins', tenantId],
    queryFn: () => httpClient.get(`/tenants/${tenantId}/admins`),
    enabled: tenantId > 0,
  })
}

export function useTenantCompanies(tenantId: number) {
  return useQuery<TenantCompany[]>({
    queryKey: ['tenants', 'companies', tenantId],
    queryFn: () => httpClient.get(`/tenants/${tenantId}/companies`),
    enabled: tenantId > 0,
  })
}

export function useTenantUsers(tenantId: number) {
  return useQuery<TenantAdmin[]>({
    queryKey: ['tenants', 'users', tenantId],
    queryFn: () => httpClient.get(`/tenants/${tenantId}/users`),
    enabled: tenantId > 0,
  })
}
