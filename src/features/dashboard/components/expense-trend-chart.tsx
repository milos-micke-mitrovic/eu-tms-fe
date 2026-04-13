import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { BodySmall } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { ExpandableChartCard } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { DashboardData } from '../api/use-dashboard'

const MONTH_NAMES_SR: Record<string, string> = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'Maj',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Avg',
  '09': 'Sep',
  '10': 'Okt',
  '11': 'Nov',
  '12': 'Dec',
}

function formatMonth(month: string): string {
  // month may come as "2026-01", "2026-01-01", or "2026-03-01T00:00:00Z"
  const parts = month.split('-')
  if (parts.length >= 2) {
    return `${MONTH_NAMES_SR[parts[1]] ?? parts[1]} ${parts[0]}`
  }
  return month
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(value)
}

type ExpenseTrendChartProps = {
  data: DashboardData['expenseTrendMonthly'] | undefined
}

export function ExpenseTrendChart({ data }: ExpenseTrendChartProps) {
  const { t } = useTranslation('dashboard')

  if (!data) {
    return (
      <div className="rounded-lg border p-4">
        <BodySmall className="mb-3 font-medium">{t('expenseTrend')}</BodySmall>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const chartData = data.map((item) => ({
    month: formatMonth(item.month),
    totalAmountRsd: item.totalAmountRsd,
  }))

  const chartContent = (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} barCategoryGap="30%">
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          strokeOpacity={0.15}
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            return (
              <div className="bg-popover rounded-md border px-3 py-2 text-sm shadow-md">
                <p className="text-muted-foreground text-xs">
                  {item.payload.month}
                </p>
                <p className="font-medium">
                  {formatCurrency(Number(item.value), 'RSD')}
                </p>
              </div>
            )
          }}
        />
        <Bar
          dataKey="totalAmountRsd"
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
          maxBarSize={60}
        />
      </BarChart>
    </ResponsiveContainer>
  )

  return (
    <ExpandableChartCard title={t('expenseTrend')}>
      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <BodySmall className="text-muted-foreground">
            {t('common:table.noData')}
          </BodySmall>
        </div>
      ) : (
        chartContent
      )}
    </ExpandableChartCard>
  )
}
