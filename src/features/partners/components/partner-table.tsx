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
import type { PartnerListItem, PartnerType } from '../types'

type PartnerTableProps = {
  data: PartnerListItem[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  onEdit: (partner: PartnerListItem) => void
  onDelete: (partner: PartnerListItem) => void
  onRowClick?: (partner: PartnerListItem) => void
  highlightId?: string | number | null
  highlightName?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowName?: (row: any) => string
  emptyAction?: ReactNode
  isFiltered?: boolean
  onClearFilters?: () => void
}

const typeConfig: Record<
  PartnerType,
  {
    variant?: 'default' | 'secondary' | 'outline'
    color?: 'success' | 'info' | 'warning'
  }
> = {
  CLIENT: { color: 'info' },
  SUPPLIER: { color: 'warning' },
  BOTH: { color: 'success' },
}

export function PartnerTable({
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
}: PartnerTableProps) {
  const { t } = useTranslation('partners')

  const columns = useMemo<ColumnDef<PartnerListItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('name')} />
        ),
        cell: ({ row }) => (
          <BodySmall className="font-medium">{row.original.name}</BodySmall>
        ),
      },
      {
        accessorKey: 'pib',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('pib')} />
        ),
        cell: ({ row }) => row.original.pib ?? '—',
      },
      {
        accessorKey: 'city',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('city')} />
        ),
        cell: ({ row }) => row.original.city ?? '—',
      },
      {
        accessorKey: 'partnerType',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('type')} />
        ),
        cell: ({ row }) => (
          <Badge
            variant={
              typeConfig[row.original.partnerType as PartnerType]?.variant
            }
            color={typeConfig[row.original.partnerType as PartnerType]?.color}
          >
            {t(`partnerTypes.${row.original.partnerType}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'phone',
        header: t('phone'),
        cell: ({ row }) => row.original.phone ?? '—',
      },
      {
        accessorKey: 'email',
        header: t('email'),
        cell: ({ row }) => row.original.email ?? '—',
      },
      {
        id: 'actions',
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
      highlightId={highlightId}
      highlightName={highlightName}
      getRowName={getRowName}
      emptyAction={emptyAction}
      isFiltered={isFiltered}
      onClearFilters={onClearFilters}
    />
  )
}
