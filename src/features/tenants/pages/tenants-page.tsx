import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { usePageTitle, useDebounce } from '@/shared/hooks'
import { PageHeader, SearchInput } from '@/shared/components'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { Button } from '@/shared/ui/button'
import { Switch } from '@/shared/ui/switch'
import { Label } from '@/shared/ui/label'
import { useTenants, useSearchTenants } from '../api/use-tenants'
import {
  useDeleteTenant,
  useToggleTenantStatus,
} from '../api/use-tenant-mutations'
import { TenantTable } from '../components/tenant-table'
import { TenantForm } from '../components/tenant-form'
import { TenantDetailSheet } from '../components/tenant-detail-sheet'
import type { Tenant } from '../types'

export function TenantsPage() {
  const { t } = useTranslation('tenants')
  usePageTitle(t('title'))

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [activeOnly, setActiveOnly] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [detailTenant, setDetailTenant] = useState<Tenant | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tenant | null>(null)

  const tenantsQuery = useTenants(activeOnly)
  const searchQuery = useSearchTenants(debouncedSearch)

  const isSearching = debouncedSearch.length > 0
  const data = isSearching ? searchQuery.data : tenantsQuery.data
  const isLoading = isSearching ? searchQuery.isLoading : tenantsQuery.isLoading

  const filteredData = useMemo(() => {
    if (!data) return []
    const list =
      isSearching && activeOnly ? data.filter((t) => t.active) : [...data]
    return list.sort((a, b) => a.id - b.id)
  }, [data, isSearching, activeOnly])

  const deleteMutation = useDeleteTenant()
  const toggleMutation = useToggleTenantStatus()

  const handleCreate = () => {
    setEditingTenant(null)
    setFormOpen(true)
  }

  const handleRowClick = useCallback((tenant: Tenant) => {
    setDetailTenant(tenant)
  }, [])

  const handleEdit = useCallback((tenant: Tenant) => {
    setEditingTenant(tenant)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback((tenant: Tenant) => {
    setDeleteTarget(tenant)
  }, [])

  const handleToggleStatus = useCallback(
    (tenant: Tenant) => {
      toggleMutation.mutate(tenant.id)
    },
    [toggleMutation]
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
        <div className="flex items-center gap-2">
          <Switch
            id="active-only"
            checked={activeOnly}
            onCheckedChange={setActiveOnly}
          />
          <Label htmlFor="active-only">{t('activeOnly')}</Label>
        </div>
      </div>
      <TenantTable
        data={filteredData}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        emptyAction={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-2 size-4" />
            {t('addNew')}
          </Button>
        }
      />

      {/* Detail Drawer */}
      <TenantDetailSheet
        tenant={detailTenant}
        open={!!detailTenant}
        onClose={() => setDetailTenant(null)}
        onEdit={() => {
          if (detailTenant) {
            setEditingTenant(detailTenant)
            setFormOpen(true)
            setDetailTenant(null)
          }
        }}
      />

      {/* Edit/Create Form */}
      <TenantForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTenant(null)
        }}
        tenant={editingTenant}
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
