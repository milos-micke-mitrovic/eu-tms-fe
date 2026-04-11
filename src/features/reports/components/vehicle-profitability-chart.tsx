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
} from 'recharts'
import { formatCurrency } from '@/shared/utils'
import { useProfitabilityByVehicle } from '../api/use-statistics'
import { Skeleton } from '@/shared/ui/skeleton'

type VehicleProfitabilityChartProps = {
  from: string
  to: string
}

export function VehicleProfitabilityChart({
  from,
  to,
}: VehicleProfitabilityChartProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useProfitabilityByVehicle(from, to)

  const chartData = data?.profitabilityByVehicle ?? []

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-sm font-semibold">
        {t('statistics.vehicleProfitability')}
      </h3>
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          {t('statistics.vehicleProfitability')}
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={Math.max(200, chartData.length * 50)}
        >
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              strokeOpacity={0.15}
            />
            <XAxis
              type="number"
              tickFormatter={(value: number) => formatCurrency(value, 'RSD')}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="regNumber"
              width={100}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload
                return (
                  <div className="bg-popover rounded-md border p-3 text-sm shadow-md">
                    <p className="mb-1 font-semibold">{item.regNumber}</p>
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
                        {formatCurrency(item.profit, 'RSD')}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      {t('statistics.routeNumber')}: {item.routeCount}
                    </p>
                  </div>
                )
              }}
            />
            <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profit >= 0 ? '#10B981' : '#EF4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
