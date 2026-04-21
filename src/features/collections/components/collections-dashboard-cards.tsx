import { useTranslation } from 'react-i18next'
import {
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import { Skeleton } from '@/shared/ui/skeleton'
import { Caption, BodySmall } from '@/shared/ui/typography'
import { formatCurrency } from '@/shared/utils'
import { useCollectionDashboard } from '../api'

function MetricCard({
  label,
  value,
  icon,
  loading,
}: {
  label: string
  value: string
  icon: React.ReactNode
  loading?: boolean
}) {
  if (loading) return <Skeleton className="h-24" />
  return (
    <div className="flex flex-col gap-1 rounded-md border p-4">
      <div className="flex items-center gap-2">
        {icon}
        <Caption className="text-muted-foreground">{label}</Caption>
      </div>
      <BodySmall className="text-lg font-semibold">{value}</BodySmall>
    </div>
  )
}

export function CollectionsDashboardCards() {
  const { t } = useTranslation('collections')
  const { data, loading } = useCollectionDashboard()

  const dashboard = data?.collectionDashboard

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard
        label={t('dashboard.totalReceivables')}
        value={formatCurrency(dashboard?.totalReceivables ?? 0, 'RSD')}
        icon={<DollarSign className="text-muted-foreground size-4" />}
        loading={loading}
      />
      <MetricCard
        label={t('dashboard.totalOverdue')}
        value={formatCurrency(dashboard?.totalOverdue ?? 0, 'RSD')}
        icon={<AlertTriangle className="text-destructive size-4" />}
        loading={loading}
      />
      <MetricCard
        label={t('dashboard.collectedThisMonth')}
        value={formatCurrency(dashboard?.collectedThisMonth ?? 0, 'RSD')}
        icon={<CheckCircle className="text-success size-4" />}
        loading={loading}
      />
      <MetricCard
        label={t('dashboard.collectionRate')}
        value={`${(dashboard?.collectionRate ?? 0).toFixed(1)}%`}
        icon={<TrendingUp className="text-muted-foreground size-4" />}
        loading={loading}
      />
    </div>
  )
}
