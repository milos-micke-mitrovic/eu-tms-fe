import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import type {
  TenantRequest,
  Tenant,
  CreateCompanyRequest,
  TenantCompany,
  CreateUserRequest,
  TenantAdmin,
} from '../types'

export function useCreateTenant() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TenantRequest) =>
      httpClient.post<Tenant>('/tenants', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdateTenant() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TenantRequest }) =>
      httpClient.put<Tenant>(`/tenants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeleteTenant() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/tenants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success(t('common:success.deleted'))
    },
  })
}

export function useToggleTenantStatus() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      httpClient.patch(`/tenants/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useCreateTenantCompany(tenantId: number) {
  const { t } = useTranslation('tenants')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) =>
      httpClient.post<TenantCompany>(`/tenants/${tenantId}/companies`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tenants', 'admins', tenantId],
      })
      toast.success(t('companies.createSuccess'))
    },
  })
}

export function useCreateTenantUser(tenantId: number) {
  const { t } = useTranslation('tenants')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserRequest) =>
      httpClient.post<TenantAdmin>(`/tenants/${tenantId}/users`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tenants', 'admins', tenantId],
      })
      toast.success(t('adminSheet.createSuccess'))
    },
  })
}
