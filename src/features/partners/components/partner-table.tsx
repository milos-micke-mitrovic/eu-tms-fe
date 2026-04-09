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
import type { Partner, PartnerType } from '../types'

type PartnerTableProps = {
  data: Partner[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  onEdit: (partner: Partner) => void
  onDelete: (partner: Partner) => void
  emptyAction?: ReactNode
}

const typeVariant: Record<PartnerType, 'default' | 'secondary' | 'outline'> = {
  CLIENT: 'default',
  SUPPLIER: 'secondary',
  BOTH: 'outline',
}

export function PartnerTable({
  data, isLoading, pageCount, totalCount, pageIndex, pageSize,
  onPaginationChange, onEdit, onDelete, emptyAction,
}: PartnerTableProps) {
  const { t } = useTranslation('partners')

  const columns = useMemo<ColumnDef<Partner>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('name'),
        cell: ({ row }) => <BodySmall className="font-medium">{row.original.name}</BodySmall>,
      },
      { accessorKey: 'pib', header: t('pib'), cell: ({ row }) => row.original.pib ?? '—' },
      { accessorKey: 'city', header: t('city'), cell: ({ row }) => row.original.city ?? '—' },
      {
        accessorKey: 'partnerType',
        header: t('type'),
        cell: ({ row }) => (
          <Badge variant={typeVariant[row.original.partnerType]}>
            {t(`partnerTypes.${row.original.partnerType}`)}
          </Badge>
        ),
      },
      { accessorKey: 'phone', header: t('phone'), cell: ({ row }) => row.original.phone ?? '—' },
      { accessorKey: 'email', header: t('email'), cell: ({ row }) => row.original.email ?? '—' },
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
    <DataTable columns={columns} data={data} isLoading={isLoading} manualPagination pageCount={pageCount} totalCount={totalCount} pageIndex={pageIndex} pageSize={pageSize} onPaginationChange={onPaginationChange} emptyAction={emptyAction} />
  )
}
