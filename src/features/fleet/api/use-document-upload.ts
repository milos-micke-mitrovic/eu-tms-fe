import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { apolloClient } from '@/shared/api/apollo-client'
import { AUTH_STORAGE_KEY } from '@/shared/utils'
import type { DocumentUploadRequest } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

function getToken(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) return JSON.parse(stored).token
  } catch { /* */ }
  return null
}

type UploadParams = {
  entityType: 'vehicles' | 'drivers'
  entityId: number
  file: File
  metadata: DocumentUploadRequest
}

async function uploadDocument({ entityType, entityId, file, metadata }: UploadParams) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', metadata.documentType)
  if (metadata.expirationDate) formData.append('expirationDate', metadata.expirationDate)
  if (metadata.notes) formData.append('notes', metadata.notes)

  const response = await fetch(`${API_BASE_URL}/${entityType}/${entityId}/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || 'Upload failed')
  }

  return response.json()
}

export function useUploadDocument() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: (_, { entityType }) => {
      const queryName = entityType === 'vehicles' ? 'GetVehicle' : 'GetDriver'
      apolloClient.refetchQueries({ include: [queryName] })
      toast.success(t('common:success.created'))
    },
  })
}
