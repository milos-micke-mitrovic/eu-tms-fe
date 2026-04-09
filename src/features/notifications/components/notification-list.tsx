import { AlertTriangle, FileWarning, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatRelative } from '@/shared/utils'
import { useMarkAsRead } from '../api/use-notifications'
import type { Notification, NotificationType } from '../types'

const typeIcon: Record<NotificationType, typeof AlertTriangle> = {
  DOCUMENT_EXPIRING_7: AlertTriangle,
  DOCUMENT_EXPIRING_14: FileWarning,
  DOCUMENT_EXPIRING_30: Clock,
}

type NotificationListProps = {
  notifications: Notification[]
}

export function NotificationList({ notifications }: NotificationListProps) {
  const { t } = useTranslation()
  const markAsRead = useMarkAsRead()

  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center">
        <Caption className="text-muted-foreground">{t('common:table.noData')}</Caption>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => {
        const Icon = typeIcon[n.notificationType] ?? Clock
        return (
          <div
            key={n.id}
            className={`flex gap-3 rounded-lg border p-4 ${
              n.read ? 'opacity-60' : 'bg-muted/20'
            }`}
            onClick={() => !n.read && markAsRead.mutate(n.id)}
            role="button"
            tabIndex={0}
          >
            <div className="mt-0.5 shrink-0">
              <Icon className="text-muted-foreground size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <BodySmall className="font-medium">{n.title}</BodySmall>
                {!n.read && <Badge variant="default" className="h-5 text-[10px]">Novo</Badge>}
              </div>
              <Caption className="text-muted-foreground mt-0.5">{n.message}</Caption>
              <Caption className="text-muted-foreground mt-1">{formatRelative(n.createdAt)}</Caption>
            </div>
          </div>
        )
      })}
    </div>
  )
}
