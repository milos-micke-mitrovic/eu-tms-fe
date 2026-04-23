import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/utils'
import { cn } from '@/shared/utils'
import { useDriverProductivity } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

type DriverProductivityTableProps = {
  from: string
  to: string
}

export function DriverProductivityTable({
  from,
  to,
}: DriverProductivityTableProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useDriverProductivity(from, to)

  const drivers = useMemo(() => {
    const list = data?.driverProductivity ?? []
    return [...list].sort((a, b) => b.totalProfit - a.totalProfit)
  }, [data])

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-sm font-semibold">
        {t('stats.driverProductivity')}
      </h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
          {t('stats.driverProductivity')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                  {t('stats.driver')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.routeCount')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.revenue')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.profit')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.daysOnRoad')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.profitPerDay')}
                </th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => {
                const profitPerDay =
                  driver.daysOnRoad > 0
                    ? driver.totalProfit / driver.daysOnRoad
                    : 0

                return (
                  <tr key={driver.driverId} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">
                      {driver.driverName}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {driver.routeCount}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(driver.totalRevenue, 'RSD')}
                    </td>
                    <td
                      className={cn(
                        'px-3 py-2 text-right font-medium',
                        driver.totalProfit >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-destructive'
                      )}
                    >
                      {formatCurrency(driver.totalProfit, 'RSD')}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {driver.daysOnRoad}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrency(profitPerDay, 'RSD')}
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
