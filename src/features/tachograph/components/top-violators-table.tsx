import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { ExpandableChartCard } from '@/shared/components'
import { useTachographTopViolators } from '../api'

type TopViolatorsTableProps = {
  from: string
  to: string
}

export function TopViolatorsTable({ from, to }: TopViolatorsTableProps) {
  const { t } = useTranslation('tachograph')
  const { data, loading } = useTachographTopViolators(from, to, 5)
  const violators = data?.tachographTopViolators ?? []

  return (
    <ExpandableChartCard title={t('dashboard.topViolators')}>
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : violators.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <BodySmall className="text-green-600 dark:text-green-400">
            {t('dashboard.noViolations')}
          </BodySmall>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">{t('columns.driver')}</th>
              <th className="p-2 text-right">{t('entry.total')}</th>
              <th className="p-2 text-right">{t('status.violation')}</th>
              <th className="p-2 text-right">{t('status.warning')}</th>
            </tr>
          </thead>
          <tbody>
            {violators.map((v) => (
              <tr key={v.driverId} className="border-b last:border-0">
                <td className="p-2">
                  <BodySmall>{v.driverName}</BodySmall>
                </td>
                <td className="p-2 text-right">
                  <span
                    className={
                      v.totalViolations > 0
                        ? 'text-destructive font-bold'
                        : 'text-muted-foreground'
                    }
                  >
                    {v.totalViolations}
                  </span>
                </td>
                <td className="p-2 text-right">
                  {v.seriousViolations > 0 ? (
                    <Badge color="destructive">{v.seriousViolations}</Badge>
                  ) : (
                    <Caption className="text-muted-foreground">0</Caption>
                  )}
                </td>
                <td className="p-2 text-right">
                  {v.warnings > 0 ? (
                    <Badge color="warning">{v.warnings}</Badge>
                  ) : (
                    <Caption className="text-muted-foreground">0</Caption>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ExpandableChartCard>
  )
}
