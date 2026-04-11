import { useState, useCallback, useMemo } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { usePageTitle, useHighlightRow } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { Caption } from '@/shared/ui/typography'
import { usePermits } from '../api/use-permits'
import {
  useDeletePermit,
  useReleasePermit,
  useMarkPermitUsed,
} from '../api/use-permit-mutations'
import { PermitTable } from '../components/permit-table'
import { PermitForm } from '../components/permit-form'
import { PermitDetailSheet } from '../components/permit-detail-sheet'
import { PermitAssignDialog } from '../components/permit-assign-dialog'
import type { Permit } from '../types'

export function PermitsPage() {
  const { t } = useTranslation('permits')
  usePageTitle(t('title'))
  const [highlight, onDrawerClose] = useHighlightRow()

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  // Sheet/dialog state
  const [formOpen, setFormOpen] = useState(false)
  const [editingPermit, setEditingPermit] = useState<Permit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Permit | null>(null)
  const [detailPermit, setDetailPermit] = useState<Permit | null>(null)
  const [assignPermitId, setAssignPermitId] = useState<number | null>(null)

  // Queries
  const filter = {
    permitType: typeFilter || undefined,
    status: statusFilter || undefined,
  }
  const { data, loading } = usePermits(
    filter,
    pagination.pageIndex,
    pagination.pageSize
  )
  const deleteMutation = useDeletePermit()
  const releaseMutation = useReleasePermit()
  const markUsedMutation = useMarkPermitUsed()

  const permits = data?.permits

  const isFiltered = !!typeFilter || !!statusFilter
  const clearFilters = () => {
    setTypeFilter('')
    setStatusFilter('')
  }

  // Summary counts from current page data
  const summary = useMemo(() => {
    const all = permits?.content ?? []
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    return {
      available: all.filter((p) => p.status === 'AVAILABLE').length,
      assigned: all.filter((p) => p.status === 'ASSIGNED').length,
      expiringSoon: all.filter((p) => {
        const expiry = new Date(p.validTo)
        return (
          expiry >= now &&
          expiry <= thirtyDaysFromNow &&
          p.status !== 'EXPIRED' &&
          p.status !== 'USED'
        )
      }).length,
      expired: all.filter((p) => p.status === 'EXPIRED').length,
    }
  }, [permits])

  // Handlers
  const handleCreate = () => {
    setEditingPermit(null)
    setFormOpen(true)
  }

  const handleRowClick = useCallback((permit: Permit) => {
    setDetailPermit(permit)
  }, [])

  const handleEdit = useCallback((permit: Permit) => {
    setEditingPermit(permit)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((permit: Permit) => {
    setDeleteTarget(permit)
  }, [])

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const handleAssign = useCallback((permit: Permit) => {
    setAssignPermitId(permit.id)
  }, [])

  const handleRelease = useCallback(
    async (permit: Permit) => {
      await releaseMutation.mutateAsync(permit.id)
    },
    [releaseMutation]
  )

  const handleMarkUsed = useCallback(
    async (permit: Permit) => {
      await markUsedMutation.mutateAsync(permit.id)
    },
    [markUsedMutation]
  )

  const permitTypeOptions = [
    { value: 'CEMT', label: t('types.CEMT') },
    { value: 'BILATERAL', label: t('types.BILATERAL') },
    { value: 'ECMT', label: t('types.ECMT') },
  ]

  const statusOptions = [
    { value: 'AVAILABLE', label: t('status.AVAILABLE') },
    { value: 'ASSIGNED', label: t('status.ASSIGNED') },
    { value: 'IN_USE', label: t('status.IN_USE') },
    { value: 'EXPIRED', label: t('status.EXPIRED') },
    { value: 'USED', label: t('status.USED') },
  ]

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-6">
      <PageHeader
        title={t('title')}
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            {t('addNew')}
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <Caption className="text-muted-foreground">
              {t('summary.available')}
            </Caption>
            <p className="text-2xl font-semibold">{summary.available}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <Caption className="text-muted-foreground">
              {t('summary.assigned')}
            </Caption>
            <p className="text-2xl font-semibold">{summary.assigned}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <Clock className="size-5" />
          </div>
          <div>
            <Caption className="text-muted-foreground">
              {t('summary.expiringSoon')}
            </Caption>
            <p className="text-2xl font-semibold">{summary.expiringSoon}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10 text-red-600">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <Caption className="text-muted-foreground">
              {t('summary.expired')}
            </Caption>
            <p className="text-2xl font-semibold">{summary.expired}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          options={permitTypeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
          className="w-full sm:w-44"
          placeholder={t('permitType')}
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full sm:w-44"
          placeholder={'Status'}
        />
      </div>

      <PermitTable
        data={permits?.content ?? []}
        isLoading={loading}
        highlightId={highlight.id}
        highlightName={highlight.name}
        pageCount={permits?.totalPages ?? 0}
        totalCount={permits?.totalElements ?? 0}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssign={handleAssign}
        onRelease={handleRelease}
        onMarkUsed={handleMarkUsed}
        isFiltered={isFiltered}
        onClearFilters={clearFilters}
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            {t('addNew')}
          </Button>
        }
      />

      {/* Detail Sheet */}
      <PermitDetailSheet
        permit={detailPermit}
        open={!!detailPermit}
        onClose={() => {
          onDrawerClose(detailPermit?.id ?? null)
          setDetailPermit(null)
        }}
        onEdit={() => {
          if (detailPermit) {
            setEditingPermit(detailPermit)
            setFormOpen(true)
            setDetailPermit(null)
          }
        }}
      />

      {/* Form Sheet */}
      <PermitForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingPermit(null)
        }}
        permit={editingPermit}
      />

      {/* Assign Dialog */}
      {assignPermitId !== null && (
        <PermitAssignDialog
          permitId={assignPermitId}
          open={assignPermitId !== null}
          onClose={() => setAssignPermitId(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={t('common:deleteConfirm.title')}
        description={t('common:deleteConfirm.description')}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
