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

import { getDriverColor } from '../constants'
import { Skeleton } from '@/shared/ui/skeleton'
import { ExpandableChartCard, useChartExpanded } from '@/shared/components'
import { useTachographMonthlySummary } from '../api'

type AvgDailyDrivingChartProps = {
  from: string
  to: string
}

function ChartInner({
  chartData,
}: {
  chartData: { name: string; avgHours: number }[]
}) {
  const expanded = useChartExpanded()
  return (
    <ResponsiveContainer
      width="100%"
      height={
        expanded
          ? Math.max(400, chartData.length * 50)
          : Math.max(200, chartData.length * 40)
      }
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
          tickFormatter={(v: number) => `${v}h`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
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
                <p className="font-semibold">{item.payload.name}</p>
                <p>{Number(item.value).toFixed(1)}h / dan</p>
              </div>
            )
          }}
        />
        <ReferenceLine
          x={9}
          stroke="#F59E0B"
          strokeDasharray="3 3"
          label={{
            value: '9h',
            position: 'top',
            style: { fontSize: 10, fill: '#F59E0B' },
          }}
        />
        <ReferenceLine
          x={10}
          stroke="#EF4444"
          strokeDasharray="3 3"
          label={{
            value: '10h',
            position: 'top',
            style: { fontSize: 10, fill: '#EF4444' },
          }}
        />
        <Bar dataKey="avgHours" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={getDriverColor(
                entry.name,
                chartData.map((d) => d.name)
              )}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AvgDailyDrivingChart({ from, to }: AvgDailyDrivingChartProps) {
  const { t } = useTranslation('tachograph')
  const { data, loading } = useTachographMonthlySummary(from, to)

  const chartData = useMemo(() => {
    const raw = data?.tachographMonthlySummary ?? []
    if (raw.length === 0) return []

    // Aggregate avg daily driving per driver across all months
    const driverMap = new Map<
      string,
      { totalMinutes: number; totalEntries: number }
    >()
    for (const r of raw) {
      const name = r.driverName ?? `Driver ${r.driverId}`
      const existing = driverMap.get(name) ?? {
        totalMinutes: 0,
        totalEntries: 0,
      }
      existing.totalMinutes += r.totalDrivingMinutes
      existing.totalEntries += r.entryCount
      driverMap.set(name, existing)
    }

    return [...driverMap.entries()]
      .map(([name, { totalMinutes, totalEntries }]) => ({
        name,
        avgHours: totalEntries > 0 ? totalMinutes / totalEntries / 60 : 0,
        totalMinutes,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  return (
    <ExpandableChartCard title={t('dashboard.avgDailyDriving')}>
      {loading ? (
        <Skeleton className="h-[200px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
          {t('weekly.noEntries')}
        </div>
      ) : (
        <ChartInner chartData={chartData} />
      )}
    </ExpandableChartCard>
  )
}
