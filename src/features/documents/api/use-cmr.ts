import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { downloadFile } from '@/shared/utils/download-file'
import type { CmrDocument } from '../types'

export function useGenerateCmr() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: { routeId: string | number; language: string }) =>
      httpClient.post<CmrDocument>('/cmr/generate', {
        ...data,
        routeId: Number(data.routeId),
      }),
    onSuccess: () => {
      toast.success(t('common:success.created'))
    },
  })
}

const cmrKeys = {
  all: ['cmr'] as const,
  byRoute: (routeId: string | number) =>
    [...cmrKeys.all, 'byRoute', routeId] as const,
}

export function useCmrsByRoute(routeId: string | number) {
  return useQuery({
    queryKey: cmrKeys.byRoute(routeId),
    queryFn: () => httpClient.get<CmrDocument[]>(`/cmr/${routeId}`),
    enabled: !!routeId,
  })
}

export async function downloadCmrPdf(cmrId: number, cmrNumber: string) {
  return downloadFile(`/cmr/${cmrId}/pdf`, `${cmrNumber}.pdf`)
}
