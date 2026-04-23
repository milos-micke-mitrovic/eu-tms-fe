import { AUTH_STORAGE_KEY } from './constants'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function downloadDocument(
  entityType: 'VEHICLE' | 'DRIVER',
  documentId: number
): Promise<void> {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  const token = stored ? JSON.parse(stored).token : null

  const res = await fetch(
    `${API_BASE_URL}/documents/download/${entityType}/${documentId}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  )
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)

  const blob = await res.blob()
  const filename =
    /filename="([^"]+)"/.exec(
      res.headers.get('content-disposition') ?? ''
    )?.[1] ?? 'document'

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
