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
import type { Driver, DriverStatus } from '../types'

type DriverTableProps = {
  data: Driver[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  onEdit: (driver: Driver) => void
  onDelete: (driver: Driver) => void
  emptyAction?: ReactNode
}

const statusVariant: Record<DriverStatus, 'default' | 'secondary' | 'outline'> = {
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
  onEdit,
  onDelete,
  emptyAction,
}: DriverTableProps) {
  const { t } = useTranslation('fleet')

  const columns = useMemo<ColumnDef<Driver>[]>(
    () => [
      {
        accessorKey: 'firstName',
        header: t('drivers.firstName'),
        cell: ({ row }) => (
          <BodySmall className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </BodySmall>
        ),
      },
      {
        accessorKey: 'jmbg',
        header: t('drivers.jmbg'),
        cell: ({ row }) => row.original.jmbg ?? '—',
      },
      {
        accessorKey: 'phone',
        header: t('drivers.phone'),
        cell: ({ row }) => row.original.phone ?? '—',
      },
      {
        accessorKey: 'licenseCategories',
        header: t('drivers.categories'),
        cell: ({ row }) => row.original.licenseCategories ?? '—',
      },
      {
        accessorKey: 'status',
        header: t('common:status.active'),
        cell: ({ row }) => (
          <Badge variant={statusVariant[row.original.status]}>
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
      pageCount={pageCount}
      totalCount={totalCount}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPaginationChange={onPaginationChange}
      emptyAction={emptyAction}
    />
  )
}
