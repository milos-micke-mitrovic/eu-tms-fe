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
import { InfoRow } from '@/shared/components'
import type { PartnerListItem, PartnerType } from '../types'

type PartnerDetailSheetProps = {
  partner: PartnerListItem | null
  open: boolean
  onClose: () => void
  onEdit?: () => void
}

const typeConfig: Record<
  PartnerType,
  {
    variant?: 'default' | 'secondary' | 'outline'
    color?: 'success' | 'info' | 'warning'
  }
> = {
  CLIENT: { color: 'info' },
  SUPPLIER: { color: 'warning' },
  BOTH: { color: 'success' },
}

export function PartnerDetailSheet({
  partner,
  open,
  onClose,
  onEdit,
}: PartnerDetailSheetProps) {
  const { t } = useTranslation('partners')

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
          <SheetTitle>{partner?.name ?? '...'}</SheetTitle>
        </SheetHeader>
        {partner && (
          <div className="space-y-1 p-4">
            <InfoRow label={t('name')} value={partner.name} />
            <InfoRow label={t('pib')} value={partner.pib} />
            <InfoRow label={t('city')} value={partner.city} />
            <InfoRow label={t('phone')} value={partner.phone} />
            <InfoRow label={t('email')} value={partner.email} />
            <InfoRow label={t('contactPerson')} value={partner.contactPerson} />
            <InfoRow
              label={t('type')}
              value={
                <Badge
                  variant={
                    typeConfig[partner.partnerType as PartnerType]?.variant
                  }
                  color={typeConfig[partner.partnerType as PartnerType]?.color}
                >
                  {t(`partnerTypes.${partner.partnerType}`)}
                </Badge>
              }
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
