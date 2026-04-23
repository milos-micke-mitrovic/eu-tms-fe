import { useMemo } from 'react'
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/shared/ui/data-table'
import { DataTableColumnHeader } from '@/shared/ui/data-table/data-table-column-header'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/dropdown-menu'
import { BodySmall } from '@/shared/ui/typography'
import { formatDate, formatCurrency, cn } from '@/shared/utils'
import { RouteStatusBadge, RouteTypeBadge } from './route-status-badge'
import type { RouteListItem, RouteStatus } from '../types'

type RouteTableProps = {
  data: RouteListItem[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  onEdit: (route: RouteListItem) => void
  onDelete: (route: RouteListItem) => void
  onRowClick: (route: RouteListItem) => void
  emptyAction?: ReactNode
  isFiltered?: boolean
  onClearFilters?: () => void
  highlightId?: string | number | null
  highlightName?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowName?: (row: any) => string
}

export function RouteTable({
  data,
  isLoading,
  pageCount,
  totalCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  sorting,
  onSortingChange,
  onEdit,
  onDelete,
  onRowClick,
  emptyAction,
  isFiltered,
  onClearFilters,
  highlightId,
  highlightName,
  getRowName,
}: RouteTableProps) {
  const { t } = useTranslation('spedition')

  const columns = useMemo<ColumnDef<RouteListItem>[]>(
    () => [
      {
        accessorKey: 'internalNumber',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('routes.routeNumber')}
          />
        ),
        cell: ({ row }) => (
          <BodySmall className="font-mono font-medium">
            {row.original.internalNumber}
          </BodySmall>
        ),
      },
      {
        accessorKey: 'routeType',
        header: t('routes.routeType'),
        cell: ({ row }) => (
          <RouteTypeBadge routeType={row.original.routeType} />
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <RouteStatusBadge status={row.original.status as RouteStatus} />
        ),
      },
      {
        accessorKey: 'partner',
        header: t('routes.partner'),
        cell: ({ row }) => row.original.partner?.name ?? '—',
      },
      {
        accessorKey: 'vehicle',
        header: t('routes.vehicle'),
        cell: ({ row }) => row.original.vehicle?.regNumber ?? '—',
      },
      {
        accessorKey: 'driver',
        header: t('routes.driver'),
        cell: ({ row }) => {
          const d = row.original.driver
          return d ? `${d.firstName} ${d.lastName}` : '—'
        },
      },
      {
        accessorKey: 'departureDate',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('routes.departure')}
          />
        ),
        cell: ({ row }) =>
          row.original.departureDate
            ? formatDate(row.original.departureDate)
            : '—',
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('routes.price')} />
        ),
        cell: ({ row }) =>
          row.original.price != null
            ? formatCurrency(row.original.price, row.original.currency ?? 'EUR')
            : '—',
      },
      {
        accessorKey: 'totalExpenseRsd',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('expenses.total')} />
        ),
        cell: ({ row }) => {
          const val = row.original.totalExpenseRsd
          if (val == null || val === 0)
            return <span className="text-muted-foreground">—</span>
          return formatCurrency(val, 'RSD')
        },
      },
      {
        accessorKey: 'profit',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('expenses.profit')} />
        ),
        cell: ({ row }) => {
          const profit = row.original.profit
          const hasExpenses =
            row.original.totalExpenseRsd != null &&
            row.original.totalExpenseRsd !== 0
          if (!hasExpenses)
            return <span className="text-muted-foreground">—</span>
          return (
            <BodySmall
              className={cn(
                'font-medium',
                profit != null && profit > 0
                  ? 'text-green-600 dark:text-green-400'
                  : profit != null && profit < 0
                    ? 'text-red-600 dark:text-red-400'
                    : ''
              )}
            >
              {profit != null ? formatCurrency(profit, 'RSD') : '—'}
            </BodySmall>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={t('common:aria.openMenu')}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <Pencil className="mr-2 size-4" />
                  {t('common:actions.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(row.original)}
                >
                  <Trash2 className="mr-2 size-4" />
                  {t('common:actions.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
        size: 50,
      },
    ],
    [t, onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      manualPagination
      manualSorting
      sorting={sorting}
      onSortingChange={onSortingChange}
      pageCount={pageCount}
      totalCount={totalCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPaginationChange={onPaginationChange}
      onRowClick={onRowClick}
      emptyAction={emptyAction}
      isFiltered={isFiltered}
      onClearFilters={onClearFilters}
      highlightId={highlightId}
      highlightName={highlightName}
      getRowName={getRowName}
    />
  )
}
