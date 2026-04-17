import { useEffect, useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
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
import { AutocompleteInput } from '@/shared/ui/select/autocomplete-input'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { SectionDivider } from '@/shared/components'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { BodySmall, Caption, H4 } from '@/shared/ui/typography'
import { formatCurrency, setFormFieldErrors } from '@/shared/utils'
import { usePartners } from '@/features/partners/api/use-partners'
import { CURRENCIES } from '@/features/spedition/constants'
import {
  useCreateInvoice,
  useUpdateInvoice,
} from '../api/use-invoice-mutations'
import { invoiceSchema, type InvoiceFormData } from '../schemas'
import type { InvoiceRequest } from '../types'

// Accept the shape from the list query (subset of full Invoice)
type InvoiceRow = {
  id: string
  invoiceNumber: string
  paymentStatus: string
  invoiceDate: string
  dueDate: string
  currency: string
  total: number
  partner?: { id: string; name: string; pib?: string | null } | null
}

type InvoiceFormProps = {
  open: boolean
  onClose: () => void
  invoice?: InvoiceRow | null
}

const defaultValues: InvoiceFormData = {
  partnerId: 0,
  invoiceDate: '',
  dueDate: '',
  currency: 'RSD',
  vatRate: 20,
  items: [{ description: '', quantity: 1, unit: 'kom', unitPrice: 0 }],
  relatedRouteIds: '',
  notes: '',
}

export function InvoiceForm({ open, onClose, invoice }: InvoiceFormProps) {
  const { t } = useTranslation('finance')
  const isEditing = !!invoice

  const createMutation = useCreateInvoice()
  const updateMutation = useUpdateInvoice()
  const isPending = createMutation.isPending || updateMutation.isPending

  const [partnerSearch, setPartnerSearch] = useState('')
  const { data: partnersData, loading: partnersLoading } = usePartners({
    search: partnerSearch,
    size: 50,
  })
  const partnerOptions = (partnersData?.partners?.content ?? []).map((p) => ({
    value: String(p.id),
    label: `${p.name}${p.pib ? ` (PIB: ${p.pib})` : ''}`,
  }))

  const form = useForm<InvoiceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const [partnerLabel, setPartnerLabel] = useState('')

  useEffect(() => {
    if (invoice) {
      form.reset({
        partnerId: Number(invoice.partner?.id) || 0,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        currency: invoice.currency,
        vatRate: 20,
        items: [{ description: '', quantity: 1, unit: 'kom', unitPrice: 0 }],
        relatedRouteIds: '',
        notes: '',
      })
      setPartnerLabel(invoice.partner?.name ?? '')
    } else {
      form.reset(defaultValues)
      setPartnerLabel('')
    }
  }, [invoice, form])

  const watchItems = form.watch('items')
  const watchVatRate = form.watch('vatRate')
  const watchCurrency = form.watch('currency')

  const subtotal = (watchItems ?? []).reduce((sum, item) => {
    const qty = Number(item?.quantity) || 0
    const price = Number(item?.unitPrice) || 0
    return sum + qty * price
  }, 0)
  const vatAmount = subtotal * ((watchVatRate ?? 20) / 100)
  const total = subtotal + vatAmount

  const onSubmit = async (data: InvoiceFormData) => {
    const request: InvoiceRequest = {
      partnerId: data.partnerId,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      currency: data.currency,
      notes: data.notes || undefined,
      items: data.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: invoice.id, data: request })
      } else {
        await createMutation.mutateAsync(request)
      }
      onClose()
    } catch (error) {
      setFormFieldErrors(error, form.setError)
    }
  }

  const handlePartnerSearch = useCallback(
    (q: string) => setPartnerSearch(q),
    []
  )

  const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }))

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="sm:max-w-2xl">
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
              {isEditing ? t('invoices.edit') : t('invoices.create')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            {/* Partner & dates */}
            <div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="partnerId"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel required>{t('invoices.partner')}</FormLabel>
                      <AutocompleteInput
                        value={String(field.value || '')}
                        onChange={(v) => field.onChange(Number(v) || 0)}
                        options={partnerOptions}
                        onSearchChange={handlePartnerSearch}
                        placeholder={t('common:actions.search')}
                        loading={partnersLoading}
                        initialLabel={partnerLabel}
                        error={!!fieldState.error}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="invoiceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>
                          {t('invoices.issueDate')}
                        </FormLabel>
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
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>{t('invoices.dueDate')}</FormLabel>
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('invoices.currency')}</FormLabel>
                        <Select
                          options={currencyOptions}
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vatRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PDV (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            value={field.value ?? 20}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <SectionDivider title={t('finance:invoices.items')} />

            {/* Items */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <BodySmall className="font-medium">
                  {t('invoices.items')}
                </BodySmall>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      description: '',
                      quantity: 1,
                      unit: 'kom',
                      unitPrice: 0,
                    })
                  }
                >
                  <Plus className="mr-1 size-4" />
                  {t('invoices.addItem')}
                </Button>
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const qty = Number(watchItems?.[index]?.quantity) || 0
                  const price = Number(watchItems?.[index]?.unitPrice) || 0
                  const lineTotal = qty * price
                  return (
                    <div
                      key={field.id}
                      className="space-y-3 rounded-lg border p-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-3">
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel required>
                                  {t('invoices.description')}
                                </FormLabel>
                                <FormControl>
                                  <Input {...f} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-3 gap-3">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field: f }) => (
                                <FormItem>
                                  <FormLabel required>
                                    {t('invoices.quantity')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      value={f.value ?? ''}
                                      onChange={(e) =>
                                        f.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`items.${index}.unit`}
                              render={({ field: f }) => (
                                <FormItem>
                                  <FormLabel required>JM</FormLabel>
                                  <FormControl>
                                    <Input {...f} placeholder="kom" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field: f }) => (
                                <FormItem>
                                  <FormLabel required>
                                    {t('invoices.unitPrice')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      value={f.value ?? ''}
                                      onChange={(e) =>
                                        f.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 pt-6">
                          <Caption className="text-muted-foreground">
                            {t('invoices.amount')}
                          </Caption>
                          <BodySmall className="font-medium">
                            {formatCurrency(lineTotal, watchCurrency)}
                          </BodySmall>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive mt-1 size-7"
                              onClick={() => remove(index)}
                            >
                              <X className="size-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-border my-2 h-px" />

            {/* Totals */}
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex justify-between">
                <Caption className="text-muted-foreground">Osnovica</Caption>
                <BodySmall>{formatCurrency(subtotal, watchCurrency)}</BodySmall>
              </div>
              <div className="flex justify-between">
                <Caption className="text-muted-foreground">
                  PDV ({watchVatRate ?? 20}%)
                </Caption>
                <BodySmall>
                  {formatCurrency(vatAmount, watchCurrency)}
                </BodySmall>
              </div>
              <div className="bg-border my-1 h-px" />
              <div className="flex items-center justify-between">
                <BodySmall className="font-medium">UKUPNO</BodySmall>
                <H4>{formatCurrency(total, watchCurrency)}</H4>
              </div>
            </div>

            {/* Additional fields */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="relatedRouteIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Povezani nalozi</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="npr. 1, 2, 3"
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('invoices.notes')}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} value={field.value ?? ''} />
                    </FormControl>
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
