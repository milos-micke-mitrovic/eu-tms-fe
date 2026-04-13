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
import { formatDate } from '@/shared/utils'
import { PERMIT_TYPE_COLORS } from '../constants'
import type { Permit } from '../types'

type PermitDetailSheetProps = {
  permit: Permit | null
  open: boolean
  onClose: () => void
  onEdit?: () => void
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall>{value || '—'}</BodySmall>
    </div>
  )
}

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  AVAILABLE: 'default',
  ASSIGNED: 'secondary',
  IN_USE: 'outline',
  EXPIRED: 'destructive',
  USED: 'outline',
}

export function PermitDetailSheet({
  permit,
  open,
  onClose,
  onEdit,
}: PermitDetailSheetProps) {
  const { t } = useTranslation('permits')

  if (!permit) return null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent>
        <SheetHeader
          actions={
            onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="mr-1 size-3.5" />
                {t('common:actions.edit')}
              </Button>
            )
          }
        >
          <SheetTitle>{permit.permitNumber}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 overflow-y-auto p-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={PERMIT_TYPE_COLORS[permit.permitType] ?? ''}
            >
              {t(`types.${permit.permitType}`)}
            </Badge>
            <Badge variant={STATUS_VARIANT[permit.status] ?? 'outline'}>
              {t(`status.${permit.status}`)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow
              label={t('permitType')}
              value={t(`types.${permit.permitType}`)}
            />
            <InfoRow label={t('number')} value={permit.permitNumber} />
            <InfoRow
              label={t('country')}
              value={permit.countryName ?? t('allCountries')}
            />
            <InfoRow
              label={t('validFrom')}
              value={formatDate(permit.validFrom)}
            />
            <InfoRow label={t('validTo')} value={formatDate(permit.validTo)} />
            <InfoRow
              label={t('vehicle')}
              value={
                permit.assignedVehicleId
                  ? `ID: ${permit.assignedVehicleId}`
                  : '—'
              }
            />
          </div>
          {permit.notes && <InfoRow label={t('notes')} value={permit.notes} />}
          <InfoRow
            label={t('common:actions.create')}
            value={formatDate(permit.createdAt)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
