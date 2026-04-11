import { useState, useCallback } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { usePageTitle, useDebounce, useTableSort } from '@/shared/hooks'
import { PageHeader, SearchInput } from '@/shared/components'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { usePartners } from '../api/use-partners'
import { useDeletePartner } from '../api/use-partner-mutations'
import { PartnerTable } from '../components/partner-table'
import { PartnerForm } from '../components/partner-form'
import { PartnerDetailSheet } from '../components/partner-detail-sheet'
import type { PartnerListItem, PartnerFilter } from '../types'

export function PartnersPage() {
  const { t } = useTranslation('partners')
  usePageTitle(t('title'))

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const { sorting, onSortingChange, sortBy, sortDir } = useTableSort()
  const [formOpen, setFormOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<PartnerListItem | null>(
    null
  )
  const [detailPartner, setDetailPartner] = useState<PartnerListItem | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = useState<PartnerListItem | null>(null)

  const filter: PartnerFilter = {
    search: debouncedSearch || undefined,
    partnerType: typeFilter || undefined,
    sortBy,
    sortDir,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  }
  const { data, loading } = usePartners(filter)
  const deleteMutation = useDeletePartner()
  const partners = data?.partners

  const isFiltered = !!debouncedSearch || !!typeFilter
  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
  }

  const handleCreate = () => {
    setEditingPartner(null)
    setFormOpen(true)
  }
  const handleEdit = useCallback((p: PartnerListItem) => {
    setEditingPartner(p)
    setFormOpen(true)
  }, [])
  const handleRowClick = useCallback((p: PartnerListItem) => {
    setDetailPartner(p)
  }, [])
  const handleDelete = useCallback(
    (p: PartnerListItem) => setDeleteTarget(p),
    []
  )
  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const typeOptions = [
    { value: 'CLIENT', label: t('partnerTypes.CLIENT') },
    { value: 'SUPPLIER', label: t('partnerTypes.SUPPLIER') },
    { value: 'BOTH', label: t('partnerTypes.BOTH') },
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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('common:actions.search')}
          className="w-full sm:w-64"
        />
        <Select
          options={typeOptions}
          value={typeFilter}
          clearable
          onChange={setTypeFilter}
          className="w-full sm:w-44"
          placeholder={t('type')}
        />
      </div>
      <PartnerTable
        data={partners?.content ?? []}
        isLoading={loading}
        pageCount={partners?.totalPages ?? 0}
        totalCount={partners?.totalElements ?? 0}
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
            {t('addNew')}
          </Button>
        }
      />
      <PartnerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingPartner(null)
        }}
        partner={editingPartner}
      />
      <PartnerDetailSheet
        partner={detailPartner}
        open={!!detailPartner}
        onClose={() => setDetailPartner(null)}
        onEdit={() => {
          if (detailPartner) {
            setEditingPartner(detailPartner)
            setFormOpen(true)
            setDetailPartner(null)
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
