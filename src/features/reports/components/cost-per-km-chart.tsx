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
} from 'recharts'
import { formatCurrency } from '@/shared/utils'
import { ExpandableChartCard } from '@/shared/components'
import { useCostPerKm } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

type CostPerKmChartProps = {
  from: string
  to: string
}

export function CostPerKmChart({ from, to }: CostPerKmChartProps) {
  const { t } = useTranslation('reports')
  const { data, loading } = useCostPerKm(from, to)

  const { chartData, fleetAvg } = useMemo(() => {
    const raw = data?.costPerKm ?? []
    if (raw.length === 0) return { chartData: [], fleetAvg: 0 }

    const sorted = [...raw].sort((a, b) => b.costPerKmRsd - a.costPerKmRsd)

    const avg = raw.reduce((sum, d) => sum + d.costPerKmRsd, 0) / raw.length

    return { chartData: sorted, fleetAvg: avg }
  }, [data])

  return (
    <ExpandableChartCard title={t('stats.costPerKm')}>
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
              tickFormatter={(value: number) => `${value.toFixed(0)} RSD`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              label={{
                value: 'RSD/km',
                position: 'insideBottom',
                offset: -2,
                style: { fontSize: 11 },
              }}
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
                  <div className="bg-popover rounded-md border px-3 py-2 text-sm shadow-md">
                    <p className="mb-1 font-semibold">{item.regNumber}</p>
                    <p>
                      {t('stats.costPerKmValue')}:{' '}
                      {formatCurrency(item.costPerKmRsd, 'RSD')}
                    </p>
                    <p>
                      {t('stats.totalExpense')}:{' '}
                      {formatCurrency(item.totalExpenseRsd, 'RSD')}
                    </p>
                    <p>
                      {t('stats.totalKm')}:{' '}
                      {item.totalDistanceKm.toLocaleString('sr-RS')} km
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
                value: 'Prosek',
                position: 'top',
                style: { fontSize: 11, fill: '#6B7280' },
              }}
            />
            <Bar dataKey="costPerKmRsd" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ExpandableChartCard>
  )
}
