import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Caption, BodySmall } from '@/shared/ui/typography'
import { formatCurrency } from '@/shared/utils'
import { useRecordPayment } from '../api'
import { PAYMENT_METHOD_CONFIG } from '../constants'

const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  paymentDate: z.string().min(1),
  paymentMethod: z.string().min(1),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: number
  invoiceNumber: string
  totalAmount: number
  amountPaid: number
  currency: string
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  totalAmount,
  amountPaid,
  currency,
}: Props) {
  const { t } = useTranslation('collections')
  const recordPayment = useRecordPayment()

  const remaining = totalAmount - amountPaid

  const form = useForm<PaymentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      amount: remaining > 0 ? remaining : 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        amount: remaining > 0 ? remaining : 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'BANK_TRANSFER',
        referenceNumber: '',
        notes: '',
      })
    }
  }, [open, remaining, form])

  const watchedAmount = form.watch('amount') ?? 0
  const newTotal = amountPaid + watchedAmount
  const willClose = newTotal >= totalAmount
  const progressPct =
    totalAmount > 0 ? Math.min((newTotal / totalAmount) * 100, 100) : 0

  const paymentMethodOptions = Object.entries(PAYMENT_METHOD_CONFIG).map(
    ([value, cfg]) => ({
      value,
      label: t(`paymentMethod.${cfg.key}`),
    })
  )

  const onSubmit = (values: PaymentFormValues) => {
    recordPayment.mutate(
      {
        invoiceId,
        amount: values.amount,
        paymentDate: values.paymentDate,
        paymentMethod: values.paymentMethod,
        currency,
        referenceNumber: values.referenceNumber || undefined,
        notes: values.notes || undefined,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('payment.title')}</DialogTitle>
          <DialogDescription>
            {t('payment.forInvoice', { number: invoiceNumber })}
          </DialogDescription>
        </DialogHeader>

        {/* Invoice info header */}
        <div className="space-y-2 rounded-md border p-3">
          <div className="flex justify-between">
            <Caption className="text-muted-foreground">
              {t('payment.total')}
            </Caption>
            <BodySmall className="font-medium">
              {formatCurrency(totalAmount, currency)}
            </BodySmall>
          </div>
          <div className="flex justify-between">
            <Caption className="text-muted-foreground">
              {t('payment.paid')}
            </Caption>
            <BodySmall>{formatCurrency(amountPaid, currency)}</BodySmall>
          </div>
          <div className="flex justify-between">
            <Caption className="text-muted-foreground">
              {t('payment.remaining')}
            </Caption>
            <BodySmall className="text-destructive font-medium">
              {formatCurrency(remaining, currency)}
            </BodySmall>
          </div>
          {/* Progress bar */}
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {willClose && watchedAmount > 0 && (
            <Caption className="text-success">{t('payment.willClose')}</Caption>
          )}
        </div>

        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.amount')}</FormLabel>
                <Input type="number" step="0.01" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.date')}</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={(d) => field.onChange(d as string)}
                  returnFormat="iso"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.method')}</FormLabel>
                <Select
                  options={paymentMethodOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="referenceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.reference')}</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payment.notes')}</FormLabel>
                <Textarea rows={2} {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={recordPayment.isPending}>
              {t('actions.recordPayment')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
