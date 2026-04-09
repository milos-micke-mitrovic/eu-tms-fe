import { useTranslation } from 'react-i18next'
import { ClipboardList, Receipt, TrendingUp, AlertTriangle } from 'lucide-react'
import { H3, Caption } from '@/shared/ui/typography'
import { formatCurrency } from '@/shared/utils'
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
        <div className={`rounded-full p-2 ${color}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <H3 className="mt-2">{value}</H3>
    </div>
  )
}

export function KpiCards({ data }: KpiCardsProps) {
  const { t } = useTranslation('dashboard')

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title={t('activeRoutes')}
        value={String(data?.activeRoutesCount ?? 0)}
        icon={ClipboardList}
        color="bg-primary/10 text-primary"
      />
      <KpiCard
        title={t('monthlyExpenses')}
        value={formatCurrency(data?.monthlyExpenseTotal ?? 0, 'RSD')}
        icon={Receipt}
        color="bg-destructive/10 text-destructive"
      />
      <KpiCard
        title={t('monthlyRevenue')}
        value={formatCurrency(data?.monthlyRevenueTotal ?? 0, 'RSD')}
        icon={TrendingUp}
        color="bg-green-100 text-green-700"
      />
      <KpiCard
        title={t('expiringDocs')}
        value={String(data?.expiringDocuments?.length ?? 0)}
        icon={AlertTriangle}
        color="bg-yellow-100 text-yellow-700"
      />
    </div>
  )
}
