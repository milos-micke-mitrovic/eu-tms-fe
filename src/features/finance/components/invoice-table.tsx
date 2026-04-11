import { useMemo } from 'react'
import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  FileCode,
} from 'lucide-react'
import { DataTable } from '@/shared/ui/data-table'
import { DataTableColumnHeader } from '@/shared/ui/data-table/data-table-column-header'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/overlay/dropdown-menu'
import { BodySmall } from '@/shared/ui/typography'
import { formatDate, formatCurrency, cn } from '@/shared/utils'
import { downloadFile } from '@/shared/utils/download-file'
import { InvoiceStatusBadge } from './invoice-status-badge'
import type { InvoiceStatus } from '../types'
import type { ReactNode } from 'react'

// The list query returns a subset of Invoice fields with nested partner
type InvoiceRow = {
  id: string
  invoiceNumber: string
  paymentStatus: string
  invoiceDate: string
  dueDate: string
  currency: string
  total: number
  partner?: { id: string; name: string; pib?: string | null } | null
}

type InvoiceTableProps = {
  data: InvoiceRow[]
  isLoading: boolean
  pageCount: number
  totalCount: number
  pageIndex: number
  pageSize: number
  onPaginationChange: (pagination: PaginationState) => void
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  onEdit: (invoice: InvoiceRow) => void
  onDelete: (invoice: InvoiceRow) => void
  onRowClick?: (invoice: InvoiceRow) => void
  emptyAction?: ReactNode
  isFiltered?: boolean
  onClearFilters?: () => void
  highlightId?: string | number | null
  highlightName?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRowName?: (row: any) => string
}

export function InvoiceTable({
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
}: InvoiceTableProps) {
  const { t } = useTranslation('finance')

  const columns = useMemo<ColumnDef<InvoiceRow>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('invoices.invoiceNumber')}
          />
        ),
        cell: ({ row }) => (
          <BodySmall className="font-mono font-medium">
            {row.original.invoiceNumber}
          </BodySmall>
        ),
      },
      {
        accessorKey: 'partner',
        header: t('invoices.partner'),
        cell: ({ row }) => row.original.partner?.name ?? '—',
      },
      {
        accessorKey: 'invoiceDate',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('invoices.issueDate')}
          />
        ),
        cell: ({ row }) => formatDate(row.original.invoiceDate),
      },
      {
        accessorKey: 'dueDate',
        header: t('invoices.dueDate'),
        cell: ({ row }) => {
          const isPastDue =
            new Date(row.original.dueDate) < new Date() &&
            row.original.paymentStatus !== 'PAID'
          return (
            <span className={cn(isPastDue && 'text-destructive font-medium')}>
              {formatDate(row.original.dueDate)}
            </span>
          )
        },
      },
      {
        accessorKey: 'currency',
        header: t('invoices.currency'),
        cell: ({ row }) => row.original.currency,
        size: 80,
      },
      {
        accessorKey: 'total',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title={t('invoices.totalAmount')}
          />
        ),
        cell: ({ row }) => (
          <BodySmall className="font-medium">
            {formatCurrency(row.original.total, row.original.currency)}
          </BodySmall>
        ),
      },
      {
        accessorKey: 'paymentStatus',
        header: t('invoices.status'),
        cell: ({ row }) => (
          <InvoiceStatusBadge
            status={row.original.paymentStatus as InvoiceStatus}
          />
        ),
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
                  onClick={() =>
                    downloadFile(
                      `/invoices/${row.original.id}/pdf`,
                      `Faktura-${row.original.invoiceNumber}.pdf`
                    )
                  }
                >
                  <FileText className="mr-2 size-4" />
                  {t('invoices.actions.downloadPdf')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    downloadFile(
                      `/invoices/${row.original.id}/xml`,
                      `Faktura-${row.original.invoiceNumber}.xml`
                    )
                  }
                >
                  <FileCode className="mr-2 size-4" />
                  {t('invoices.actions.downloadXml')}
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
