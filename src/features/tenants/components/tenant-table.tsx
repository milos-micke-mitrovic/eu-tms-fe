import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react'
import { formatDate } from '@/shared/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay'
import { DataTable } from '@/shared/ui/data-table'
import type { Tenant } from '../types'
import type { ReactNode } from 'react'

type TenantTableProps = {
  data: Tenant[]
  isLoading: boolean
  onRowClick: (tenant: Tenant) => void
  onEdit: (tenant: Tenant) => void
  onDelete: (tenant: Tenant) => void
  onToggleStatus: (tenant: Tenant) => void
  emptyAction?: ReactNode
}

export function TenantTable({
  data,
  isLoading,
  onRowClick,
  onEdit,
  onDelete,
  onToggleStatus,
  emptyAction,
}: TenantTableProps) {
  const { t } = useTranslation('tenants')

  const columns = useMemo<ColumnDef<Tenant, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('columns.name'),
      },
      {
        accessorKey: 'subdomain',
        header: t('columns.code'),
        cell: ({ row }) => (
          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
            {row.original.subdomain}
          </code>
        ),
      },
      {
        accessorKey: 'active',
        header: t('columns.status'),
        cell: ({ row }) =>
          row.original.active ? (
            <Badge color="success">{t('status.active')}</Badge>
          ) : (
            <Badge variant="outline">{t('status.inactive')}</Badge>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: t('columns.createdAt'),
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const tenant = row.original
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(tenant)}>
                    <Pencil className="mr-2 size-4" />
                    {t('common:actions.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleStatus(tenant)}>
                    <Power className="mr-2 size-4" />
                    {t('toggleStatus')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(tenant)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    {t('common:actions.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [t, onEdit, onDelete, onToggleStatus]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      pagination={false}
      emptyText={t('title')}
      emptyAction={emptyAction}
      onRowClick={onRowClick}
    />
  )
}
