import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createColumnHelper,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table'
import { DataTable } from '@/shared/ui/data-table/data-table'
import { formatCurrency } from '@/shared/utils'
import { cn } from '@/shared/utils'
import {
  useProfitabilityByRoute,
  type RouteProfitability,
} from '../api/use-statistics'

const columnHelper = createColumnHelper<RouteProfitability>()

type ProfitabilityTableProps = {
  from: string
  to: string
}

export function ProfitabilityTable({ from, to }: ProfitabilityTableProps) {
  const { t } = useTranslation('reports')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { data, loading } = useProfitabilityByRoute(
    from,
    to,
    pagination.pageIndex,
    pagination.pageSize
  )

  const result = data?.profitabilityByRoute

  const columns: ColumnDef<RouteProfitability, unknown>[] = [
    columnHelper.accessor('internalNumber', {
      header: t('statistics.routeNumber'),
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('partnerName', {
      header: t('statistics.client'),
    }),
    columnHelper.accessor('vehicleRegNumber', {
      header: t('statistics.vehicle'),
    }),
    columnHelper.accessor('revenue', {
      header: t('statistics.revenue'),
      cell: (info) => (
        <span className="text-green-600 dark:text-green-400">
          {formatCurrency(info.getValue(), 'RSD')}
        </span>
      ),
    }),
    columnHelper.accessor('expenses', {
      header: t('statistics.expenses'),
      cell: (info) => (
        <span className="text-destructive">
          {formatCurrency(info.getValue(), 'RSD')}
        </span>
      ),
    }),
    columnHelper.accessor('profit', {
      header: t('statistics.profit'),
      cell: (info) => {
        const value = info.getValue()
        return (
          <span
            className={cn(
              'font-medium',
              value >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-destructive'
            )}
          >
            {formatCurrency(value, 'RSD')}
          </span>
        )
      },
    }),
    columnHelper.accessor('marginPercent', {
      header: t('statistics.margin'),
      cell: (info) => {
        const value = info.getValue()
        const clampedWidth = Math.min(Math.max(value, 0), 100)
        return (
          <div className="flex items-center gap-2">
            <div className="bg-muted h-2 w-16 overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  value >= 20
                    ? 'bg-green-500'
                    : value >= 10
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                )}
                style={{ width: `${clampedWidth}%` }}
              />
            </div>
            <span className="text-muted-foreground text-sm">
              {value.toFixed(1)}%
            </span>
          </div>
        )
      },
    }),
  ] as ColumnDef<RouteProfitability, unknown>[]

  return (
    <DataTable
      columns={columns}
      data={result?.content ?? []}
      manualPagination
      pageCount={result?.totalPages ?? 0}
      totalCount={result?.totalElements ?? 0}
      pageIndex={pagination.pageIndex}
      pageSize={pagination.pageSize}
      onPaginationChange={setPagination}
      isLoading={loading}
      emptyText={t('statistics.routeProfitability')}
    />
  )
}
