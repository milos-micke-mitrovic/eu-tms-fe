import { Bell, CheckCheck, X } from 'lucide-react'
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
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../api/use-notifications'
import type { Notification } from '../types'

function NotificationItem({ notification }: { notification: Notification }) {
  const markAsRead = useMarkAsRead()
  const deleteNotification = useDeleteNotification()

  const handleClick = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteNotification.mutate(notification.id)
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative w-full cursor-pointer border-b p-3 text-left last:border-0 ${
        notification.read ? 'opacity-60' : 'bg-muted/30'
      }`}
    >
      <div className="pr-6">
        <BodySmall className="font-medium">{notification.title}</BodySmall>
        <Caption className="text-muted-foreground line-clamp-2">
          {notification.message}
        </Caption>
        <Caption className="text-muted-foreground mt-1">
          {formatRelative(notification.createdAt)}
        </Caption>
      </div>
      <button
        onClick={handleDelete}
        className="text-muted-foreground hover:text-destructive absolute top-2 right-2 rounded-sm p-1 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function NotificationBell() {
  const { t } = useTranslation('navigation')
  const { data, isError } = useNotifications(0, 20)
  const markAllAsRead = useMarkAllAsRead()

  const notifications = !isError && data?.content ? data.content : []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <BodySmall className="font-medium">
            {t('sidebar.notifications')}
          </BodySmall>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-auto px-2 py-1 text-xs"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="mr-1 size-3.5" />
              {t('notifications.markAllRead', {
                defaultValue: 'Označi sve kao pročitano',
              })}
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <div className="bg-muted rounded-full p-3">
                <Bell className="text-muted-foreground size-6" />
              </div>
              <BodySmall className="font-medium">
                {t('common:table.noData')}
              </BodySmall>
            </div>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
