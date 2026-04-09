import { useState, useCallback } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { useTrailers } from '../api/use-trailers'
import { useDeleteTrailer } from '../api/use-trailer-mutations'
import { TrailerTable } from '../components/trailer-table'
import { TrailerForm } from '../components/trailer-form'
import type { Trailer } from '../types'

export function TrailersPage() {
  const { t } = useTranslation('fleet')
  usePageTitle(t('trailers.title'))

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [formOpen, setFormOpen] = useState(false)
  const [editingTrailer, setEditingTrailer] = useState<Trailer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Trailer | null>(null)

  const { data, loading } = useTrailers(pagination.pageIndex, pagination.pageSize)
  const deleteMutation = useDeleteTrailer()
  const trailers = data?.trailers

  const handleCreate = () => { setEditingTrailer(null); setFormOpen(true) }
  const handleEdit = useCallback((t: Trailer) => { setEditingTrailer(t); setFormOpen(true) }, [])
  const handleDelete = useCallback((t: Trailer) => setDeleteTarget(t), [])
  const confirmDelete = async () => {
    if (deleteTarget) { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null) }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('trailers.title')}
        action={<Button onClick={handleCreate}><Plus className="mr-2 size-4" />{t('trailers.addNew')}</Button>}
      />
      <TrailerTable data={trailers?.content ?? []} isLoading={loading} pageCount={trailers?.totalPages ?? 0} totalCount={trailers?.totalElements ?? 0} pageIndex={pagination.pageIndex} pageSize={pagination.pageSize} onPaginationChange={setPagination} onEdit={handleEdit} onDelete={handleDelete}
        emptyAction={<Button size="sm" onClick={handleCreate}><Plus className="mr-2 size-4" />{t('trailers.addNew')}</Button>}
      />
      <TrailerForm open={formOpen} onClose={() => { setFormOpen(false); setEditingTrailer(null) }} trailer={editingTrailer} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} onConfirm={confirmDelete} title={t('common:deleteConfirm.title')} description={t('common:deleteConfirm.description')} loading={deleteMutation.isPending} />
    </div>
  )
}
