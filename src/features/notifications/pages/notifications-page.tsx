import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell } from 'lucide-react'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader, EmptyState, TableSkeleton } from '@/shared/components'
import { Button } from '@/shared/ui/button'
import { useNotifications } from '../api/use-notifications'
import { NotificationList } from '../components/notification-list'

export function NotificationsPage() {
  const { t } = useTranslation('navigation')
  usePageTitle(t('sidebar.notifications'))

  const [page, setPage] = useState(0)
  const { data, isLoading, isError } = useNotifications(page, 20)

  const notifications = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const showEmpty = (!isLoading && notifications.length === 0) || isError

  return (
    <div className="space-y-6">
      <PageHeader title={t('sidebar.notifications')} />
      {isLoading && !isError ? (
        <TableSkeleton columns={3} rows={4} />
      ) : showEmpty ? (
        <EmptyState icon={Bell} title={t('common:table.noData')} />
      ) : (
        <>
          <NotificationList notifications={notifications} />
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                {t('common:pagination.previous')}
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                {t('common:pagination.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
