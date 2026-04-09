import { useState, useCallback } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { usePageTitle, useDebounce } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { usePartners } from '../api/use-partners'
import { useDeletePartner } from '../api/use-partner-mutations'
import { PartnerTable } from '../components/partner-table'
import { PartnerForm } from '../components/partner-form'
import type { Partner, PartnerFilter } from '../types'

export function PartnersPage() {
  const { t } = useTranslation('partners')
  usePageTitle(t('title'))

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [formOpen, setFormOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null)

  const filter: PartnerFilter = {
    search: debouncedSearch || undefined,
    partnerType: typeFilter || undefined,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  }
  const { data, loading } = usePartners(filter)
  const deleteMutation = useDeletePartner()
  const partners = data?.partners

  const handleCreate = () => { setEditingPartner(null); setFormOpen(true) }
  const handleEdit = useCallback((p: Partner) => { setEditingPartner(p); setFormOpen(true) }, [])
  const handleDelete = useCallback((p: Partner) => setDeleteTarget(p), [])
  const confirmDelete = async () => {
    if (deleteTarget) { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null) }
  }

  const typeOptions = [
    { value: '', label: t('common:actions.clear') },
    { value: 'CLIENT', label: t('partnerTypes.CLIENT') },
    { value: 'SUPPLIER', label: t('partnerTypes.SUPPLIER') },
    { value: 'BOTH', label: t('partnerTypes.BOTH') },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        action={<Button onClick={handleCreate}><Plus className="mr-2 size-4" />{t('addNew')}</Button>}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input placeholder={t('common:actions.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64" />
        <Select options={typeOptions} value={typeFilter} onChange={setTypeFilter} className="w-full sm:w-44" placeholder={t('type')} />
      </div>
      <PartnerTable data={partners?.content ?? []} isLoading={loading} pageCount={partners?.totalPages ?? 0} totalCount={partners?.totalElements ?? 0} pageIndex={pagination.pageIndex} pageSize={pagination.pageSize} onPaginationChange={setPagination} onEdit={handleEdit} onDelete={handleDelete}
        emptyAction={<Button size="sm" onClick={handleCreate}><Plus className="mr-2 size-4" />{t('addNew')}</Button>}
      />
      <PartnerForm open={formOpen} onClose={() => { setFormOpen(false); setEditingPartner(null) }} partner={editingPartner} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} onConfirm={confirmDelete} title={t('common:deleteConfirm.title')} description={t('common:deleteConfirm.description')} loading={deleteMutation.isPending} />
    </div>
  )
}
