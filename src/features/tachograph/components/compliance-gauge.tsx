import { useTranslation } from 'react-i18next'
import { ExpandableChartCard } from '@/shared/components'
import { Caption } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTachographCompliance } from '../api'

type ComplianceGaugeProps = {
  from: string
  to: string
}

export function ComplianceGauge({ from, to }: ComplianceGaugeProps) {
  const { t } = useTranslation('tachograph')
  const { data, loading } = useTachographCompliance(from, to)
  const compliance = data?.tachographCompliance

  const percent = compliance?.compliancePercent ?? 0
  const color = percent > 90 ? '#10B981' : percent > 70 ? '#F59E0B' : '#EF4444'

  // SVG circle params
  const size = 160
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <ExpandableChartCard title={t('dashboard.compliance')}>
      {loading ? (
        <Skeleton className="mx-auto size-40 rounded-full" />
      ) : !compliance ? (
        <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
          {t('dashboard.noViolations')}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color }}>
                {percent.toFixed(1)}%
              </span>
            </div>
          </div>
          <Caption className="text-muted-foreground">
            {compliance.compliantEntries} od {compliance.totalEntries}{' '}
            {t('dashboard.complianceSubtitle')}
          </Caption>
        </div>
      )}
    </ExpandableChartCard>
  )
}
