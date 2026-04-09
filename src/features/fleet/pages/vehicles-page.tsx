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
import { useVehicles } from '../api/use-vehicles'
import { useDeleteVehicle } from '../api/use-vehicle-mutations'
import { VehicleTable } from '../components/vehicle-table'
import { VehicleForm } from '../components/vehicle-form'
import { VehicleDetailSheet } from '../components/vehicle-detail-sheet'
import type { Vehicle, VehicleFilter } from '../types'

export function VehiclesPage() {
  const { t } = useTranslation('fleet')
  usePageTitle(t('vehicles.title'))

  // Filter state
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  // Sheet state
  const [formOpen, setFormOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [detailVehicleId, setDetailVehicleId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)

  // Queries
  const filter: VehicleFilter = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    vehicleType: typeFilter || undefined,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  }
  const { data, loading } = useVehicles(filter)
  const deleteMutation = useDeleteVehicle()

  const vehicles = data?.vehicles

  // Handlers
  const handleCreate = () => {
    setEditingVehicle(null)
    setFormOpen(true)
  }

  const handleEdit = useCallback((vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((vehicle: Vehicle) => {
    setDeleteTarget(vehicle)
  }, [])

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const handleRowClick = useCallback((vehicle: Vehicle) => {
    setDetailVehicleId(vehicle.id)
  }, [])

  const statusOptions = [
    { value: '', label: t('common:actions.clear') },
    { value: 'ACTIVE', label: t('vehicles.statuses.ACTIVE') },
    { value: 'IN_SERVICE', label: t('vehicles.statuses.IN_SERVICE') },
    { value: 'INACTIVE', label: t('vehicles.statuses.INACTIVE') },
  ]

  const vehicleTypeOptions = [
    { value: '', label: t('common:actions.clear') },
    { value: 'TRUCK', label: t('vehicles.vehicleTypes.TRUCK') },
    { value: 'TRACTOR', label: t('vehicles.vehicleTypes.TRACTOR') },
    { value: 'TRAILER', label: t('vehicles.vehicleTypes.TRAILER') },
    { value: 'SEMI_TRAILER', label: t('vehicles.vehicleTypes.SEMI_TRAILER') },
  ]

  return (
    <div className="space-y-6">
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
        <Input
          placeholder={t('common:actions.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        pageCount={vehicles?.totalPages ?? 0}
        totalCount={vehicles?.totalElements ?? 0}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={setPagination}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 size-4" />{t('vehicles.addNew')}
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
        onClose={() => setDetailVehicleId(null)}
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
