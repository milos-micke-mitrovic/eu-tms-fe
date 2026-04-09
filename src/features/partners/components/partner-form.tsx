import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select } from '@/shared/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { isValidPib } from '@/shared/utils'
import type { Partner, PartnerRequest } from '../types'
import { useCreatePartner, useUpdatePartner } from '../api/use-partner-mutations'

const partnerSchema = z.object({
  name: z.string().min(1),
  pib: z.string().refine((v) => !v || isValidPib(v), { message: 'Neispravan PIB (mod11)' }).optional().or(z.literal('')).nullable(),
  maticniBroj: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  contactPerson: z.string().optional().nullable(),
  partnerType: z.enum(['CLIENT', 'SUPPLIER', 'BOTH']),
  notes: z.string().optional().nullable(),
})

type PartnerFormData = z.infer<typeof partnerSchema>

type PartnerFormProps = {
  open: boolean
  onClose: () => void
  partner?: Partner | null
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
        maticniBroj: partner.maticniBroj ?? '',
        address: partner.address ?? '',
        city: partner.city ?? '',
        country: partner.country ?? 'RS',
        zipCode: partner.zipCode ?? '',
        bankAccount: partner.bankAccount ?? '',
        phone: partner.phone ?? '',
        email: partner.email ?? '',
        contactPerson: partner.contactPerson ?? '',
        partnerType: partner.partnerType,
        notes: partner.notes ?? '',
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

  const partnerTypeOptions = (['CLIENT', 'SUPPLIER', 'BOTH'] as const).map((v) => ({
    value: v,
    label: t(`partnerTypes.${v}`),
  }))

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? t('common:actions.edit') : t('addNew')}</SheetTitle>
        </SheetHeader>
        <Form form={form} onSubmit={onSubmit} className="space-y-4 p-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>{t('name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="partnerType" render={({ field }) => (
            <FormItem><FormLabel>{t('type')}</FormLabel><Select options={partnerTypeOptions} value={field.value} onChange={field.onChange} /><FormMessage /></FormItem>
          )} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="pib" render={({ field }) => (
              <FormItem><FormLabel>{t('pib')}</FormLabel><FormControl><Input placeholder="123456789" maxLength={9} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="maticniBroj" render={({ field }) => (
              <FormItem><FormLabel>{t('maticniBroj')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem><FormLabel>{t('address')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem><FormLabel>{t('city')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="zipCode" render={({ field }) => (
              <FormItem><FormLabel>{t('zipCode')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="country" render={({ field }) => (
              <FormItem><FormLabel>{t('country')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="bankAccount" render={({ field }) => (
            <FormItem><FormLabel>{t('bankAccount')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>{t('phone')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>{t('email')}</FormLabel><FormControl><Input type="email" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="contactPerson" render={({ field }) => (
            <FormItem><FormLabel>{t('contactPerson')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem><FormLabel>{t('notes')}</FormLabel><FormControl><Textarea rows={3} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
            <Button type="submit" disabled={isPending}>{isPending ? t('common:app.loading') : t('common:actions.save')}</Button>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
