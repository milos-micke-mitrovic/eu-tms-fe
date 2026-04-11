import { useState, useCallback } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { usePageTitle, useTableSort, useHighlightRow } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { useTrailers } from '../api/use-trailers'
import { useDeleteTrailer } from '../api/use-trailer-mutations'
import { TrailerTable } from '../components/trailer-table'
import { TrailerForm } from '../components/trailer-form'
import { TrailerDetailSheet } from '../components/trailer-detail-sheet'
import type { TrailerListItem } from '../types'

export function TrailersPage() {
  const { t } = useTranslation('fleet')
  usePageTitle(t('trailers.title'))
  const [highlight, onDrawerClose] = useHighlightRow()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const { sorting, onSortingChange, sortBy, sortDir } = useTableSort()
  const [formOpen, setFormOpen] = useState(false)
  const [editingTrailer, setEditingTrailer] = useState<TrailerListItem | null>(
    null
  )
  const [detailTrailer, setDetailTrailer] = useState<TrailerListItem | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<TrailerListItem | null>(null)

  const { data, loading } = useTrailers({
    sortBy,
    sortDir,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  })
  const deleteMutation = useDeleteTrailer()
  const trailers = data?.trailers

  const handleCreate = () => {
    setEditingTrailer(null)
    setFormOpen(true)
  }
  const handleEdit = useCallback((t: TrailerListItem) => {
    setEditingTrailer(t)
    setFormOpen(true)
  }, [])
  const handleRowClick = useCallback((t: TrailerListItem) => {
    setDetailTrailer(t)
  }, [])
  const handleDelete = useCallback(
    (t: TrailerListItem) => setDeleteTarget(t),
    []
  )
  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-6">
      <PageHeader
        title={t('trailers.title')}
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            {t('trailers.addNew')}
          </Button>
        }
      />
      <TrailerTable
        data={trailers?.content ?? []}
        isLoading={loading}
        highlightId={highlight.id}
        highlightName={highlight.name}
        pageCount={trailers?.totalPages ?? 0}
        totalCount={trailers?.totalElements ?? 0}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={onSortingChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            {t('trailers.addNew')}
          </Button>
        }
      />
      <TrailerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTrailer(null)
        }}
        trailer={editingTrailer}
      />
      <TrailerDetailSheet
        trailer={detailTrailer}
        open={!!detailTrailer}
        onClose={() => {
          onDrawerClose(detailTrailer?.id ?? null)
          setDetailTrailer(null)
        }}
        onEdit={() => {
          if (detailTrailer) {
            setEditingTrailer(detailTrailer)
            setFormOpen(true)
            setDetailTrailer(null)
          }
        }}
      />
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
