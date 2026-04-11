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
import { useMonthlyPnl } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

const MONTHS: Record<string, string> = {
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

function fmtMonth(m: string) {
  const p = m.split('-')
  return p.length >= 2 ? `${MONTHS[p[1]] ?? p[1]} ${p[0]}` : m
}

type MonthlyPnlChartProps = {
  from: string
  to: string
}

export function MonthlyPnlChart({ from, to }: MonthlyPnlChartProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useMonthlyPnl(from, to)

  const chartData = (data?.monthlyPnl ?? []).map((item) => ({
    ...item,
    label: fmtMonth(item.month),
  }))

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-sm font-semibold">{t('stats.monthlyPnl')}</h3>
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          {t('stats.noData')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
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
              dataKey="label"
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
              width={55}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload
                return (
                  <div className="bg-popover rounded-md border px-3 py-2 text-sm shadow-md">
                    <p className="mb-1 font-semibold">{item.label}</p>
                    <p>
                      {t('stats.revenue')}:{' '}
                      <span className="text-green-600 dark:text-green-400">
                        {formatCurrency(item.revenue, 'RSD')}
                      </span>
                    </p>
                    <p>
                      {t('stats.expenses')}:{' '}
                      <span className="text-destructive">
                        {formatCurrency(item.expenses, 'RSD')}
                      </span>
                    </p>
                    <p>
                      {t('stats.profit')}:{' '}
                      <span className="font-medium">
                        {formatCurrency(item.profit, 'RSD')}
                      </span>
                    </p>
                  </div>
                )
              }}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              name={t('stats.revenue')}
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="expenses"
              name={t('stats.expenses')}
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name={t('stats.profit')}
              stroke="#3B82F6"
              strokeWidth={2}
              dot={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
