import { useMemo } from 'react'
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
import { useVehicleUtilization } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

function getUtilizationColor(percent: number): string {
  if (percent > 70) return '#10B981'
  if (percent >= 40) return '#F59E0B'
  return '#EF4444'
}

type VehicleUtilizationChartProps = {
  from: string
  to: string
}

export function VehicleUtilizationChart({
  from,
  to,
}: VehicleUtilizationChartProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useVehicleUtilization(from, to)

  const chartData = useMemo(() => {
    return data?.vehicleUtilization ?? []
  }, [data])

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-sm font-semibold">
        {t('stats.vehicleUtilization')}
      </h3>
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          {t('stats.noData')}
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
              dataKey="regNumber"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={45}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload
                return (
                  <div className="bg-popover rounded-md border px-3 py-2 text-sm shadow-md">
                    <p className="mb-1 font-semibold">{item.regNumber}</p>
                    <p>
                      {t('stats.daysOnRoad')}: {item.daysOnRoad} /{' '}
                      {item.daysInPeriod} {t('stats.days')}
                    </p>
                    <p>
                      {t('stats.utilization')}:{' '}
                      <span className="font-medium">
                        {item.utilizationPercent.toFixed(1)}%
                      </span>
                    </p>
                  </div>
                )
              }}
            />
            <Bar
              dataKey="utilizationPercent"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getUtilizationColor(entry.utilizationPercent)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
