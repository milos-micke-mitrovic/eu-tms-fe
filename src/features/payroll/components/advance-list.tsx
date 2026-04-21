import { useTranslation } from 'react-i18next'
import { Plus, Inbox } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Caption, BodySmall } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency } from '@/shared/utils'
import { formatDate } from '@/shared/utils'
import { useDriverAdvancesGql } from '../api'
import { ADVANCE_TYPE_CONFIG } from '../constants'
import type { DriverAdvance } from '../types'

type AdvanceListProps = {
  driverId: number
  from: string
  to: string
  onAddClick: () => void
  onAdvanceClick: (advance: DriverAdvance) => void
}

export function AdvanceList({
  driverId,
  from,
  to,
  onAddClick,
  onAdvanceClick,
}: AdvanceListProps) {
  const { t } = useTranslation('payroll')
  const { data, loading } = useDriverAdvancesGql(driverId, from, to)

  const advances = [...(data?.driverAdvances ?? [])].sort(
    (a, b) =>
      new Date(b.advanceDate).getTime() - new Date(a.advanceDate).getTime()
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <BodySmall className="font-semibold">{t('advance.title')}</BodySmall>
        <Button type="button" variant="outline" size="sm" onClick={onAddClick}>
          <Plus className="mr-1 size-3.5" />
          {t('actions.addAdvance')}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : advances.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-8">
          <Inbox className="text-muted-foreground size-8" />
          <Caption className="text-muted-foreground">
            {t('empty.advances')}
          </Caption>
        </div>
      ) : (
        <div className="space-y-1">
          {advances.map((adv) => {
            const typeConfig =
              ADVANCE_TYPE_CONFIG[
                adv.advanceType as keyof typeof ADVANCE_TYPE_CONFIG
              ]
            return (
              <button
                key={adv.id}
                type="button"
                onClick={() => onAdvanceClick(adv as DriverAdvance)}
                className="hover:bg-accent flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors"
              >
                <Caption className="text-muted-foreground w-20 shrink-0">
                  {formatDate(adv.advanceDate)}
                </Caption>
                <Badge
                  color={typeConfig?.color ?? 'muted'}
                  className="shrink-0"
                >
                  {typeConfig?.label ?? adv.advanceType}
                </Badge>
                <BodySmall className="font-medium">
                  {formatCurrency(adv.amountRsd, 'RSD')}
                </BodySmall>
                {adv.settled && (
                  <Badge color="success" className="shrink-0">
                    {t('advance.settled')}
                  </Badge>
                )}
                {adv.description && (
                  <Caption className="text-muted-foreground ml-auto max-w-[150px] truncate">
                    {adv.description}
                  </Caption>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
