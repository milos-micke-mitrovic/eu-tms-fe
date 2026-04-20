import { useMemo } from 'react'
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
import { Skeleton } from '@/shared/ui/skeleton'
import { ExpandableChartCard, useChartExpanded } from '@/shared/components'
import { useTachographMonthlySummary } from '../api'
import { getDriverColor } from '../constants'

const MONTHS_SR: Record<string, string> = {
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
  const parts = m.split('-')
  return parts.length >= 2
    ? `${MONTHS_SR[parts[1]] ?? parts[1]} ${parts[0]}`
    : m
}

type MonthlyDrivingChartProps = {
  from: string
  to: string
}

function ChartInner({
  chartData,
  driverNames,
}: {
  chartData: Record<string, unknown>[]
  driverNames: string[]
}) {
  const expanded = useChartExpanded()
  return (
    <ResponsiveContainer width="100%" height={expanded ? 500 : 350}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
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
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          tickFormatter={(v: number) => `${v}h`}
          width={40}
        />
        <Tooltip
          cursor={false}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-popover rounded-md border px-3 py-2 text-sm shadow-md">
                <p className="mb-1 font-semibold">{label}</p>
                {payload.map((entry) => (
                  <p key={entry.dataKey as string}>
                    <span
                      className="mr-1.5 inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.name}: {Number(entry.value).toFixed(1)}h
                  </p>
                ))}
              </div>
            )
          }}
        />
        <Legend />
        {driverNames.map((name) => (
          <Bar
            key={name}
            dataKey={name}
            name={name}
            fill={getDriverColor(name, driverNames)}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function MonthlyDrivingChart({ from, to }: MonthlyDrivingChartProps) {
  const { t } = useTranslation('tachograph')
  const { data, loading } = useTachographMonthlySummary(from, to)

  const { chartData, driverNames } = useMemo(() => {
    const raw = data?.tachographMonthlySummary ?? []
    if (raw.length === 0) return { chartData: [], driverNames: [] }

    // Get top 5 drivers by total driving
    const driverTotals = new Map<string, number>()
    for (const r of raw) {
      const name = r.driverName ?? `Driver ${r.driverId}`
      driverTotals.set(
        name,
        (driverTotals.get(name) ?? 0) + r.totalDrivingMinutes
      )
    }
    const sorted = [...driverTotals.entries()].sort((a, b) => b[1] - a[1])
    const topDrivers = sorted
      .slice(0, 5)
      .map(([name]) => name)
      .sort()
    const hasOthers = sorted.length > 5

    // Group by month
    const monthMap = new Map<string, Record<string, number>>()
    for (const r of raw) {
      const month = fmtMonth(r.month)
      const name = r.driverName ?? `Driver ${r.driverId}`
      if (!monthMap.has(month)) monthMap.set(month, {})
      const bucket = topDrivers.includes(name) ? name : t('dashboard.others')
      const m = monthMap.get(month)!
      m[bucket] = (m[bucket] ?? 0) + Math.round(r.totalDrivingMinutes / 60)
    }

    const names = hasOthers
      ? [...topDrivers, t('dashboard.others')]
      : topDrivers
    const result = [...monthMap.entries()].map(([month, drivers]) => ({
      month,
      ...drivers,
    }))

    return { chartData: result, driverNames: names }
  }, [data, t])

  return (
    <ExpandableChartCard title={t('dashboard.monthlyDriving')}>
      {loading ? (
        <Skeleton className="h-[350px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[350px] items-center justify-center text-sm">
          {t('weekly.noEntries')}
        </div>
      ) : (
        <ChartInner chartData={chartData} driverNames={driverNames} />
      )}
    </ExpandableChartCard>
  )
}
