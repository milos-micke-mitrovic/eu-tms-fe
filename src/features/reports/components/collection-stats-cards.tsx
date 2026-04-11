import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/utils'
import { cn } from '@/shared/utils'
import { useInvoiceCollectionStats } from '../api/use-statistics'
import { Skeleton } from '@/shared/ui/skeleton'
import { Badge } from '@/shared/ui/badge'

type CollectionStatsCardsProps = {
  from: string
  to: string
}

export function CollectionStatsCards({ from, to }: CollectionStatsCardsProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useInvoiceCollectionStats(from, to)

  const stats = data?.invoiceCollectionStats

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const collectionRateColor =
    stats.collectionRate > 80
      ? 'text-green-600 dark:text-green-400'
      : stats.collectionRate >= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-destructive'

  const cards = [
    {
      label: t('statistics.totalInvoiced'),
      value: formatCurrency(stats.totalInvoiced, 'RSD'),
      className: '',
    },
    {
      label: t('statistics.totalCollected'),
      value: formatCurrency(stats.totalCollected, 'RSD'),
      className: 'text-green-600 dark:text-green-400',
    },
    {
      label: t('statistics.overdue'),
      value: formatCurrency(stats.totalOverdue, 'RSD'),
      className: 'text-destructive',
      badge: stats.overdueCount,
    },
    {
      label: t('statistics.collectionRate'),
      value: `${stats.collectionRate.toFixed(1)}%`,
      className: collectionRateColor,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border p-4">
            <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
              {card.label}
              {card.badge != null && card.badge > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {card.badge}
                </Badge>
              )}
            </div>
            <div className={cn('text-2xl font-bold', card.className)}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-sm">
        {t('statistics.avgCollectionDays', { days: stats.avgCollectionDays })}
      </p>
    </div>
  )
}
