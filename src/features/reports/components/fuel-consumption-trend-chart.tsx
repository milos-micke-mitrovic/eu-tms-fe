import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ExpandableChartCard } from '@/shared/components'
import { useFuelConsumptionAllVehicles } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#F97316',
  '#EC4899',
]

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

type FuelConsumptionTrendChartProps = {
  from: string
  to: string
}

export function FuelConsumptionTrendChart({
  from,
  to,
}: FuelConsumptionTrendChartProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useFuelConsumptionAllVehicles(from, to)

  const { chartData, vehicles } = useMemo(() => {
    const raw = data?.fuelConsumptionAllVehicles ?? []
    if (raw.length === 0) return { chartData: [], vehicles: [] }

    const vehicleSet = new Set<string>()
    const grouped = new Map<string, Record<string, number>>()

    for (const entry of raw) {
      vehicleSet.add(entry.regNumber)
      if (!grouped.has(entry.month)) {
        grouped.set(entry.month, {})
      }
      grouped.get(entry.month)![entry.regNumber] = entry.avgLitersPer100km
    }

    const months = Array.from(grouped.keys()).sort()
    const vehicleList = Array.from(vehicleSet)

    const result = months.map((month) => ({
      month,
      label: fmtMonth(month),
      ...grouped.get(month),
    }))

    return { chartData: result, vehicles: vehicleList }
  }, [data])

  return (
    <ExpandableChartCard title={t('stats.fuelConsumptionTrend')}>
      {loading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : chartData.length === 0 ? (
        <div className="text-muted-foreground flex h-[300px] items-center justify-center text-sm">
          {t('stats.noData')}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
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
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={50}
              label={{
                value: 'l/100km',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 11 },
              }}
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
                          className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        {entry.name}: {Number(entry.value).toFixed(1)} l/100km
                      </p>
                    ))}
                  </div>
                )
              }}
            />
            <Legend />
            {vehicles.map((vehicle, index) => (
              <Line
                key={vehicle}
                type="monotone"
                dataKey={vehicle}
                name={vehicle}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={true}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </ExpandableChartCard>
  )
}
