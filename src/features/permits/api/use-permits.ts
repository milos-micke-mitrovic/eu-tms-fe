import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/shared/api/http-client'
import type { Permit } from '../types'

type PermitsPage = {
  content: Permit[]
  totalPages: number
  totalElements: number
}

export function usePermits(
  filter?: { permitType?: string; status?: string },
  page = 0,
  size = 20
) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (filter?.permitType) params.set('permitType', filter.permitType)
  if (filter?.status) params.set('status', filter.status)

  const { data, isLoading, error, refetch } = useQuery<PermitsPage>({
    queryKey: ['permits', filter?.permitType, filter?.status, page, size],
    queryFn: () => httpClient.get(`/permits?${params.toString()}`),
  })

  // Return shape compatible with page expectations
  return {
    data: data ? { permits: data } : undefined,
    loading: isLoading,
    error,
    refetch,
  }
}
