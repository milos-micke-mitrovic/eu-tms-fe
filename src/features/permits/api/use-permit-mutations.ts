import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { PermitRequest, PermitAssignRequest } from '../types'

function usePermitMutationDefaults() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['permits'] })
    apolloClient.refetchQueries({ include: ['Dashboard'] })
  }
}

export function useCreatePermit() {
  const { t } = useTranslation()
  const invalidate = usePermitMutationDefaults()
  return useMutation({
    mutationFn: (data: PermitRequest) => httpClient.post('/permits', data),
    onSuccess: () => {
      invalidate()
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdatePermit() {
  const { t } = useTranslation()
  const invalidate = usePermitMutationDefaults()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PermitRequest }) =>
      httpClient.put(`/permits/${id}`, data),
    onSuccess: () => {
      invalidate()
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeletePermit() {
  const { t } = useTranslation()
  const invalidate = usePermitMutationDefaults()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/permits/${id}`),
    onSuccess: () => {
      invalidate()
      toast.success(t('common:success.deleted'))
    },
  })
}

export function useAssignPermit() {
  const { t } = useTranslation()
  const invalidate = usePermitMutationDefaults()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PermitAssignRequest }) =>
      httpClient.post(`/permits/${id}/assign`, data),
    onSuccess: () => {
      invalidate()
      toast.success(t('common:success.saved'))
    },
  })
}

export function useReleasePermit() {
  const { t } = useTranslation()
  const invalidate = usePermitMutationDefaults()
  return useMutation({
    mutationFn: (id: number) => httpClient.post(`/permits/${id}/release`),
    onSuccess: () => {
      invalidate()
      toast.success(t('common:success.saved'))
    },
  })
}

export function useMarkPermitUsed() {
  const { t } = useTranslation()
  const invalidate = usePermitMutationDefaults()
  return useMutation({
    mutationFn: (id: number) => httpClient.post(`/permits/${id}/mark-used`),
    onSuccess: () => {
      invalidate()
      toast.success(t('common:success.saved'))
    },
  })
}
