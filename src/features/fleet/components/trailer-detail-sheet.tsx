import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { BodySmall, Caption } from '@/shared/ui/typography'
import type { TrailerListItem, TrailerStatus } from '../types'

type TrailerDetailSheetProps = {
  trailer: TrailerListItem | null
  open: boolean
  onClose: () => void
  onEdit?: () => void
}

const statusConfig: Record<
  TrailerStatus,
  {
    variant?: 'default' | 'secondary' | 'outline'
    color?: 'success' | 'warning' | 'muted'
  }
> = {
  ACTIVE: { color: 'success' },
  IN_SERVICE: { color: 'warning' },
  INACTIVE: { variant: 'outline' },
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5">
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall>{value ?? '—'}</BodySmall>
    </div>
  )
}

export function TrailerDetailSheet({
  trailer,
  open,
  onClose,
  onEdit,
}: TrailerDetailSheetProps) {
  const { t } = useTranslation('fleet')

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader
          actions={
            onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onClose()
                  onEdit()
                }}
              >
                <Pencil className="mr-1 size-3.5" />
                {t('common:actions.edit')}
              </Button>
            )
          }
        >
          <SheetTitle>{trailer?.regNumber ?? '...'}</SheetTitle>
        </SheetHeader>
        {trailer && (
          <div className="space-y-1 p-4">
            <InfoRow
              label={t('trailers.regNumber')}
              value={trailer.regNumber}
            />
            <InfoRow
              label={t('trailers.type')}
              value={t(`trailers.trailerTypes.${trailer.type}`)}
            />
            <InfoRow label={t('trailers.length')} value={trailer.lengthM} />
            <InfoRow
              label={t('trailers.capacity')}
              value={trailer.capacityKg}
            />
            <InfoRow label={t('trailers.year')} value={trailer.year} />
            <InfoRow
              label={t('trailers.ownership')}
              value={
                trailer.ownership
                  ? t(`trailers.ownershipTypes.${trailer.ownership}`)
                  : null
              }
            />
            <InfoRow
              label={t('trailers.status')}
              value={
                <Badge
                  variant={
                    statusConfig[trailer.status as TrailerStatus]?.variant
                  }
                  color={statusConfig[trailer.status as TrailerStatus]?.color}
                >
                  {t(`trailers.statuses.${trailer.status}`)}
                </Badge>
              }
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
