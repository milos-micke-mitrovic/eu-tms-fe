import { useState, useCallback, useRef } from 'react'
import { httpClient } from '@/shared/api/http-client'

export type TempFileResult = {
  tempFileName: string
  originalFileName: string
  fileSize: number
  contentType: string
}

export type UseFileUploadReturn = {
  uploadFile: (file: File) => Promise<TempFileResult>
  isUploading: boolean
  tempResult: TempFileResult | null
  error: string | null
  reset: () => void
  cleanup: () => void
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [tempResult, setTempResult] = useState<TempFileResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const tempFileNameRef = useRef<string | null>(null)

  const uploadFile = useCallback(
    async (file: File): Promise<TempFileResult> => {
      setIsUploading(true)
      setError(null)
      try {
        const formData = new FormData()
        formData.append('file', file)
        const result = await httpClient.postFormData<TempFileResult>(
          '/documents/upload/temp',
          formData
        )
        setTempResult(result)
        tempFileNameRef.current = result.tempFileName
        return result
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setTempResult(null)
    setError(null)
    setIsUploading(false)
    tempFileNameRef.current = null
  }, [])

  const cleanup = useCallback(() => {
    const name = tempFileNameRef.current
    if (name) {
      // Fire-and-forget: delete the temp file on cancel
      httpClient.delete(`/documents/temp/${name}`).catch(() => {})
      tempFileNameRef.current = null
    }
    reset()
  }, [reset])

  return { uploadFile, isUploading, tempResult, error, reset, cleanup }
}
