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
import type { TrailerListItem, TrailerStatus } from '../types'

type TrailerTableProps = {
  data: TrailerListItem[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  onEdit: (trailer: TrailerListItem) => void
  onDelete: (trailer: TrailerListItem) => void
  onRowClick?: (trailer: TrailerListItem) => void
  highlightId?: string | number | null
  highlightName?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowName?: (row: any) => string
  emptyAction?: ReactNode
  isFiltered?: boolean
  onClearFilters?: () => void
}

const statusConfig: Record<TrailerStatus, StatusConfig> = {
  ACTIVE: { color: 'success' },
  IN_SERVICE: { color: 'warning' },
  INACTIVE: { variant: 'outline' },
}

export function TrailerTable({
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
  highlightId,
  highlightName,
  getRowName,
  emptyAction,
  isFiltered,
  onClearFilters,
}: TrailerTableProps) {
  const { t } = useTranslation('fleet')

  const columns = useMemo<ColumnDef<TrailerListItem>[]>(
    () => [
      {
        accessorKey: 'regNumber',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('trailers.regNumber')}
          />
        ),
        cell: ({ row }) => (
          <BodySmall className="font-medium">
            {row.original.regNumber}
          </BodySmall>
        ),
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('trailers.type')} />
        ),
        cell: ({ row }) => t(`trailers.trailerTypes.${row.original.type}`),
      },
      {
        accessorKey: 'lengthM',
        header: t('trailers.length'),
        cell: ({ row }) => row.original.lengthM ?? '—',
      },
      {
        accessorKey: 'capacityKg',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('trailers.capacity')}
          />
        ),
        cell: ({ row }) => row.original.capacityKg ?? '—',
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('trailers.status')} />
        ),
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            config={statusConfig}
            label={t(`trailers.statuses.${row.original.status}`)}
          />
        ),
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
      highlightId={highlightId}
      highlightName={highlightName}
      getRowName={getRowName}
      emptyAction={emptyAction}
      isFiltered={isFiltered}
      onClearFilters={onClearFilters}
    />
  )
}
