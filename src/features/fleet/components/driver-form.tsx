import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import type { DriverListItem, DriverRequest } from '../types'
import { useCreateDriver, useUpdateDriver } from '../api/use-driver-mutations'
import { driverSchema, type DriverFormData } from '../schemas'

type DriverFormProps = {
  open: boolean
  onClose: () => void
  driver?: DriverListItem | null
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
        email: '',
        birthDate: '',
        licenseNumber: '',
        licenseCategories: driver.licenseCategories ?? '',
        adrCertificate: false,
        adrExpiry: '',
        healthCheckExpiry: '',
        employmentDate: '',
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
      <SheetContent className="sm:max-w-lg">
        <Form
          form={form}
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <SheetHeader
            actions={
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? t('common:app.loading') : t('common:actions.save')}
              </Button>
            }
          >
            <SheetTitle>
              {isEditing ? t('common:actions.edit') : t('drivers.addNew')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('drivers.firstName')}</FormLabel>
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
                    <FormLabel required>{t('drivers.lastName')}</FormLabel>
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
                    <Input
                      placeholder="1234567890123"
                      maxLength={13}
                      {...field}
                      value={field.value ?? ''}
                    />
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
                      <Input
                        type="email"
                        {...field}
                        value={field.value ?? ''}
                      />
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
                      <Input
                        placeholder="C, CE, D"
                        {...field}
                        value={field.value ?? ''}
                      />
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
                    <DatePicker
                      value={field.value ?? undefined}
                      onChange={(d) => field.onChange(d ?? '')}
                      returnFormat="iso"
                      clearable
                    />
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
                    <DatePicker
                      value={field.value ?? undefined}
                      onChange={(d) => field.onChange(d ?? '')}
                      returnFormat="iso"
                      clearable
                    />
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
                    <DatePicker
                      value={field.value ?? undefined}
                      onChange={(d) => field.onChange(d ?? '')}
                      returnFormat="iso"
                      clearable
                    />
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
                    <DatePicker
                      value={field.value ?? undefined}
                      onChange={(d) => field.onChange(d ?? '')}
                      returnFormat="iso"
                      clearable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
