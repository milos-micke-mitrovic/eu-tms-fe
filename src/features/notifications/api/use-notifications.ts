import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/shared/api/http-client'
import type { PageResponse } from '@/shared/types'
import type { Notification } from '../types'

const notificationKeys = {
  all: ['notifications'] as const,
  list: (page: number, size: number) =>
    [...notificationKeys.all, 'list', page, size] as const,
}

export function useNotifications(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: notificationKeys.list(page, size),
    queryFn: () =>
      httpClient.get<PageResponse<Notification>>(
        `/notifications?page=${page}&size=${size}`
      ),
    retry: false,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => httpClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => httpClient.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
