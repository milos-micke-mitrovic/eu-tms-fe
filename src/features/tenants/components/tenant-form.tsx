import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, UserCog, Building2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
import { Badge } from '@/shared/ui/badge'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { SectionDivider } from '@/shared/components'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { tenantSchema, type TenantFormData } from '../schemas'
import {
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
} from '../api/use-tenant-mutations'
import { useTenantAdmins } from '../api/use-tenants'
import { CompanyDialog } from './company-dialog'
import { AdminDialog } from './admin-dialog'
import type { Tenant } from '../types'

type TenantFormProps = {
  open: boolean
  onClose: () => void
  tenant: Tenant | null
}

export function TenantForm({ open, onClose, tenant }: TenantFormProps) {
  const { t } = useTranslation('tenants')
  const isEditing = !!tenant

  const [companyDialogOpen, setCompanyDialogOpen] = useState(false)
  const [adminDialogOpen, setAdminDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const form = useForm<TenantFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: { subdomain: '', name: '', active: true },
  })

  const createMutation = useCreateTenant()
  const updateMutation = useUpdateTenant()
  const deleteMutation = useDeleteTenant()
  const isPending = createMutation.isPending || updateMutation.isPending

  const { data: admins } = useTenantAdmins(tenant?.id ?? 0)

  // Derive companies from admins (BE has no GET companies endpoint yet)
  const companies = (admins ?? []).reduce(
    (acc, admin) => {
      if (
        admin.companyId &&
        admin.companyName &&
        !acc.some((c) => c.id === admin.companyId)
      ) {
        acc.push({ id: admin.companyId, name: admin.companyName })
      }
      return acc
    },
    [] as { id: number; name: string }[]
  )

  useEffect(() => {
    if (open && tenant) {
      form.reset({
        subdomain: tenant.subdomain,
        name: tenant.name,
        active: tenant.active,
      })
    } else if (open) {
      form.reset({ subdomain: '', name: '', active: true })
    }
  }, [open, tenant, form])

  const onSubmit = async (data: TenantFormData) => {
    if (isEditing) {
      await updateMutation.mutateAsync({ id: tenant.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (tenant) {
      await deleteMutation.mutateAsync(tenant.id)
      setDeleteConfirmOpen(false)
      onClose()
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <Form
            form={form}
            onSubmit={onSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <SheetHeader
              actions={
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteConfirmOpen(true)}
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      {t('sheet.delete')}
                    </Button>
                  )}
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? t('common:app.loading') : t('sheet.save')}
                  </Button>
                </div>
              }
            >
              <SheetTitle>
                {isEditing ? t('sheet.editTitle') : t('sheet.addTitle')}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Section 1: Tenant Info */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('sheet.name')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('columns.code')}</FormLabel>
                      <FormControl>
                        <Input placeholder="acme-transport" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      {t('sheet.isActive')}
                    </FormLabel>
                  </FormItem>
                )}
              />

              {/* Section 2: Companies (edit only) */}
              {isEditing && (
                <>
                  <SectionDivider title={t('companies.title')} />
                  {companies.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <div className="bg-muted rounded-full p-3">
                        <Building2 className="text-muted-foreground size-5" />
                      </div>
                      <Caption className="text-muted-foreground">
                        {t('companies.empty')}
                      </Caption>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {companies.map((company) => (
                        <div
                          key={company.id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <BodySmall className="font-medium">
                            {company.name}
                          </BodySmall>
                          <Badge color="success">{t('status.active')}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCompanyDialogOpen(true)}
                  >
                    <Plus className="mr-2 size-4" />
                    {t('companies.addCompany')}
                  </Button>
                </>
              )}

              {/* Section 3: Admins (edit only) */}
              {isEditing && (
                <>
                  <SectionDivider title={t('admins.title')} />
                  {(admins ?? []).length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <div className="bg-muted rounded-full p-3">
                        <UserCog className="text-muted-foreground size-5" />
                      </div>
                      <Caption className="text-muted-foreground">
                        {t('admins.empty')}
                      </Caption>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(admins ?? []).map((admin) => (
                        <div
                          key={admin.id}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div>
                            <BodySmall className="font-medium">
                              {admin.firstName} {admin.lastName}
                            </BodySmall>
                            <Caption className="text-muted-foreground">
                              {admin.email}
                              {admin.companyName && ` — ${admin.companyName}`}
                            </Caption>
                          </div>
                          <Badge
                            color={admin.active ? 'success' : undefined}
                            variant={admin.active ? undefined : 'outline'}
                          >
                            {admin.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAdminDialogOpen(true)}
                    disabled={companies.length === 0}
                    title={
                      companies.length === 0
                        ? t('adminSheet.noCompanies')
                        : undefined
                    }
                  >
                    <Plus className="mr-2 size-4" />
                    {t('admins.addAdmin')}
                  </Button>
                </>
              )}
            </div>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title={t('common:deleteConfirm.title')}
        description={t('common:deleteConfirm.description')}
        loading={deleteMutation.isPending}
      />

      {/* Company Dialog */}
      {tenant && (
        <CompanyDialog
          open={companyDialogOpen}
          onClose={() => setCompanyDialogOpen(false)}
          tenantId={tenant.id}
        />
      )}

      {/* Admin Dialog */}
      {tenant && (
        <AdminDialog
          open={adminDialogOpen}
          onClose={() => setAdminDialogOpen(false)}
          tenantId={tenant.id}
          companies={companies}
        />
      )}
    </>
  )
}
