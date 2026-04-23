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
import { StatusBadge, type StatusConfig } from '@/shared/components'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/dropdown-menu'
import { BodySmall } from '@/shared/ui/typography'
import type { ReactNode } from 'react'
import type { DriverListItem, DriverStatus } from '../types'

type DriverTableProps = {
  data: DriverListItem[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  onEdit: (driver: DriverListItem) => void
  onDelete: (driver: DriverListItem) => void
  onRowClick?: (driver: DriverListItem) => void
  emptyAction?: ReactNode
  isFiltered?: boolean
  onClearFilters?: () => void
  highlightId?: string | number | null
  highlightName?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowName?: (row: any) => string
}

const statusConfig: Record<DriverStatus, StatusConfig> = {
  ACTIVE: { color: 'success' },
  ON_LEAVE: { color: 'warning' },
  INACTIVE: { variant: 'outline' },
}

export function DriverTable({
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
}: DriverTableProps) {
  const { t } = useTranslation('fleet')

  const columns = useMemo<ColumnDef<DriverListItem>[]>(
    () => [
      {
        accessorKey: 'firstName',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('drivers.firstName')}
          />
        ),
        cell: ({ row }) => (
          <BodySmall className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </BodySmall>
        ),
      },
      {
        accessorKey: 'jmbg',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('drivers.jmbg')} />
        ),
        cell: ({ row }) => row.original.jmbg ?? '—',
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('drivers.phone')} />
        ),
        cell: ({ row }) => row.original.phone ?? '—',
      },
      {
        accessorKey: 'licenseCategories',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('drivers.categories')}
          />
        ),
        cell: ({ row }) => row.original.licenseCategories ?? '—',
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('common:status.active')}
          />
        ),
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            config={statusConfig}
            label={t(`drivers.statuses.${row.original.status}`)}
          />
        ),
      },
      {
        accessorKey: 'vehicleRegNumber',
        header: t('drivers.vehicle'),
        cell: ({ row }) => row.original.vehicleRegNumber ?? '—',
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
