import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { apolloClient } from '@/shared/api/apollo-client'
import { httpClient } from '@/shared/api/http-client'

type DocumentCreatePayload = {
  documentType: string
  tempFileName: string
  originalFileName: string
  expirationDate?: string
  notes?: string
}

type UploadParams = {
  entityType: 'vehicles' | 'drivers'
  entityId: string
  payload: DocumentCreatePayload
}

async function createDocument({ entityType, entityId, payload }: UploadParams) {
  return httpClient.post(`/${entityType}/${entityId}/documents`, payload)
}

export function useUploadDocument() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: createDocument,
    onSuccess: (_, { entityType }) => {
      const queryName = entityType === 'vehicles' ? 'GetVehicle' : 'GetDriver'
      apolloClient.refetchQueries({ include: [queryName] })
      toast.success(t('common:success.created'))
    },
  })
}
