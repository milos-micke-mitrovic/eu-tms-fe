import { useMemo } from 'react'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DataTable } from '@/shared/ui/data-table'
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
import type { Vehicle, VehicleStatus } from '../types'

type VehicleTableProps = {
  data: Vehicle[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
  onRowClick: (vehicle: Vehicle) => void
  emptyAction?: ReactNode
}

const statusVariant: Record<VehicleStatus, 'default' | 'secondary' | 'outline'> = {
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
  onRowClick,
  emptyAction,
}: VehicleTableProps) {
  const { t } = useTranslation('fleet')

  const columns = useMemo<ColumnDef<Vehicle>[]>(
    () => [
      {
        accessorKey: 'regNumber',
        header: t('vehicles.regNumber'),
        cell: ({ row }) => (
          <BodySmall className="font-medium">{row.original.regNumber}</BodySmall>
        ),
      },
      {
        accessorKey: 'make',
        header: t('vehicles.make'),
      },
      {
        accessorKey: 'model',
        header: t('vehicles.model'),
      },
      {
        accessorKey: 'year',
        header: t('vehicles.year'),
      },
      {
        accessorKey: 'vehicleType',
        header: t('vehicles.type'),
        cell: ({ row }) => t(`vehicles.vehicleTypes.${row.original.vehicleType}`),
      },
      {
        accessorKey: 'status',
        header: t('vehicles.status'),
        cell: ({ row }) => (
          <Badge variant={statusVariant[row.original.status]}>
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
        header: () => <span className="sr-only">{t('common:actions.edit')}</span>,
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
      pageCount={pageCount}
      totalCount={totalCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPaginationChange={onPaginationChange}
      onRowClick={onRowClick}
      emptyAction={emptyAction}
    />
  )
}
