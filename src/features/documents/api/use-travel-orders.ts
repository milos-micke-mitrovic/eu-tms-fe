import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { downloadFile } from '@/shared/utils/download-file'
import type { TravelOrder, TravelOrderRequest } from '../types'

export function useCreateTravelOrder() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: TravelOrderRequest) =>
      httpClient.post<TravelOrder>('/travel-orders', data),
    onSuccess: () => {
      toast.success(t('common:success.created'))
    },
  })
}

const travelOrderKeys = {
  all: ['travelOrders'] as const,
  byRoute: (routeId: string | number) =>
    [...travelOrderKeys.all, 'byRoute', routeId] as const,
}

export function useTravelOrdersByRoute(routeId: string | number) {
  return useQuery({
    queryKey: travelOrderKeys.byRoute(routeId),
    queryFn: () =>
      httpClient.get<TravelOrder[]>(`/travel-orders/by-route/${routeId}`),
    enabled: !!routeId,
  })
}

export function useUpdateTravelOrderStatus() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      httpClient.patch<TravelOrder>(`/travel-orders/${id}/status`, { status }),
    onSuccess: () => {
      toast.success(t('common:success.saved'))
    },
  })
}

export async function downloadTravelOrderPdf(
  orderId: number,
  orderNumber: string
) {
  return downloadFile(`/travel-orders/${orderId}/pdf`, `${orderNumber}.pdf`)
}
