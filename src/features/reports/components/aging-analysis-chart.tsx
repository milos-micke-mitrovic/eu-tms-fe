import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { formatCurrency } from '@/shared/utils'
import { ExpandableChartCard } from '@/shared/components'
import { useAgingAnalysis } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

const BUCKET_COLORS = ['#10B981', '#F59E0B', '#F97316', '#EF4444']

function getBucketColor(index: number) {
  return index < BUCKET_COLORS.length
    ? BUCKET_COLORS[index]
    : BUCKET_COLORS[BUCKET_COLORS.length - 1]
}

export function AgingAnalysisChart() {
  const { t } = useTranslation('reports')
  const { data, loading } = useAgingAnalysis()

  const chartData = data?.agingAnalysis ?? []

  return (
    <ExpandableChartCard title={t('stats.agingAnalysis')}>
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          {t('stats.agingAnalysis')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.15}
            />
            <XAxis
              dataKey="bucket"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value: number) => {
                if (value >= 1_000_000)
                  return `${(value / 1_000_000).toFixed(1)}M`
                if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
                return String(value)
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={60}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload
                return (
                  <div className="bg-popover rounded-md border p-3 text-sm shadow-md">
                    <p className="mb-1 font-semibold">
                      {item.bucket} {t('stats.days', { defaultValue: 'dana' })}
                    </p>
                    <p>
                      {t('stats.invoiceCount', { defaultValue: 'Faktura' })}:{' '}
                      <span className="font-medium">{item.invoiceCount}</span>
                    </p>
                    <p>
                      {t('stats.totalAmount', { defaultValue: 'Ukupno' })}:{' '}
                      <span className="font-medium">
                        {formatCurrency(item.totalAmount, 'RSD')}
                      </span>
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="totalAmount" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={getBucketColor(index)} />
              ))}
              <LabelList
                dataKey="invoiceCount"
                position="top"
                style={{ fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ExpandableChartCard>
  )
}
