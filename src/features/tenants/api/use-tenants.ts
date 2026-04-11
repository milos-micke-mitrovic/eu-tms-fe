import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/shared/api/http-client'
import type { Tenant } from '../types'

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
