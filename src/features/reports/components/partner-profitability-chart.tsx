import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/shared/utils'
import { ExpandableChartCard } from '@/shared/components'
import { useProfitabilityByPartner } from '../api/use-statistics'
import { Skeleton } from '@/shared/ui/skeleton'

type PartnerProfitabilityChartProps = {
  from: string
  to: string
}

export function PartnerProfitabilityChart({
  from,
  to,
}: PartnerProfitabilityChartProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useProfitabilityByPartner(from, to)

  const chartData = data?.profitabilityByPartner ?? []

  return (
    <ExpandableChartCard title={t('statistics.partnerProfitability')}>
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          {t('statistics.partnerProfitability')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
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
              tickFormatter={(value: number) => {
                if (value >= 1_000_000)
                  return `${(value / 1_000_000).toFixed(1)}M`
                if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
                return String(value)
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={50}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload
                const profit = item.totalRevenue - item.totalExpenses
                return (
                  <div className="bg-popover rounded-md border p-3 text-sm shadow-md">
                    <p className="mb-1 font-semibold">{item.partnerName}</p>
                    <p>
                      {t('statistics.revenue')}:{' '}
                      <span className="text-green-600 dark:text-green-400">
                        {formatCurrency(item.totalRevenue, 'RSD')}
                      </span>
                    </p>
                    <p>
                      {t('statistics.expenses')}:{' '}
                      <span className="text-destructive">
                        {formatCurrency(item.totalExpenses, 'RSD')}
                      </span>
                    </p>
                    <p>
                      {t('statistics.profit')}:{' '}
                      <span className="font-medium">
                        {formatCurrency(profit, 'RSD')}
                      </span>
                    </p>
                  </div>
                )
              }}
            />
            <Legend />
            <Bar
              dataKey="totalRevenue"
              name={t('statistics.revenue')}
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="totalExpenses"
              name={t('statistics.expenses')}
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ExpandableChartCard>
  )
}
