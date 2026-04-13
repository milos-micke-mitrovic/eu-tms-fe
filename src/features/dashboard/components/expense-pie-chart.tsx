import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { BodySmall } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { ExpandableChartCard } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { DashboardData } from '../api/use-dashboard'

const CATEGORY_COLORS: Record<string, string> = {
  FUEL: '#3B82F6',
  TOLL_DOMESTIC: '#8B5CF6',
  TOLL_INTERNATIONAL: '#7C3AED',
  PER_DIEM: '#F59E0B',
  PARKING: '#6B7280',
  VIGNETTE: '#10B981',
  CUSTOMS: '#EF4444',
  BORDER_FEE: '#F97316',
  FERRY: '#06B6D4',
  MAINTENANCE: '#8B5CF6',
  WASH: '#14B8A6',
  PHONE: '#A855F7',
  FINE: '#DC2626',
  OTHER: '#9CA3AF',
}

type ExpensePieChartProps = {
  data: DashboardData['expensesByCategory'] | undefined
}

type ChartEntry = {
  name: string
  value: number
  category: string
}

function PieChartContent({
  chartData,
  height,
  outerRadius,
}: {
  chartData: ChartEntry[]
  height: number
  outerRadius: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          dataKey="value"
          nameKey="name"
          label={false}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_COLORS[entry.category] ?? '#9CA3AF'}
            />
          ))}
        </Pie>
        <Tooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            return (
              <div className="bg-popover rounded-md border px-3 py-2 text-sm shadow-md">
                <p className="text-muted-foreground text-xs">{item.name}</p>
                <p className="font-medium">
                  {formatCurrency(Number(item.value), 'RSD')}
                </p>
              </div>
            )
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function Legend({ chartData }: { chartData: ChartEntry[] }) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
      {chartData.map((entry) => (
        <div key={entry.category} className="flex items-center gap-2 text-xs">
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{
              backgroundColor: CATEGORY_COLORS[entry.category] ?? '#9CA3AF',
            }}
          />
          <span className="text-muted-foreground truncate">{entry.name}</span>
          <span className="ml-auto shrink-0 font-medium">
            {formatCurrency(entry.value, 'RSD')}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const { t } = useTranslation(['dashboard', 'spedition'])

  if (!data) {
    return (
      <div className="rounded-lg border p-4">
        <BodySmall className="mb-3 font-medium">
          {t('dashboard:expensesByCategory')}
        </BodySmall>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: t(`spedition:expenses.categories.${item.category}`),
    value: item.totalAmountRsd,
    category: item.category,
  }))

  return (
    <ExpandableChartCard
      title={t('dashboard:expensesByCategory')}
      expandedContent={
        chartData.length > 0 ? (
          <>
            <PieChartContent
              chartData={chartData}
              height={600}
              outerRadius={250}
            />
            <Legend chartData={chartData} />
          </>
        ) : undefined
      }
    >
      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <BodySmall className="text-muted-foreground">
            {t('common:table.noData')}
          </BodySmall>
        </div>
      ) : (
        <>
          <PieChartContent
            chartData={chartData}
            height={220}
            outerRadius={90}
          />
          <Legend chartData={chartData} />
        </>
      )}
    </ExpandableChartCard>
  )
}
