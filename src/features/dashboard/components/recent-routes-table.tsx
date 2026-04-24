import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/shared/ui/badge'
import { BodySmall } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency, formatDate } from '@/shared/utils'
import type { DashboardData } from '../api/use-dashboard'

const STATUS_COLORS: Record<
  string,
  'default' | 'success' | 'warning' | 'destructive' | 'info' | 'muted'
> = {
  CREATED: 'muted',
  DISPATCHED: 'info',
  IN_TRANSIT: 'warning',
  COMPLETED: 'success',
  INVOICED: 'default',
  PAID: 'success',
  CANCELLED: 'destructive',
}

type RecentRoutesTableProps = {
  data: DashboardData['recentRoutes'] | undefined
}

export function RecentRoutesTable({ data }: RecentRoutesTableProps) {
  const { t } = useTranslation(['dashboard', 'spedition'])
  const navigate = useNavigate()

  if (!data) {
    return (
      <div className="rounded-lg border p-4">
        <BodySmall className="mb-3 font-medium">
          {t('dashboard:recentRoutes')}
        </BodySmall>
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4">
      <BodySmall className="mb-3 font-medium">
        {t('dashboard:recentRoutes')}
      </BodySmall>
      {data.length === 0 ? (
        <div className="flex h-24 items-center justify-center">
          <BodySmall className="text-muted-foreground">
            {t('common:table.noData')}
          </BodySmall>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="text-muted-foreground pr-4 pb-2 font-medium">
                  {t('dashboard:routeNumber')}
                </th>
                <th className="text-muted-foreground pr-4 pb-2 font-medium">
                  Status
                </th>
                <th className="text-muted-foreground pr-4 pb-2 font-medium">
                  {t('dashboard:client')}
                </th>
                <th className="text-muted-foreground pr-4 pb-2 font-medium">
                  {t('dashboard:departure')}
                </th>
                <th className="text-muted-foreground pb-2 text-right font-medium">
                  {t('dashboard:price')}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((route) => (
                <tr
                  key={route.id}
                  className="hover:bg-accent cursor-pointer border-b last:border-0"
                  onClick={() =>
                    navigate('/routes', { state: { highlightId: route.id } })
                  }
                >
                  <td className="py-2 pr-4 font-medium">
                    {route.internalNumber}
                  </td>
                  <td className="py-2 pr-4">
                    <Badge color={STATUS_COLORS[route.status] ?? 'muted'}>
                      {t(`spedition:routes.status.${route.status}`)}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4">{route.partnerName}</td>
                  <td className="py-2 pr-4">
                    {formatDate(route.departureTime)}
                  </td>
                  <td className="py-2 text-right">
                    {formatCurrency(route.price, route.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
