import { Bell, Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/overlay/popover'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatRelative } from '@/shared/utils'
import { useNotifications, useMarkAsRead } from '../api/use-notifications'
import type { Notification } from '../types'

function NotificationItem({ notification }: { notification: Notification }) {
  const markAsRead = useMarkAsRead()

  const handleClick = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full border-b p-3 text-left last:border-0 ${
        notification.read ? 'opacity-60' : 'bg-muted/30'
      }`}
    >
      <BodySmall className="font-medium">{notification.title}</BodySmall>
      <Caption className="text-muted-foreground line-clamp-2">{notification.message}</Caption>
      <Caption className="text-muted-foreground mt-1">{formatRelative(notification.createdAt)}</Caption>
    </button>
  )
}

export function NotificationBell() {
  const { t } = useTranslation('navigation')
  const navigate = useNavigate()
  const { data, isError } = useNotifications(0, 5)

  const notifications = (!isError && data?.content) ? data.content : []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex size-5 items-center justify-center p-0 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b p-3">
          <BodySmall className="font-medium">{t('sidebar.notifications')}</BodySmall>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Inbox className="text-muted-foreground size-8" />
              <Caption className="text-muted-foreground">{t('common:table.noData')}</Caption>
            </div>
          ) : (
            notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
          )}
        </div>
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => navigate('/notifications')}
          >
            {t('sidebar.notifications')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
