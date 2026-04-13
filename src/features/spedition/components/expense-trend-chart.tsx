import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Inbox } from 'lucide-react'
import { BodySmall } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { ExpandableChartCard, useChartExpanded } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { ExpenseSummaryItem } from '../types'

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

function formatMonth(raw: string): string {
  // Handle ISO dates like "2026-03-01T00:00:00Z" or "2026-03"
  const parts = raw.split(/[-T]/)
  if (parts.length >= 2) {
    return `${MONTHS[parts[1]] ?? parts[1]} ${parts[0]}`
  }
  return raw
}

type ExpenseTrendChartProps = {
  data: ExpenseSummaryItem[]
  isLoading: boolean
}

function TrendBarChart({
  chartData,
}: {
  chartData: { name: string; total: number }[]
}) {
  const expanded = useChartExpanded()
  return (
    <ResponsiveContainer width="100%" height={expanded ? 500 : 280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
        <Tooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            return (
              <div className="bg-popover rounded-md border px-3 py-2 text-sm shadow-md">
                <p className="text-muted-foreground text-xs">
                  {item.payload.name}
                </p>
                <p className="font-medium">
                  {formatCurrency(Number(item.value), 'RSD')}
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="total" fill="hsl(173, 80%, 40%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ExpenseTrendChart({ data, isLoading }: ExpenseTrendChartProps) {
  const { t } = useTranslation('spedition')

  const chartData = data.map((item) => ({
    name: formatMonth(item.key),
    total: item.totalAmountRsd,
  }))

  return (
    <ExpandableChartCard title={t('expenses.trend')}>
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
        <TrendBarChart chartData={chartData} />
      )}
    </ExpandableChartCard>
  )
}
