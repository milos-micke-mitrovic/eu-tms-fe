import { useState, useCallback } from 'react'
import type { PaginationState } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { usePageTitle, useDebounce, useTableSort } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { useRoutes } from '../api/use-routes'
import { useDeleteRoute } from '../api/use-route-mutations'
import { RouteTable } from '../components/route-table'
import { RouteForm } from '../components/route-form'
import { RouteDetailSheet } from '../components/route-detail-sheet'
import type { Route, RouteFilter, RouteStatus } from '../types'

const STATUSES: RouteStatus[] = ['CREATED', 'DISPATCHED', 'IN_TRANSIT', 'COMPLETED', 'INVOICED', 'PAID', 'CANCELLED']

export function RoutesPage() {
  const { t } = useTranslation('spedition')
  usePageTitle(t('routes.title'))

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [routeTypeFilter, setRouteTypeFilter] = useState<string>('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const { sorting, onSortingChange, sortBy, sortDir } = useTableSort()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [detailRouteId, setDetailRouteId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null)

  const filter: RouteFilter = {
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    routeType: routeTypeFilter || undefined,
    sortBy,
    sortDir,
    page: pagination.pageIndex,
    size: pagination.pageSize,
  }
  const { data, loading } = useRoutes(filter)
  const deleteMutation = useDeleteRoute()
  const routes = data?.routes

  const handleCreate = () => { setEditingRoute(null); setFormOpen(true) }
  const handleEdit = useCallback((r: Route) => { setEditingRoute(r); setFormOpen(true); setDetailRouteId(null) }, [])
  const handleDelete = useCallback((r: Route) => setDeleteTarget(r), [])
  const handleRowClick = useCallback((r: Route) => setDetailRouteId(r.id), [])
  const confirmDelete = async () => {
    if (deleteTarget) { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null) }
  }

  const statusOptions = [
    { value: '', label: t('common:actions.clear') },
    ...STATUSES.map((s) => ({ value: s, label: t(`routes.status.${s}`) })),
  ]
  const routeTypeOptions = [
    { value: '', label: t('common:actions.clear') },
    { value: 'DOMESTIC', label: t('routes.domestic') },
    { value: 'INTERNATIONAL', label: t('routes.international') },
  ]

  return (
    <div className="flex min-h-0 max-h-full flex-col gap-6">
      <PageHeader
        title={t('routes.title')}
        action={<Button onClick={handleCreate}><Plus className="mr-2 size-4" />{t('routes.addNew')}</Button>}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input placeholder={t('common:actions.search')} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64" />
        <Select options={statusOptions} value={statusFilter} onChange={setStatusFilter} className="w-full sm:w-48" placeholder="Status" />
        <Select options={routeTypeOptions} value={routeTypeFilter} onChange={setRouteTypeFilter} className="w-full sm:w-48" placeholder={t('routes.routeType')} />
      </div>
      <RouteTable data={routes?.content ?? []} isLoading={loading} pageCount={routes?.totalPages ?? 0} totalCount={routes?.totalElements ?? 0} pageIndex={pagination.pageIndex} pageSize={pagination.pageSize} onPaginationChange={setPagination} sorting={sorting} onSortingChange={onSortingChange} onEdit={handleEdit} onDelete={handleDelete} onRowClick={handleRowClick}
        emptyAction={<Button size="sm" onClick={handleCreate}><Plus className="mr-2 size-4" />{t('routes.addNew')}</Button>}
      />
      {formOpen && <RouteForm open={formOpen} onClose={() => { setFormOpen(false); setEditingRoute(null) }} route={editingRoute} />}
      <RouteDetailSheet open={!!detailRouteId} onClose={() => setDetailRouteId(null)} routeId={detailRouteId} onEdit={handleEdit} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} onConfirm={confirmDelete} title={t('common:deleteConfirm.title')} description={t('common:deleteConfirm.description')} loading={deleteMutation.isPending} />
    </div>
  )
}
