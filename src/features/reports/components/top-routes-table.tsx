import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/utils'
import { cn } from '@/shared/utils'
import { useTopProfitableRoutes } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

type TopRoutesTableProps = {
  from: string
  to: string
}

export function TopRoutesTable({ from, to }: TopRoutesTableProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useTopProfitableRoutes(from, to, 10)

  const routes = data?.topProfitableRoutes ?? []

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-sm font-semibold">{t('stats.topRoutes')}</h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
          {t('stats.topRoutes')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                  {t('stats.routeNumber')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                  {t('stats.client')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                  {t('stats.vehicle')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.revenue')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.expenses')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.profit')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                  {t('stats.margin')}
                </th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => {
                const clampedWidth = Math.min(
                  Math.max(route.marginPercent, 0),
                  100
                )
                const marginColor =
                  route.marginPercent > 30
                    ? 'bg-green-500'
                    : route.marginPercent >= 10
                      ? 'bg-amber-500'
                      : 'bg-red-500'

                return (
                  <tr key={route.routeId} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">
                      {route.internalNumber}
                    </td>
                    <td className="px-3 py-2">{route.partnerName}</td>
                    <td className="px-3 py-2">{route.vehicleRegNumber}</td>
                    <td className="px-3 py-2 text-right text-green-600 dark:text-green-400">
                      {formatCurrency(route.revenue, 'RSD')}
                    </td>
                    <td className="text-destructive px-3 py-2 text-right">
                      {formatCurrency(route.expenses, 'RSD')}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2 text-right font-medium',
                        route.profit >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-destructive'
                      )}
                    >
                      {formatCurrency(route.profit, 'RSD')}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                          <div
                            className={cn('h-full rounded-full', marginColor)}
                            style={{ width: `${clampedWidth}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {route.marginPercent.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
