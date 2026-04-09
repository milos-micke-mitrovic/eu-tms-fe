import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Checkbox } from '@/shared/ui/checkbox'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { isValidJmbg } from '@/shared/utils'
import type { Driver, DriverRequest } from '../types'
import { useCreateDriver, useUpdateDriver } from '../api/use-driver-mutations'

const driverSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jmbg: z.string().refine((v) => !v || isValidJmbg(v), { message: 'Neispravan JMBG (mod11)' }).optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  birthDate: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  licenseCategories: z.string().optional().nullable(),
  adrCertificate: z.boolean().optional().nullable(),
  adrExpiry: z.string().optional().nullable(),
  healthCheckExpiry: z.string().optional().nullable(),
  employmentDate: z.string().optional().nullable(),
})

type DriverFormData = z.infer<typeof driverSchema>

type DriverFormProps = {
  open: boolean
  onClose: () => void
  driver?: Driver | null
}

const defaultValues: DriverFormData = {
  firstName: '',
  lastName: '',
  jmbg: '',
  phone: '',
  email: '',
  birthDate: '',
  licenseNumber: '',
  licenseCategories: '',
  adrCertificate: false,
  adrExpiry: '',
  healthCheckExpiry: '',
  employmentDate: '',
}

export function DriverForm({ open, onClose, driver }: DriverFormProps) {
  const { t } = useTranslation('fleet')
  const isEditing = !!driver

  const createMutation = useCreateDriver()
  const updateMutation = useUpdateDriver()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<DriverFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(driverSchema) as any,
    defaultValues,
  })

  useEffect(() => {
    if (driver) {
      form.reset({
        firstName: driver.firstName,
        lastName: driver.lastName,
        jmbg: driver.jmbg ?? '',
        phone: driver.phone ?? '',
        email: driver.email ?? '',
        birthDate: driver.birthDate ?? '',
        licenseNumber: driver.licenseNumber ?? '',
        licenseCategories: driver.licenseCategories ?? '',
        adrCertificate: driver.adrCertificate ?? false,
        adrExpiry: driver.adrExpiry ?? '',
        healthCheckExpiry: driver.healthCheckExpiry ?? '',
        employmentDate: driver.employmentDate ?? '',
      })
    } else {
      form.reset(defaultValues)
    }
  }, [driver, form])

  const onSubmit = async (data: DriverFormData) => {
    const request: DriverRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      jmbg: data.jmbg || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      birthDate: data.birthDate || undefined,
      licenseNumber: data.licenseNumber || undefined,
      licenseCategories: data.licenseCategories || undefined,
      adrCertificate: data.adrCertificate ?? undefined,
      adrExpiry: data.adrExpiry || undefined,
      healthCheckExpiry: data.healthCheckExpiry || undefined,
      employmentDate: data.employmentDate || undefined,
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: driver.id, data: request })
    } else {
      await createMutation.mutateAsync(request)
    }
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t('common:actions.edit') : t('drivers.addNew')}
          </SheetTitle>
        </SheetHeader>
        <Form form={form} onSubmit={onSubmit} className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drivers.firstName')}</FormLabel>
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
                  <FormLabel>{t('drivers.lastName')}</FormLabel>
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
            name="jmbg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('drivers.jmbg')}</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890123" maxLength={13} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drivers.phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drivers.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="licenseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drivers.licenseNumber')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="licenseCategories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drivers.categories')}</FormLabel>
                  <FormControl>
                    <Input placeholder="C, CE, D" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drivers.birthDate')}</FormLabel>
                  <DatePicker value={field.value ?? undefined} onChange={(d) => field.onChange(d ?? '')} returnFormat="iso" clearable />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drivers.employment')}</FormLabel>
                  <DatePicker value={field.value ?? undefined} onChange={(d) => field.onChange(d ?? '')} returnFormat="iso" clearable />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="adrCertificate"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">{t('drivers.adr')}</FormLabel>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="adrExpiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drivers.adrExpiry')}</FormLabel>
                  <DatePicker value={field.value ?? undefined} onChange={(d) => field.onChange(d ?? '')} returnFormat="iso" clearable />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="healthCheckExpiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drivers.healthCheckExpiry')}</FormLabel>
                  <DatePicker value={field.value ?? undefined} onChange={(d) => field.onChange(d ?? '')} returnFormat="iso" clearable />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('common:app.loading') : t('common:actions.save')}
            </Button>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
