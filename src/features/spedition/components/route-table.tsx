import { useMemo } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/dropdown-menu'
import { BodySmall } from '@/shared/ui/typography'
import { formatDate, formatCurrency } from '@/shared/utils'
import { RouteStatusBadge } from './route-status-badge'
import type { ReactNode } from 'react'
import type { Route } from '../types'

type RouteTableProps = {
  data: Route[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  onEdit: (route: Route) => void
  onDelete: (route: Route) => void
  onRowClick: (route: Route) => void
  emptyAction?: ReactNode
}

export function RouteTable({
  data, isLoading, pageCount, totalCount, pageIndex, pageSize,
  onPaginationChange, onEdit, onDelete, onRowClick, emptyAction,
}: RouteTableProps) {
  const { t } = useTranslation('spedition')

  const columns = useMemo<ColumnDef<Route>[]>(
    () => [
      {
        accessorKey: 'internalNumber',
        header: t('routes.routeNumber'),
        cell: ({ row }) => (
          <BodySmall className="font-medium">{row.original.internalNumber}</BodySmall>
        ),
      },
      {
        accessorKey: 'status',
        header: t('common:status.active'),
        cell: ({ row }) => <RouteStatusBadge status={row.original.status} />,
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
        header: t('routes.departure'),
        cell: ({ row }) => row.original.departureDate ? formatDate(row.original.departureDate) : '—',
      },
      {
        accessorKey: 'price',
        header: t('routes.price'),
        cell: ({ row }) =>
          row.original.price != null
            ? formatCurrency(row.original.price, row.original.currency ?? 'EUR')
            : '—',
      },
      {
        accessorKey: 'profit',
        header: t('expenses.profit'),
        cell: ({ row }) =>
          row.original.profit != null
            ? formatCurrency(row.original.profit, 'RSD')
            : '—',
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="mr-2 size-4" />{t('common:actions.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(row.original)}>
                <Trash2 className="mr-2 size-4" />{t('common:actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        size: 50,
      },
    ],
    [t, onEdit, onDelete]
  )

  return (
    <DataTable columns={columns} data={data} isLoading={isLoading} manualPagination
      pageCount={pageCount} totalCount={totalCount} pageIndex={pageIndex} pageSize={pageSize}
      onPaginationChange={onPaginationChange} onRowClick={onRowClick}
      emptyAction={emptyAction}
    />
  )
}
