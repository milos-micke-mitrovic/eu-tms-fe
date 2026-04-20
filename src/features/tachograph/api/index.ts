import { useQuery } from '@apollo/client/react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'
import type {
  GetTachographEntriesQuery,
  GetTachographWeeklySummaryQuery,
  GetTachographDriverStatusesQuery,
  GetTachographViolationsQuery,
  GetTachographMonthlySummaryQuery,
  GetTachographComplianceQuery,
  GetTachographTopViolatorsQuery,
  TachographEntry,
} from '@/generated/graphql'
import type {
  TachographEntryRequest,
  DddParseResult,
  DddImportResult,
} from '../types'
import { downloadFile } from '@/shared/utils/download-file'
import {
  GET_TACHOGRAPH_ENTRIES,
  GET_TACHOGRAPH_WEEKLY_SUMMARY,
  GET_TACHOGRAPH_DRIVER_STATUSES,
  GET_TACHOGRAPH_VIOLATIONS,
  GET_TACHOGRAPH_MONTHLY_SUMMARY,
  GET_TACHOGRAPH_COMPLIANCE,
  GET_TACHOGRAPH_TOP_VIOLATORS,
} from './tachograph.queries'

// ── GraphQL reads ──────────────────────────────────────

// REST response type for mutations (includes violations in response body)
type TachographEntryResponse = TachographEntry & {
  violations: Array<{
    id: string
    violationType: string
    severity: string
    description?: string | null
  }>
}

export function useTachographEntries(
  driverId: string | number | null,
  from: string,
  to: string
) {
  return useQuery<GetTachographEntriesQuery>(GET_TACHOGRAPH_ENTRIES, {
    variables: { driverId: String(driverId), from, to },
    skip: !driverId,
  })
}

export function useTachographWeeklySummary(
  driverId: string | number | null,
  weekStart: string
) {
  return useQuery<GetTachographWeeklySummaryQuery>(
    GET_TACHOGRAPH_WEEKLY_SUMMARY,
    {
      variables: { driverId: String(driverId), weekStart },
      skip: !driverId || !weekStart,
    }
  )
}

export function useTachographDriverStatuses() {
  return useQuery<GetTachographDriverStatusesQuery>(
    GET_TACHOGRAPH_DRIVER_STATUSES
  )
}

export function useTachographViolations(
  driverId: string | number | null,
  from: string,
  to: string
) {
  return useQuery<GetTachographViolationsQuery>(GET_TACHOGRAPH_VIOLATIONS, {
    variables: { driverId: String(driverId), from, to },
    skip: !driverId,
  })
}

// ── REST mutations ─────────────────────────────────────

const REFETCH_QUERIES = [
  'GetTachographEntries',
  'GetTachographDriverStatuses',
  'GetTachographWeeklySummary',
]

export function useCreateTachographEntry() {
  const { t } = useTranslation('tachograph')
  return useMutation({
    mutationFn: (data: TachographEntryRequest) =>
      httpClient.post<TachographEntryResponse>('/tachograph/entries', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success(t('entry.createSuccess'))
    },
  })
}

export function useUpdateTachographEntry() {
  const { t } = useTranslation('tachograph')
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TachographEntryRequest }) =>
      httpClient.put<TachographEntryResponse>(
        `/tachograph/entries/${id}`,
        data
      ),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success(t('entry.updateSuccess'))
    },
  })
}

export function useDeleteTachographEntry() {
  const { t } = useTranslation('tachograph')
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/tachograph/entries/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success(t('entry.deleteSuccess'))
    },
  })
}

export function useConfirmTachographEntry() {
  const { t } = useTranslation('tachograph')
  return useMutation({
    mutationFn: (id: number) =>
      httpClient.patch<TachographEntryResponse>(
        `/tachograph/entries/${id}/confirm`
      ),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success(t('entry.confirmSuccess'))
    },
  })
}

// ── Sprint 7: Dashboard GraphQL reads ──────────────────

export function useTachographMonthlySummary(from: string, to: string) {
  return useQuery<GetTachographMonthlySummaryQuery>(
    GET_TACHOGRAPH_MONTHLY_SUMMARY,
    { variables: { from, to }, skip: !from || !to }
  )
}

export function useTachographCompliance(from: string, to: string) {
  return useQuery<GetTachographComplianceQuery>(GET_TACHOGRAPH_COMPLIANCE, {
    variables: { from, to },
    skip: !from || !to,
  })
}

export function useTachographTopViolators(from: string, to: string, limit = 5) {
  return useQuery<GetTachographTopViolatorsQuery>(
    GET_TACHOGRAPH_TOP_VIOLATORS,
    { variables: { from, to, limit }, skip: !from || !to }
  )
}

// ── Sprint 7: DDD file operations ─────────────────────

export function usePreviewDdd() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return httpClient.postFormData<DddParseResult>(
        '/tachograph/preview-ddd',
        formData
      )
    },
  })
}

export function useImportDdd() {
  const client = useApolloClient()
  return useMutation({
    mutationFn: ({ driverId, file }: { driverId: number; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      return httpClient.postFormData<DddImportResult>(
        `/tachograph/upload-ddd/${driverId}`,
        formData
      )
    },
    onSuccess: () => {
      client.refetchQueries({
        include: [
          'GetTachographEntries',
          'GetTachographDriverStatuses',
          'GetTachographMonthlySummary',
        ],
      })
    },
  })
}

// ── Sprint 7: PDF download ────────────────────────────

export function useTachographPdfDownload() {
  return useCallback(async (driverId: number, from: string, to: string) => {
    await downloadFile(
      `/tachograph/report/pdf?driverId=${driverId}&from=${from}&to=${to}`,
      `tahograf_${driverId}_${from}_${to}.pdf`
    )
  }, [])
}
