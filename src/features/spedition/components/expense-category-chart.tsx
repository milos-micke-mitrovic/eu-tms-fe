import { useTranslation } from 'react-i18next'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { Inbox } from 'lucide-react'
import { BodySmall } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { ExpandableChartCard, useChartExpanded } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { ExpenseSummaryItem } from '../types'

const COLORS = [
  'hsl(173, 80%, 40%)',
  'hsl(220, 70%, 50%)',
  'hsl(280, 60%, 55%)',
  'hsl(340, 75%, 55%)',
  'hsl(40, 90%, 50%)',
  'hsl(100, 60%, 40%)',
  'hsl(200, 70%, 45%)',
  'hsl(320, 65%, 50%)',
]

type ExpenseCategoryChartProps = {
  data: ExpenseSummaryItem[]
  isLoading: boolean
}

type ChartEntry = { name: string; value: number }

function PieChartInner({ chartData }: { chartData: ChartEntry[] }) {
  const expanded = useChartExpanded()
  const height = expanded ? 500 : 280
  const outerRadius = expanded ? 200 : 100

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={outerRadius}
          label={false}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function ExpenseCategoryChart({
  data,
  isLoading,
}: ExpenseCategoryChartProps) {
  const { t } = useTranslation('spedition')

  const chartData = data.map((item) => ({
    name: t(`expenses.categories.${item.key}`, { defaultValue: item.key }),
    value: item.totalAmountRsd,
  }))

  return (
    <ExpandableChartCard title={t('expenses.byCategory')}>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : chartData.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 py-12">
          <div className="bg-muted rounded-full p-3">
            <Inbox className="text-muted-foreground size-6" />
          </div>
          <BodySmall className="font-medium">
            {t('common:table.noData')}
          </BodySmall>
        </div>
      ) : (
        <PieChartInner chartData={chartData} />
      )}
    </ExpandableChartCard>
  )
}
