import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { downloadFile } from '@/shared/utils'

export function useDownloadReport() {
  const { t } = useTranslation('reports')
  const [loading, setLoading] = useState<string | null>(null)

  const download = async (path: string, filename: string, key: string) => {
    setLoading(key)
    try {
      await downloadFile(path, filename)
      toast.success(t('downloaded'))
    } catch {
      toast.error(t('common:errors.generic'))
    } finally {
      setLoading(null)
    }
  }

  return { download, loading }
}
