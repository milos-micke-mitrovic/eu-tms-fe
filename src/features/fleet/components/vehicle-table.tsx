import { useMemo } from 'react'
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/shared/ui/data-table'
import { DataTableColumnHeader } from '@/shared/ui/data-table/data-table-column-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/dropdown-menu'
import { BodySmall } from '@/shared/ui/typography'
import type { ReactNode } from 'react'
import type { VehicleListItem, VehicleStatus } from '../types'

type VehicleTableProps = {
  data: VehicleListItem[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  onEdit: (vehicle: VehicleListItem) => void
  onDelete: (vehicle: VehicleListItem) => void
  onRowClick: (vehicle: VehicleListItem) => void
  emptyAction?: ReactNode
  isFiltered?: boolean
  onClearFilters?: () => void
}

const statusVariant: Record<
  VehicleStatus,
  'default' | 'secondary' | 'outline'
> = {
  ACTIVE: 'default',
  IN_SERVICE: 'secondary',
  INACTIVE: 'outline',
}

export function VehicleTable({
  data,
  isLoading,
  pageCount,
  totalCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  onEdit,
  onDelete,
  sorting,
  onSortingChange,
  onRowClick,
  emptyAction,
  isFiltered,
  onClearFilters,
}: VehicleTableProps) {
  const { t } = useTranslation('fleet')

  const columns = useMemo<ColumnDef<VehicleListItem>[]>(
    () => [
      {
        accessorKey: 'regNumber',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('vehicles.regNumber')}
          />
        ),
        cell: ({ row }) => (
          <BodySmall className="font-medium">
            {row.original.regNumber}
          </BodySmall>
        ),
      },
      {
        accessorKey: 'make',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('vehicles.make')} />
        ),
      },
      {
        accessorKey: 'model',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('vehicles.model')} />
        ),
      },
      {
        accessorKey: 'year',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('vehicles.year')} />
        ),
      },
      {
        accessorKey: 'vehicleType',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('vehicles.type')} />
        ),
        cell: ({ row }) =>
          t(`vehicles.vehicleTypes.${row.original.vehicleType}`),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('vehicles.status')} />
        ),
        cell: ({ row }) => (
          <Badge variant={statusVariant[row.original.status as VehicleStatus]}>
            {t(`vehicles.statuses.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'currentDriverName',
        header: t('vehicles.driver'),
        cell: ({ row }) => row.original.currentDriverName ?? '—',
      },
      {
        id: 'actions',
        header: () => (
          <span className="sr-only">{t('common:actions.edit')}</span>
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
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
    />
  )
}
