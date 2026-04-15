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
import { Select } from '@/shared/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { adminSchema, type AdminFormData } from '../schemas'
import { useCreateTenantUser } from '../api/use-tenant-mutations'

type AdminDialogProps = {
  open: boolean
  onClose: () => void
  tenantId: number
  companies: { id: number; name: string }[]
}

export function AdminDialog({
  open,
  onClose,
  tenantId,
  companies,
}: AdminDialogProps) {
  const { t } = useTranslation('tenants')
  const createMutation = useCreateTenantUser(tenantId)

  const form = useForm<AdminFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(adminSchema) as any,
    defaultValues: {
      companyId: companies[0]?.id ?? 0,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        companyId: companies[0]?.id ?? 0,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      })
    }
  }, [open, form, companies])

  const companyOptions = companies.map((c) => ({
    value: String(c.id),
    label: c.name,
  }))

  const onSubmit = async (data: AdminFormData) => {
    await createMutation.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: 'ADMIN',
      companyId: data.companyId,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('adminSheet.addTitle')}</DialogTitle>
        </DialogHeader>
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('adminSheet.company')}</FormLabel>
                  <Select
                    options={companyOptions}
                    value={String(field.value)}
                    onChange={(v) => field.onChange(Number(v))}
                    placeholder={t('adminSheet.selectCompany')}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('adminSheet.firstName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('adminSheet.lastName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('adminSheet.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('adminSheet.password')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
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
