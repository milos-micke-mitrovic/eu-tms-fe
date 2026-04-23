import { useState, useCallback } from 'react'
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
import { useDrivers } from '../api/use-drivers'
import { useDeleteDriver } from '../api/use-driver-mutations'
import { DriverTable } from '../components/driver-table'
import { DriverForm } from '../components/driver-form'
import { DriverDetailSheet } from '../components/driver-detail-sheet'
import type { DriverListItem, DriverFilter } from '../types'

export function DriversPage() {
  const { t } = useTranslation('fleet')
  usePageTitle(t('drivers.title'))
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
  const [editingDriver, setEditingDriver] = useState<DriverListItem | null>(
    null
  )
  const [detailDriverId, setDetailDriverId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DriverListItem | null>(null)

  const filter: DriverFilter = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortDir,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  }
  const { data, loading } = useDrivers(filter)
  const deleteMutation = useDeleteDriver()
  const drivers = data?.drivers

  const isFiltered = !!debouncedSearch || !!statusFilter
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
  }

  const handleCreate = () => {
    setEditingDriver(null)
    setFormOpen(true)
  }
  const handleEdit = useCallback((d: DriverListItem) => {
    setEditingDriver(d)
    setFormOpen(true)
  }, [])
  const handleRowClick = useCallback((d: DriverListItem) => {
    setDetailDriverId(d.id)
  }, [])
  const handleDelete = useCallback(
    (d: DriverListItem) => setDeleteTarget(d),
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

  const statusOptions = [
    { value: 'ACTIVE', label: t('drivers.statuses.ACTIVE') },
    { value: 'ON_LEAVE', label: t('drivers.statuses.ON_LEAVE') },
    { value: 'INACTIVE', label: t('drivers.statuses.INACTIVE') },
  ]

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-6">
      <PageHeader
        title={t('drivers.title')}
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            {t('drivers.addNew')}
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
          options={statusOptions}
          value={statusFilter}
          clearable
          onChange={setStatusFilter}
          className="w-full sm:w-44"
          placeholder={t('common:status.active')}
        />
      </div>
      <DriverTable
        data={drivers?.content ?? []}
        isLoading={loading}
        highlightId={highlight.id}
        highlightName={highlight.name}
        getRowName={(d) => `${d.firstName} ${d.lastName}`}
        pageCount={drivers?.totalPages ?? 0}
        totalCount={drivers?.totalElements ?? 0}
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
            {t('drivers.addNew')}
          </Button>
        }
      />
      <DriverForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingDriver(null)
        }}
        driver={editingDriver}
      />
      <DriverDetailSheet
        driverId={detailDriverId}
        open={!!detailDriverId}
        onClose={() => {
          onDrawerClose(detailDriverId)
          setDetailDriverId(null)
        }}
        onEdit={() => {
          if (detailDriverId) {
            const d = drivers?.content.find((d) => d.id === detailDriverId)
            if (d) {
              setEditingDriver(d)
              setFormOpen(true)
            }
            setDetailDriverId(null)
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
