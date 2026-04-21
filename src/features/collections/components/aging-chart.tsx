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
import { Skeleton } from '@/shared/ui/skeleton'
import { useCollectionDashboard } from '../api'
import { AGING_BUCKET_COLORS } from '../constants'

function getBucketColor(bucket: string): string {
  return AGING_BUCKET_COLORS[bucket] ?? '#94A3B8'
}

export function AgingChart() {
  const { t } = useTranslation('collections')
  const { data, loading } = useCollectionDashboard()

  const buckets = data?.collectionDashboard?.agingBuckets ?? []

  // Aggregate by bucket (may have multiple currencies)
  const aggregated = buckets.reduce<
    Record<
      string,
      { bucket: string; invoiceCount: number; totalAmount: number }
    >
  >((acc, b) => {
    if (!acc[b.bucket]) {
      acc[b.bucket] = { bucket: b.bucket, invoiceCount: 0, totalAmount: 0 }
    }
    acc[b.bucket].invoiceCount += b.invoiceCount
    acc[b.bucket].totalAmount += b.totalAmount
    return acc
  }, {})

  const chartData = Object.values(aggregated)

  return (
    <ExpandableChartCard title={t('aging.title')}>
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          {t('aging.noData')}
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
              tickFormatter={(v: string) => `${v} ${t('aging.days')}`}
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
                const item = payload[0].payload as (typeof chartData)[number]
                return (
                  <div className="bg-popover rounded-md border p-3 text-sm shadow-md">
                    <p className="mb-1 font-semibold">
                      {item.bucket} {t('aging.days')}
                    </p>
                    <p>
                      {t('aging.invoiceCount')}:{' '}
                      <span className="font-medium">{item.invoiceCount}</span>
                    </p>
                    <p>
                      {t('aging.totalAmount')}:{' '}
                      <span className="font-medium">
                        {formatCurrency(item.totalAmount, 'RSD')}
                      </span>
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="totalAmount" radius={[4, 4, 0, 0]}>
              {chartData.map((d, index) => (
                <Cell key={index} fill={getBucketColor(d.bucket)} />
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
