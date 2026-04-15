import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { companySchema, type CompanyFormData } from '../schemas'
import { useCreateTenantCompany } from '../api/use-tenant-mutations'

type CompanyDialogProps = {
  open: boolean
  onClose: () => void
  tenantId: number
}

export function CompanyDialog({ open, onClose, tenantId }: CompanyDialogProps) {
  const { t } = useTranslation('tenants')
  const createMutation = useCreateTenantCompany(tenantId)

  const form = useForm<CompanyFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(companySchema) as any,
    defaultValues: { name: '', pib: '', address: '', phone: '' },
  })

  useEffect(() => {
    if (open) form.reset({ name: '', pib: '', address: '', phone: '' })
  }, [open, form])

  const onSubmit = async (data: CompanyFormData) => {
    await createMutation.mutateAsync({
      name: data.name,
      pib: data.pib || undefined,
      address: data.address || undefined,
      phone: data.phone || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('companies.dialogTitle')}</DialogTitle>
        </DialogHeader>
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('companies.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pib"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companies.pib')}</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789" maxLength={9} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companies.address')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companies.phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? t('common:app.loading')
                  : t('common:actions.add')}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
