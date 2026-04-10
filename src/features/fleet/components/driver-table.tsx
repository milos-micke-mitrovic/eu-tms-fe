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
  emptyAction?: ReactNode
  isFiltered?: boolean
  onClearFilters?: () => void
}

const statusVariant: Record<DriverStatus, 'default' | 'secondary' | 'outline'> =
  {
    ACTIVE: 'default',
    ON_LEAVE: 'secondary',
    INACTIVE: 'outline',
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
  emptyAction,
  isFiltered,
  onClearFilters,
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
          <Badge variant={statusVariant[row.original.status as DriverStatus]}>
            {t(`drivers.statuses.${row.original.status}`)}
          </Badge>
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
      emptyAction={emptyAction}
      isFiltered={isFiltered}
      onClearFilters={onClearFilters}
    />
  )
}
