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
import { Textarea } from '@/shared/ui/textarea'
import { Select } from '@/shared/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import type { PartnerListItem, PartnerRequest } from '../types'
import {
  useCreatePartner,
  useUpdatePartner,
} from '../api/use-partner-mutations'
import { partnerSchema, type PartnerFormData } from '../schemas'

type PartnerFormProps = {
  open: boolean
  onClose: () => void
  partner?: PartnerListItem | null
}

const defaultValues: PartnerFormData = {
  name: '',
  pib: '',
  maticniBroj: '',
  address: '',
  city: '',
  country: 'RS',
  zipCode: '',
  bankAccount: '',
  phone: '',
  email: '',
  contactPerson: '',
  partnerType: 'CLIENT',
  notes: '',
}

export function PartnerForm({ open, onClose, partner }: PartnerFormProps) {
  const { t } = useTranslation('partners')
  const isEditing = !!partner

  const createMutation = useCreatePartner()
  const updateMutation = useUpdatePartner()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<PartnerFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(partnerSchema) as any,
    defaultValues,
  })

  useEffect(() => {
    if (partner) {
      form.reset({
        name: partner.name,
        pib: partner.pib ?? '',
        maticniBroj: '',
        address: '',
        city: partner.city ?? '',
        country: 'RS',
        zipCode: '',
        bankAccount: '',
        phone: partner.phone ?? '',
        email: partner.email ?? '',
        contactPerson: partner.contactPerson ?? '',
        partnerType: partner.partnerType as PartnerRequest['partnerType'],
        notes: '',
      })
    } else {
      form.reset(defaultValues)
    }
  }, [partner, form])

  const onSubmit = async (data: PartnerFormData) => {
    const request: PartnerRequest = {
      name: data.name,
      pib: data.pib || undefined,
      maticniBroj: data.maticniBroj || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      country: data.country || undefined,
      zipCode: data.zipCode || undefined,
      bankAccount: data.bankAccount || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      contactPerson: data.contactPerson || undefined,
      partnerType: data.partnerType,
      notes: data.notes || undefined,
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: partner.id, data: request })
    } else {
      await createMutation.mutateAsync(request)
    }
    onClose()
  }

  const partnerTypeOptions = (['CLIENT', 'SUPPLIER', 'BOTH'] as const).map(
    (v) => ({
      value: v,
      label: t(`partnerTypes.${v}`),
    })
  )

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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partnerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('type')}</FormLabel>
                  <Select
                    options={partnerTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="pib"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pib')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456789"
                        maxLength={9}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maticniBroj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('maticniBroj')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('address')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('city')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('zipCode')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('country')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bankAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bankAccount')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
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
                    <FormLabel>{t('phone')}</FormLabel>
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
                    <FormLabel>{t('email')}</FormLabel>
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

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contactPerson')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes')}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} value={field.value ?? ''} />
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
