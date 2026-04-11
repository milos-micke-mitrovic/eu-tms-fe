import { useMemo } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Truck,
  Unlock,
  CheckCircle2,
} from 'lucide-react'
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
import { formatDate } from '@/shared/utils'
import { PERMIT_STATUS_COLORS } from '../constants'
import type { Permit } from '../types'
import type { ReactNode } from 'react'

type PermitTableProps = {
  data: Permit[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  onEdit: (permit: Permit) => void
  onDelete: (permit: Permit) => void
  onAssign: (permit: Permit) => void
  onRelease: (permit: Permit) => void
  onMarkUsed: (permit: Permit) => void
  onRowClick?: (permit: Permit) => void
  emptyAction?: ReactNode
  isFiltered?: boolean
  onClearFilters?: () => void
  highlightId?: string | number | null
  highlightName?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowName?: (row: any) => string
}

function isExpiringSoon(validTo: string): boolean {
  const expiryDate = new Date(validTo)
  const now = new Date()
  const daysUntil =
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return daysUntil <= 30 && daysUntil >= 0
}

function isExpired(validTo: string): boolean {
  return new Date(validTo) < new Date()
}

export function PermitTable({
  data,
  isLoading,
  pageCount,
  totalCount,
  pageIndex,
  pageSize,
  onPaginationChange,
  onEdit,
  onDelete,
  onAssign,
  onRelease,
  onMarkUsed,
  onRowClick,
  emptyAction,
  isFiltered,
  onClearFilters,
  highlightId,
  highlightName,
  getRowName,
}: PermitTableProps) {
  const { t } = useTranslation('permits')

  const columns = useMemo<ColumnDef<Permit>[]>(
    () => [
      {
        accessorKey: 'permitType',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('permitType')} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">
            {t(`types.${row.original.permitType}`)}
          </Badge>
        ),
      },
      {
        accessorKey: 'countryName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('country')} />
        ),
        cell: ({ row }) => (
          <BodySmall>{row.original.countryName ?? t('allCountries')}</BodySmall>
        ),
      },
      {
        accessorKey: 'permitNumber',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('number')} />
        ),
        cell: ({ row }) => (
          <BodySmall className="font-medium">
            {row.original.permitNumber}
          </BodySmall>
        ),
      },
      {
        accessorKey: 'validFrom',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('validFrom')} />
        ),
        cell: ({ row }) => formatDate(row.original.validFrom),
      },
      {
        accessorKey: 'validTo',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('validTo')} />
        ),
        cell: ({ row }) => {
          const val = row.original.validTo
          const expired = isExpired(val)
          const expiring = isExpiringSoon(val)
          return (
            <span
              className={
                expired
                  ? 'text-destructive font-medium'
                  : expiring
                    ? 'font-medium text-amber-600'
                    : ''
              }
            >
              {formatDate(val)}
            </span>
          )
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={'Status'} />
        ),
        cell: ({ row }) => {
          const statusConfig = PERMIT_STATUS_COLORS[row.original.status]
          return (
            <Badge variant={statusConfig?.variant ?? 'outline'}>
              {t(`status.${row.original.status}`)}
            </Badge>
          )
        },
      },
      {
        id: 'actions',
        header: () => (
          <span className="sr-only">{t('common:actions.edit')}</span>
        ),
        cell: ({ row }) => {
          const permit = row.original
          const canAssign = permit.status === 'AVAILABLE'
          const canRelease = permit.status === 'ASSIGNED'
          const canMarkUsed =
            permit.status === 'ASSIGNED' || permit.status === 'IN_USE'
          const canDelete =
            permit.status === 'AVAILABLE' || permit.status === 'EXPIRED'

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(permit)}>
                    <Pencil className="mr-2 size-4" />
                    {t('common:actions.edit')}
                  </DropdownMenuItem>
                  {canAssign && (
                    <DropdownMenuItem onClick={() => onAssign(permit)}>
                      <Truck className="mr-2 size-4" />
                      {t('assign')}
                    </DropdownMenuItem>
                  )}
                  {canRelease && (
                    <DropdownMenuItem onClick={() => onRelease(permit)}>
                      <Unlock className="mr-2 size-4" />
                      {t('release')}
                    </DropdownMenuItem>
                  )}
                  {canMarkUsed && (
                    <DropdownMenuItem onClick={() => onMarkUsed(permit)}>
                      <CheckCircle2 className="mr-2 size-4" />
                      {t('markUsed')}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(permit)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      {t('common:actions.delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
        size: 50,
      },
    ],
    [t, onEdit, onDelete, onAssign, onRelease, onMarkUsed]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      manualPagination
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
