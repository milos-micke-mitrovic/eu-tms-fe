import { useTranslation } from 'react-i18next'
import { ClipboardList, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { H3, Caption } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn, formatCurrency } from '@/shared/utils'
import type { DashboardData } from '../api/use-dashboard'

type KpiCardsProps = {
  data: DashboardData | null
}

type KpiCardProps = {
  title: string
  value: string
  icon: typeof ClipboardList
  color: string
}

function KpiCard({ title, value, icon: Icon, color }: KpiCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Caption className="text-muted-foreground">{title}</Caption>
        <div className={cn('rounded-full p-2', color)}>
          <Icon className="size-4" />
        </div>
      </div>
      <H3 className="mt-2">{value}</H3>
    </div>
  )
}

function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-8 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-7 w-32" />
    </div>
  )
}

export function KpiCards({ data }: KpiCardsProps) {
  const { t } = useTranslation('dashboard')

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>
    )
  }

  const profitPositive = data.profitThisMonth >= 0
  const profitColor = profitPositive
    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : 'bg-destructive/10 text-destructive'

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title={t('activeRoutes')}
        value={String(data.activeRoutesCount)}
        icon={ClipboardList}
        color="bg-primary/10 text-primary"
      />
      <KpiCard
        title={t('monthlyExpenses')}
        value={formatCurrency(data.monthlyExpenseTotal, 'RSD')}
        icon={TrendingDown}
        color="bg-destructive/10 text-destructive"
      />
      <KpiCard
        title={t('monthlyRevenue')}
        value={formatCurrency(data.monthlyRevenueTotal, 'RSD')}
        icon={TrendingUp}
        color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      />
      <KpiCard
        title={t('profit')}
        value={formatCurrency(data.profitThisMonth, 'RSD')}
        icon={Wallet}
        color={profitColor}
      />
    </div>
  )
}
