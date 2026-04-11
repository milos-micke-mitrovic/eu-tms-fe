import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { tenantSchema, type TenantFormData } from '../schemas'
import { useCreateTenant, useUpdateTenant } from '../api/use-tenant-mutations'
import type { Tenant } from '../types'

type TenantFormProps = {
  open: boolean
  onClose: () => void
  tenant: Tenant | null
}

export function TenantForm({ open, onClose, tenant }: TenantFormProps) {
  const { t } = useTranslation('tenants')
  const isEditing = !!tenant

  const form = useForm<TenantFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: {
      subdomain: '',
      name: '',
      active: true,
    },
  })

  const createMutation = useCreateTenant()
  const updateMutation = useUpdateTenant()
  const isPending = createMutation.isPending || updateMutation.isPending

  useEffect(() => {
    if (open && tenant) {
      form.reset({
        subdomain: tenant.subdomain,
        name: tenant.name,
        active: tenant.active,
      })
    } else if (open) {
      form.reset({
        subdomain: '',
        name: '',
        active: true,
      })
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('common:actions.edit') : t('addNew')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('name') : t('addNew')}
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('subdomain')} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="acme-transport" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('name')} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">{t('active')}</FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? t('common:app.loading') : t('common:actions.save')}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
