import { AUTH_STORAGE_KEY } from './constants'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export async function downloadFile(
  path: string,
  filename: string
): Promise<void> {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error(`Download failed: ${response.status}`)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function getToken(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) return JSON.parse(stored).token
  } catch {
    /* empty */
  }
  return null
}
