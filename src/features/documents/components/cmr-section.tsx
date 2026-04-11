import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { Badge } from '@/shared/ui/badge'
import { Spinner } from '@/shared/ui/spinner'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatDate } from '@/shared/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/overlay/dialog'
import { useCmrsByRoute, useGenerateCmr, downloadCmrPdf } from '../api/use-cmr'

type CmrSectionProps = {
  routeId: string
}

const LANGUAGE_OPTIONS = [
  { value: 'SR', label: 'Srpski' },
  { value: 'SR_EN', label: 'Srpski/Engleski' },
  { value: 'SR_DE', label: 'Srpski/Nemački' },
]

export function CmrSection({ routeId }: CmrSectionProps) {
  const { t } = useTranslation('spedition')
  const queryClient = useQueryClient()
  const { data: cmrs, isLoading } = useCmrsByRoute(routeId)
  const generateMutation = useGenerateCmr()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [language, setLanguage] = useState('SR')

  const handleGenerate = async () => {
    await generateMutation.mutateAsync({ routeId, language })
    queryClient.invalidateQueries({ queryKey: ['cmr', 'byRoute', routeId] })
    setDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  const documents = cmrs ?? []

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="bg-muted rounded-full p-3">
            <FileText className="text-muted-foreground size-6" />
          </div>
          <BodySmall className="font-medium">{t('cmr.noDocuments')}</BodySmall>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            {t('cmr.generate')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              {t('cmr.generate')}
            </Button>
          </div>
          {documents.map((cmr) => (
            <div
              key={cmr.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-muted-foreground size-5" />
                <div>
                  <BodySmall className="font-mono font-medium">
                    {cmr.cmrNumber}
                  </BodySmall>
                  <Caption className="text-muted-foreground">
                    {formatDate(cmr.generatedAt)}
                  </Caption>
                </div>
                <Badge variant="outline" className="text-xs">
                  {cmr.language}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCmrPdf(cmr.id, cmr.cmrNumber)}
              >
                <FileText className="mr-1 size-4" />
                {t('cmr.download')}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Generate CMR dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cmr.generate')}</DialogTitle>
            <DialogDescription>{t('cmr.language')}</DialogDescription>
          </DialogHeader>
          <Select
            options={LANGUAGE_OPTIONS}
            value={language}
            onChange={setLanguage}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending
                ? t('common:app.loading')
                : t('cmr.generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
