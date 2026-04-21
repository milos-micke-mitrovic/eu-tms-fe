import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { Caption, BodySmall } from '@/shared/ui/typography'
import { formatCurrency, formatDateTime } from '@/shared/utils'
import { usePartnerReminders } from '../api'
import { REMINDER_TYPE_CONFIG } from '../constants'
import type { CollectionReminder } from '../types'

type Props = {
  partnerId: string
  onClose: () => void
}

export function ReminderHistoryList({ partnerId, onClose }: Props) {
  const { t } = useTranslation('collections')
  const { data, loading } = usePartnerReminders(partnerId)

  const reminders = [...(data?.partnerReminders ?? [])].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  ) as CollectionReminder[]

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <BodySmall className="font-semibold">{t('reminder.history')}</BodySmall>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onClose}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <Caption className="text-muted-foreground">
          {t('reminder.noReminders')}
        </Caption>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => {
            const typeCfg = REMINDER_TYPE_CONFIG[r.reminderType]
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <BodySmall className="font-medium">
                      {r.invoiceNumber ?? `#${r.invoiceId}`}
                    </BodySmall>
                    <Caption className="text-muted-foreground">
                      {formatDateTime(r.sentAt)}
                    </Caption>
                  </div>
                  <Badge
                    color={
                      (typeCfg?.color as
                        | 'info'
                        | 'warning'
                        | 'destructive'
                        | 'muted') ?? 'muted'
                    }
                  >
                    {typeCfg
                      ? t(`reminderType.${typeCfg.key}`)
                      : r.reminderType}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Caption className="text-muted-foreground">
                    {r.daysOverdue} {t('aging.days')} |{' '}
                    {t(`sendVia.${r.sentVia.toLowerCase()}`)}
                  </Caption>
                  <BodySmall className="font-medium">
                    {formatCurrency(r.amountDue, 'RSD')}
                  </BodySmall>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
