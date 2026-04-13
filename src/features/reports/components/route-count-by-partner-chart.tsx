import { useTranslation } from 'react-i18next'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/shared/utils'
import { ExpandableChartCard } from '@/shared/components'
import { useRouteCountByPartner } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

type RouteCountByPartnerChartProps = {
  from: string
  to: string
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(value)
}

export function RouteCountByPartnerChart({
  from,
  to,
}: RouteCountByPartnerChartProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useRouteCountByPartner(from, to)

  const chartData = data?.routeCountByPartner ?? []

  return (
    <ExpandableChartCard title={t('stats.routesByPartner')}>
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          {t('stats.routesByPartner')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.15}
            />
            <XAxis
              dataKey="partnerName"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={80}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={40}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatCompact}
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
                    <p className="mb-1 font-semibold">{item.partnerName}</p>
                    <p>
                      {t('stats.routeCount', { defaultValue: 'Br. tura' })}:{' '}
                      <span className="font-medium">{item.routeCount}</span>
                    </p>
                    <p>
                      {t('stats.totalRevenue', {
                        defaultValue: 'Ukupan prihod',
                      })}
                      :{' '}
                      <span className="font-medium">
                        {formatCurrency(item.totalRevenue, 'RSD')}
                      </span>
                    </p>
                  </div>
                )
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="routeCount"
              name={t('stats.routeCount', { defaultValue: 'Br. tura' })}
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalRevenue"
              name={t('stats.totalRevenue', { defaultValue: 'Ukupan prihod' })}
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ExpandableChartCard>
  )
}
