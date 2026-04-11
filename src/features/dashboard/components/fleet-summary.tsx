import { useTranslation } from 'react-i18next'
import { Truck, Users } from 'lucide-react'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import type { DashboardData } from '../api/use-dashboard'

type FleetSummaryProps = {
  data: DashboardData['fleetSummary'] | undefined
}

function ProgressBar({
  active,
  total,
  label,
  icon: Icon,
}: {
  active: number
  total: number
  label: string
  icon: typeof Truck
}) {
  const { t } = useTranslation('dashboard')
  const percent = total > 0 ? (active / total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="text-muted-foreground size-4" />
          <BodySmall className="font-medium">{label}</BodySmall>
        </div>
        <Caption>
          {active}/{total} {t('active')}
        </Caption>
      </div>
      <div className="bg-muted h-2 rounded-full">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function FleetSummary({ data }: FleetSummaryProps) {
  const { t } = useTranslation('dashboard')

  if (!data) {
    return (
      <div className="rounded-lg border p-4">
        <BodySmall className="mb-3 font-medium">{t('fleetSummary')}</BodySmall>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4">
      <BodySmall className="mb-4 font-medium">{t('fleetSummary')}</BodySmall>
      <div className="space-y-4">
        <ProgressBar
          active={data.activeVehicles}
          total={data.totalVehicles}
          label={t('vehicles')}
          icon={Truck}
        />
        <ProgressBar
          active={data.activeDrivers}
          total={data.totalDrivers}
          label={t('drivers')}
          icon={Users}
        />
      </div>
    </div>
  )
}
