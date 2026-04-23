import { useState, useCallback, useMemo } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import {
  usePageTitle,
  useDebounce,
  useTableSort,
  useHighlightRow,
} from '@/shared/hooks'
import { PageHeader, SearchInput } from '@/shared/components'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { Caption, H4 } from '@/shared/ui/typography'
import { formatCurrency, cn } from '@/shared/utils'
import { useInvoices } from '../api/use-invoices'
import { useDeleteInvoice } from '../api/use-invoice-mutations'
import { InvoiceTable } from '../components/invoice-table'
import { InvoiceForm } from '../components/invoice-form'
import { InvoiceDetailSheet } from '../components/invoice-detail-sheet'
import type { InvoiceFilter } from '../types'

// The list query returns this shape per row
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

const STATUSES = ['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'] as const

export function InvoicesPage() {
  const { t } = useTranslation('finance')
  usePageTitle(t('invoices.title'))
  const [highlight, onDrawerClose] = useHighlightRow()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const { sorting, onSortingChange, sortBy, sortDir } = useTableSort()
  const [formOpen, setFormOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRow | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InvoiceRow | null>(null)

  const filter: InvoiceFilter = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortDir,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  }
  const { data, loading } = useInvoices(filter)
  const deleteMutation = useDeleteInvoice()
  const invoices = data?.invoices

  const isFiltered = !!debouncedSearch || !!statusFilter
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
  }

  const handleCreate = () => {
    setEditingInvoice(null)
    setFormOpen(true)
  }
  const handleEdit = useCallback((inv: InvoiceRow) => {
    setEditingInvoice(inv)
    setFormOpen(true)
  }, [])
  const handleDelete = useCallback(
    (inv: InvoiceRow) => setDeleteTarget(inv),
    []
  )
  const handleRowClick = useCallback(
    (inv: InvoiceRow) => setDetailId(inv.id),
    []
  )
  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteMutation.mutateAsync(deleteTarget.id)
        setDeleteTarget(null)
      } catch {
        // global error handler shows toast
      }
    }
  }

  // KPI calculations from current page data
  const kpis = useMemo(() => {
    const items = invoices?.content ?? []
    const totalInvoiced = items.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = items
      .filter((inv) => inv.paymentStatus === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0)
    const overdueCount = items.filter(
      (inv) => inv.paymentStatus === 'OVERDUE'
    ).length
    return { totalInvoiced, totalPaid, overdueCount }
  }, [invoices])

  const statusOptions = [
    ...STATUSES.map((s) => ({ value: s, label: t(`invoices.statuses.${s}`) })),
  ]

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-6">
      <PageHeader
        title={t('invoices.title')}
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            {t('invoices.create')}
          </Button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <Caption className="text-muted-foreground">
            {t('invoices.totalAmount')}
          </Caption>
          <H4>{formatCurrency(kpis.totalInvoiced, 'RSD')}</H4>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <Caption className="text-muted-foreground">
            {t('invoices.statuses.PAID')}
          </Caption>
          <H4 className="text-green-600 dark:text-green-400">
            {formatCurrency(kpis.totalPaid, 'RSD')}
          </H4>
        </div>
        <div
          className={cn(
            'rounded-lg border p-4 text-center',
            kpis.overdueCount > 0 && 'bg-red-50 dark:bg-red-950/20'
          )}
        >
          <Caption className="text-muted-foreground">
            {t('invoices.statuses.OVERDUE')}
          </Caption>
          <H4
            className={cn(
              kpis.overdueCount > 0 && 'text-red-600 dark:text-red-400'
            )}
          >
            {kpis.overdueCount}
          </H4>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('common:actions.search')}
          className="w-full sm:w-64"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full sm:w-44"
          placeholder={t('invoices.status')}
        />
      </div>

      {/* Table */}
      <InvoiceTable
        data={invoices?.content ?? []}
        isLoading={loading}
        highlightId={highlight.id}
        highlightName={highlight.name}
        pageCount={invoices?.totalPages ?? 0}
        totalCount={invoices?.totalElements ?? 0}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={onSortingChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        isFiltered={isFiltered}
        onClearFilters={clearFilters}
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            {t('invoices.create')}
          </Button>
        }
      />

      {/* Form sheet */}
      <InvoiceForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingInvoice(null)
        }}
        invoice={editingInvoice}
      />

      {/* Detail sheet */}
      <InvoiceDetailSheet
        open={!!detailId}
        onClose={() => {
          onDrawerClose(detailId)
          setDetailId(null)
        }}
        invoiceId={detailId}
        onEdit={() => {
          const inv = invoices?.content.find((i) => i.id === detailId) ?? null
          if (inv) handleEdit(inv)
        }}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('common:deleteConfirm.title')}
        description={t('invoices.confirm.delete')}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
