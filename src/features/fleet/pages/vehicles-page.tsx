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
import { useVehicles } from '../api/use-vehicles'
import { useDeleteVehicle } from '../api/use-vehicle-mutations'
import { VehicleTable } from '../components/vehicle-table'
import { VehicleForm } from '../components/vehicle-form'
import { VehicleDetailSheet } from '../components/vehicle-detail-sheet'
import type { VehicleListItem, VehicleFilter } from '../types'

export function VehiclesPage() {
  const { t } = useTranslation('fleet')
  usePageTitle(t('vehicles.title'))
  const [highlight, onDrawerClose] = useHighlightRow()

  // Filter state
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  // Pagination + sorting state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const { sorting, onSortingChange, sortBy, sortDir } = useTableSort()

  // Sheet state
  const [formOpen, setFormOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<VehicleListItem | null>(
    null
  )
  const [detailVehicleId, setDetailVehicleId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<VehicleListItem | null>(null)

  // Queries
  const filter: VehicleFilter = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    vehicleType: typeFilter || undefined,
    sortBy,
    sortDir,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  }
  const { data, loading } = useVehicles(filter)
  const deleteMutation = useDeleteVehicle()

  const vehicles = data?.vehicles

  const isFiltered = !!debouncedSearch || !!statusFilter || !!typeFilter
  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setTypeFilter('')
  }

  // Handlers
  const handleCreate = () => {
    setEditingVehicle(null)
    setFormOpen(true)
  }

  const handleEdit = useCallback((vehicle: VehicleListItem) => {
    setEditingVehicle(vehicle)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((vehicle: VehicleListItem) => {
    setDeleteTarget(vehicle)
  }, [])

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const handleRowClick = useCallback((vehicle: VehicleListItem) => {
    setDetailVehicleId(vehicle.id)
  }, [])

  const statusOptions = [
    { value: 'ACTIVE', label: t('vehicles.statuses.ACTIVE') },
    { value: 'IN_SERVICE', label: t('vehicles.statuses.IN_SERVICE') },
    { value: 'INACTIVE', label: t('vehicles.statuses.INACTIVE') },
  ]

  const vehicleTypeOptions = [
    { value: 'TRUCK', label: t('vehicles.vehicleTypes.TRUCK') },
    { value: 'TRACTOR', label: t('vehicles.vehicleTypes.TRACTOR') },
    { value: 'TRAILER', label: t('vehicles.vehicleTypes.TRAILER') },
    { value: 'SEMI_TRAILER', label: t('vehicles.vehicleTypes.SEMI_TRAILER') },
  ]

  return (
    <div className="flex max-h-full min-h-0 flex-col gap-6">
      <PageHeader
        title={t('vehicles.title')}
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            {t('vehicles.addNew')}
          </Button>
        }
      />

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
          placeholder={t('vehicles.status')}
        />
        <Select
          options={vehicleTypeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
          className="w-full sm:w-44"
          placeholder={t('vehicles.type')}
        />
      </div>

      <VehicleTable
        data={vehicles?.content ?? []}
        isLoading={loading}
        highlightId={highlight.id}
        highlightName={highlight.name}
        getRowName={(v) => v.regNumber}
        pageCount={vehicles?.totalPages ?? 0}
        totalCount={vehicles?.totalElements ?? 0}
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
            {t('vehicles.addNew')}
          </Button>
        }
      />

      {/* Form Sheet */}
      <VehicleForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingVehicle(null)
        }}
        vehicle={editingVehicle}
      />

      {/* Detail Sheet */}
      <VehicleDetailSheet
        vehicleId={detailVehicleId}
        open={!!detailVehicleId}
        onClose={() => {
          onDrawerClose(detailVehicleId)
          setDetailVehicleId(null)
        }}
        onEdit={() => {
          if (detailVehicleId) {
            const v = vehicles?.content.find((v) => v.id === detailVehicleId)
            if (v) {
              setEditingVehicle(v)
              setFormOpen(true)
            }
            setDetailVehicleId(null)
          }
        }}
      />

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
