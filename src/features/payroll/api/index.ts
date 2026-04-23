import { useQuery } from '@apollo/client/react'
import {
  useQuery as useTanstackQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import { downloadFile } from '@/shared/utils/download-file'
import type {
  GetPayrollsByMonthQuery,
  GetPayrollSummaryQuery,
  GetPayrollHistoryQuery,
  GetDriverAdvancesQuery,
} from '@/generated/graphql'
import type {
  DriverSalaryConfig,
  DriverSalaryConfigRequest,
  DriverAdvanceRequest,
  PayrollAdjustmentRequest,
  Payroll,
} from '../types'
import {
  GET_PAYROLLS_BY_MONTH,
  GET_PAYROLL_SUMMARY,
  GET_PAYROLL_HISTORY,
  GET_DRIVER_ADVANCES,
} from './payroll.queries'

// ── GraphQL reads ──────────────────────────

export function usePayrollsByMonth(monthYear: string) {
  return useQuery<GetPayrollsByMonthQuery>(GET_PAYROLLS_BY_MONTH, {
    variables: { monthYear },
    skip: !monthYear,
  })
}

export function usePayrollSummary(monthYear: string) {
  return useQuery<GetPayrollSummaryQuery>(GET_PAYROLL_SUMMARY, {
    variables: { monthYear },
    skip: !monthYear,
  })
}

export function usePayrollHistory(driverId: string | number | null) {
  return useQuery<GetPayrollHistoryQuery>(GET_PAYROLL_HISTORY, {
    variables: { driverId: String(driverId) },
    skip: !driverId,
  })
}

export function useDriverAdvancesGql(
  driverId: string | number | null,
  from: string,
  to: string
) {
  return useQuery<GetDriverAdvancesQuery>(GET_DRIVER_ADVANCES, {
    variables: { driverId: String(driverId), from, to },
    skip: !driverId,
  })
}

// ── REST reads (TanStack Query) ────────────

export function useSalaryConfigs(driverId: number | null) {
  return useTanstackQuery({
    queryKey: ['salary-config', driverId],
    queryFn: () =>
      httpClient.get<DriverSalaryConfig[]>(
        `/payroll/salary-config/driver/${driverId}`
      ),
    enabled: !!driverId,
  })
}

export function useUnsettledAdvances(driverId: number | null) {
  return useTanstackQuery({
    queryKey: ['advances', 'unsettled', driverId],
    queryFn: () =>
      httpClient.get<import('../types').DriverAdvance[]>(
        `/payroll/advances/driver/${driverId}/unsettled`
      ),
    enabled: !!driverId,
  })
}

// ── REST mutations ─────────────────────────

const REFETCH_QUERIES = ['GetPayrollsByMonth', 'GetPayrollSummary']

// Salary config
export function useCreateSalaryConfig() {
  const { t } = useTranslation('payroll')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DriverSalaryConfigRequest) =>
      httpClient.post<DriverSalaryConfig>('/payroll/salary-config', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-config'] })
      toast.success(t('toast.configSaved'))
    },
  })
}

export function useUpdateSalaryConfig() {
  const { t } = useTranslation('payroll')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: DriverSalaryConfigRequest
    }) =>
      httpClient.put<DriverSalaryConfig>(`/payroll/salary-config/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-config'] })
      toast.success(t('toast.configUpdated'))
    },
  })
}

export function useDeleteSalaryConfig() {
  const { t } = useTranslation('payroll')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      httpClient.delete(`/payroll/salary-config/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-config'] })
      toast.success(t('toast.configDeleted'))
    },
  })
}

// Advances
export function useCreateAdvance() {
  const { t } = useTranslation('payroll')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DriverAdvanceRequest) =>
      httpClient.post('/payroll/advances', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advances'] })
      apolloClient.refetchQueries({ include: ['GetDriverAdvances'] })
      toast.success(t('toast.advanceSaved'))
    },
  })
}

export function useUpdateAdvance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DriverAdvanceRequest }) =>
      httpClient.put(`/payroll/advances/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advances'] })
      apolloClient.refetchQueries({ include: ['GetDriverAdvances'] })
    },
  })
}

export function useDeleteAdvance() {
  const { t } = useTranslation('payroll')
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/payroll/advances/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advances'] })
      apolloClient.refetchQueries({ include: ['GetDriverAdvances'] })
      toast.success(t('toast.advanceDeleted'))
    },
  })
}

// Payroll operations
export function useGeneratePayroll() {
  const { t } = useTranslation('payroll')
  return useMutation({
    mutationFn: ({ driverId, month }: { driverId: number; month: string }) =>
      httpClient.post<Payroll>(
        `/payroll/generate?driverId=${driverId}&month=${month}`
      ),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success(t('toast.generated'))
    },
  })
}

export function useGenerateAllPayrolls() {
  const { t } = useTranslation('payroll')
  return useMutation({
    mutationFn: (month: string) =>
      httpClient.post<Payroll[]>(`/payroll/generate-all?month=${month}`),
    onSuccess: (data) => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      const count = Array.isArray(data) ? data.length : 0
      toast.success(t('toast.generatedAll', { count }))
    },
  })
}

export function useRecalculatePayroll() {
  const { t } = useTranslation('payroll')
  return useMutation({
    mutationFn: (id: number) =>
      httpClient.post<Payroll>(`/payroll/${id}/recalculate`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success(t('toast.recalculated'))
    },
  })
}

export function useAdjustPayroll() {
  const { t } = useTranslation('payroll')
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: PayrollAdjustmentRequest
    }) => httpClient.put<Payroll>(`/payroll/${id}/adjust`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success(t('toast.adjusted'))
    },
  })
}

export function useConfirmPayroll() {
  const { t } = useTranslation('payroll')
  return useMutation({
    mutationFn: (id: number) =>
      httpClient.patch<Payroll>(`/payroll/${id}/confirm`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success(t('toast.confirmed'))
    },
  })
}

export function useMarkPayrollPaid() {
  const { t } = useTranslation('payroll')
  return useMutation({
    mutationFn: (id: number) =>
      httpClient.patch<Payroll>(`/payroll/${id}/paid`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success(t('toast.markedPaid'))
    },
  })
}

// PDF download
export function usePayslipDownload() {
  return useCallback(async (payrollId: number) => {
    await downloadFile(
      `/payroll/${payrollId}/payslip`,
      `obracun_${payrollId}.pdf`
    )
  }, [])
}
