import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatDate } from '@/shared/utils'
import type { TachographViolation } from '../types'

type ViolationsListProps = {
  violations: TachographViolation[]
  showDate?: boolean
  emptyMessage?: string
}

export function ViolationsList({
  violations,
  showDate = true,
  emptyMessage,
}: ViolationsListProps) {
  const { t } = useTranslation('tachograph')

  if (violations.length === 0) {
    return (
      <Caption className="text-muted-foreground py-4 text-center">
        {emptyMessage ?? t('violations.empty')}
      </Caption>
    )
  }

  return (
    <div className="space-y-2">
      {violations.map((v) => (
        <div
          key={v.id}
          className="flex items-start justify-between gap-3 rounded-md border p-3"
        >
          <div className="flex items-start gap-3">
            <Badge
              color={v.severity === 'VIOLATION' ? 'destructive' : 'warning'}
              className="mt-0.5 shrink-0"
            >
              {v.severity === 'VIOLATION'
                ? t('status.violation')
                : t('status.warning')}
            </Badge>
            <div>
              <BodySmall className="font-medium">
                {t(`violations.types.${v.violationType}`, {
                  defaultValue: v.violationType,
                })}
              </BodySmall>
              <Caption className="text-muted-foreground">
                {v.description}
              </Caption>
              {v.drivingMinutesActual != null &&
                v.drivingMinutesLimit != null && (
                  <Caption className="text-muted-foreground">
                    {v.drivingMinutesActual} / {v.drivingMinutesLimit} min
                  </Caption>
                )}
              {v.restMinutesActual != null && v.restMinutesLimit != null && (
                <Caption className="text-muted-foreground">
                  {v.restMinutesActual} / {v.restMinutesLimit} min
                </Caption>
              )}
            </div>
          </div>
          {showDate && (
            <Caption className="text-muted-foreground shrink-0">
              {formatDate(v.violationDate)}
            </Caption>
          )}
        </div>
      ))}
    </div>
  )
}
