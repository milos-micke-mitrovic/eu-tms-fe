import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ExpandableChartCard } from '@/shared/components'
import { useDriverFuelComparison } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

type DriverFuelComparisonChartProps = {
  from: string
  to: string
}

export function DriverFuelComparisonChart({
  from,
  to,
}: DriverFuelComparisonChartProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useDriverFuelComparison(from, to)

  const { chartData, fleetAvg } = useMemo(() => {
    const raw = data?.driverFuelComparison ?? []
    if (raw.length === 0) return { chartData: [], fleetAvg: 0 }

    const sorted = [...raw].sort(
      (a, b) => b.avgLitersPer100km - a.avgLitersPer100km
    )

    const avg =
      raw.reduce((sum, d) => sum + d.avgLitersPer100km, 0) / raw.length

    return { chartData: sorted, fleetAvg: avg }
  }, [data])

  return (
    <ExpandableChartCard title={t('stats.driverFuelComparison')}>
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          {t('stats.noData')}
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
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              label={{
                value: 'l/100km',
                position: 'insideBottom',
                offset: -2,
                style: { fontSize: 11 },
              }}
            />
            <YAxis
              type="category"
              dataKey="driverName"
              width={120}
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
                  <div className="bg-popover rounded-md border px-3 py-2 text-sm shadow-md">
                    <p className="mb-1 font-semibold">{item.driverName}</p>
                    <p>
                      {t('stats.avgConsumption')}:{' '}
                      {item.avgLitersPer100km.toFixed(1)} l/100km
                    </p>
                    <p>
                      {t('stats.totalKm')}:{' '}
                      {item.totalKm.toLocaleString('sr-RS')} km
                    </p>
                    <p>
                      {t('stats.totalLiters')}:{' '}
                      {item.totalLiters.toLocaleString('sr-RS')} l
                    </p>
                  </div>
                )
              }}
            />
            <ReferenceLine
              x={fleetAvg}
              stroke="#6B7280"
              strokeDasharray="3 3"
              label={{
                value: t('stats.fleetAverage'),
                position: 'top',
                style: { fontSize: 11, fill: '#6B7280' },
              }}
            />
            <Bar dataKey="avgLitersPer100km" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.avgLitersPer100km <= fleetAvg ? '#10B981' : '#EF4444'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ExpandableChartCard>
  )
}
