import { useMutation } from '@tanstack/react-query'
import { httpClient } from './http-client'

// Types
export type DocumentType = 'company' | 'driver' | 'vehicle' | 'trailer' | 'user'

export type TempUploadResponse = {
  tempFileName: string
  originalFileName: string
  fileSize: number
}

// Query keys
export const documentKeys = {
  all: ['documents'] as const,
  temp: () => [...documentKeys.all, 'temp'] as const,
}

// API functions
async function uploadTempFile(file: File): Promise<TempUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(
    `${import.meta.env.VITE_API_URL || '/api'}/documents/upload/temp`,
    {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  return response.json()
}

async function deleteTempFile(tempFileName: string): Promise<void> {
  return httpClient.delete(`/documents/temp/${tempFileName}`)
}

function getDownloadUrl(
  documentType: DocumentType,
  documentId: number
): string {
  return `${import.meta.env.VITE_API_URL || '/api'}/documents/download/${documentType}/${documentId}`
}

// Helper to get token
function getToken(): string | null {
  try {
    const stored = localStorage.getItem('auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.token || null
    }
  } catch {
    // Invalid JSON
  }
  return null
}

// Hooks
export function useUploadTempFile() {
  return useMutation({
    mutationKey: documentKeys.temp(),
    mutationFn: uploadTempFile,
  })
}

export function useDeleteTempFile() {
  return useMutation({
    mutationKey: documentKeys.temp(),
    mutationFn: deleteTempFile,
  })
}

// Utility to get download URL
export function useDocumentDownloadUrl() {
  return (documentType: DocumentType, documentId: number) => {
    return getDownloadUrl(documentType, documentId)
  }
}

// Download document (opens in new tab or downloads)
export async function downloadDocument(
  documentType: DocumentType,
  documentId: number
): Promise<void> {
  const url = getDownloadUrl(documentType, documentId)

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`)
  }

  // Get filename from Content-Disposition header if available
  const contentDisposition = response.headers.get('Content-Disposition')
  let filename = `document_${documentId}`
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/)
    if (match) {
      filename = match[1]
    }
  }

  // Create blob and download
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(blobUrl)
}
