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
import { Select } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { COUNTRY_CODES } from '../constants'
import { useCreatePermit, useUpdatePermit } from '../api/use-permit-mutations'
import { permitSchema, type PermitFormData } from '../schemas'
import type { Permit, PermitRequest } from '../types'

type PermitFormProps = {
  open: boolean
  onClose: () => void
  permit?: Permit | null
}

const defaultValues: PermitFormData = {
  permitType: 'CEMT',
  countryCode: null,
  countryName: null,
  permitNumber: '',
  validFrom: '',
  validTo: '',
  notes: null,
}

export function PermitForm({ open, onClose, permit }: PermitFormProps) {
  const { t } = useTranslation('permits')
  const isEditing = !!permit

  const createMutation = useCreatePermit()
  const updateMutation = useUpdatePermit()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<PermitFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(permitSchema) as any,
    defaultValues,
  })

  const watchPermitType = form.watch('permitType')

  useEffect(() => {
    if (permit) {
      form.reset({
        permitType: permit.permitType,
        countryCode: permit.countryCode,
        countryName: permit.countryName,
        permitNumber: permit.permitNumber,
        validFrom: permit.validFrom,
        validTo: permit.validTo,
        notes: permit.notes,
      })
    } else {
      form.reset(defaultValues)
    }
  }, [permit, form])

  // Clear country fields when switching away from BILATERAL
  useEffect(() => {
    if (watchPermitType !== 'BILATERAL') {
      form.setValue('countryCode', null)
      form.setValue('countryName', null)
    }
  }, [watchPermitType, form])

  const onSubmit = async (data: PermitFormData) => {
    const request: PermitRequest = {
      permitType: data.permitType,
      permitNumber: data.permitNumber,
      validFrom: data.validFrom,
      validTo: data.validTo,
      countryCode:
        data.permitType === 'BILATERAL'
          ? (data.countryCode ?? undefined)
          : undefined,
      countryName:
        data.permitType === 'BILATERAL'
          ? (data.countryName ?? undefined)
          : undefined,
      notes: data.notes ?? undefined,
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: permit.id, data: request })
    } else {
      await createMutation.mutateAsync(request)
    }
    onClose()
  }

  const permitTypeOptions = (['CEMT', 'BILATERAL', 'ECMT'] as const).map(
    (v) => ({ value: v, label: t(`types.${v}`) })
  )

  const countryOptions = COUNTRY_CODES.map((c) => ({
    value: c.code,
    label: c.name,
  }))

  const handleCountryChange = (code: string) => {
    form.setValue('countryCode', code)
    const country = COUNTRY_CODES.find((c) => c.code === code)
    form.setValue('countryName', country?.name ?? null)
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
              {isEditing ? t('common:actions.edit') : t('addNew')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <FormField
              control={form.control}
              name="permitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('permitType')}</FormLabel>
                  <Select
                    options={permitTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchPermitType === 'BILATERAL' && (
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('country')}</FormLabel>
                    <Select
                      options={countryOptions}
                      value={field.value ?? undefined}
                      onChange={handleCountryChange}
                      searchable
                      placeholder={t('country')}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="permitNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('number')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('validFrom')}</FormLabel>
                    <DatePicker
                      value={field.value || undefined}
                      onChange={(date) => field.onChange(date ?? '')}
                      returnFormat="iso"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('validTo')}</FormLabel>
                    <DatePicker
                      value={field.value || undefined}
                      onChange={(date) => field.onChange(date ?? '')}
                      returnFormat="iso"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
