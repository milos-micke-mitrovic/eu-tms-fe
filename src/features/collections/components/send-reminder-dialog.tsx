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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { useSendReminder } from '../api'
import { REMINDER_TYPE_CONFIG, SEND_VIA_OPTIONS } from '../constants'

const reminderSchema = z.object({
  reminderType: z.string().min(1),
  sentVia: z.string().min(1),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  subject: z.string().optional(),
  messageBody: z.string().optional(),
})

type ReminderFormValues = z.infer<typeof reminderSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: number
  invoiceNumber: string
  partnerName: string
  amountDue: number
}

export function SendReminderDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  partnerName,
  amountDue,
}: Props) {
  const { t } = useTranslation('collections')
  const sendReminder = useSendReminder()

  const defaultSubject = t('reminder.defaultSubject', {
    invoiceNumber,
  })
  const defaultBody = t('reminder.defaultBody', {
    partnerName,
    invoiceNumber,
    amountDue: amountDue.toLocaleString('sr-RS'),
  })

  const form = useForm<ReminderFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(reminderSchema) as any,
    defaultValues: {
      reminderType: 'FIRST',
      sentVia: 'EMAIL',
      recipientEmail: '',
      subject: defaultSubject,
      messageBody: defaultBody,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        reminderType: 'FIRST',
        sentVia: 'EMAIL',
        recipientEmail: '',
        subject: defaultSubject,
        messageBody: defaultBody,
      })
    }
  }, [open, form, defaultSubject, defaultBody])

  const reminderTypeOptions = Object.entries(REMINDER_TYPE_CONFIG).map(
    ([value, cfg]) => ({
      value,
      label: t(`reminderType.${cfg.key}`),
    })
  )

  const sendViaOptions = SEND_VIA_OPTIONS.map((v) => ({
    value: v,
    label: t(`sendVia.${v.toLowerCase()}`),
  }))

  const onSubmit = (values: ReminderFormValues) => {
    sendReminder.mutate(
      {
        invoiceId,
        reminderType: values.reminderType,
        sentVia: values.sentVia,
        recipientEmail: values.recipientEmail || undefined,
        subject: values.subject || undefined,
        messageBody: values.messageBody || undefined,
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
          <DialogTitle>{t('reminder.title')}</DialogTitle>
          <DialogDescription>
            {t('reminder.forInvoice', {
              number: invoiceNumber,
              partner: partnerName,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="reminderType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('reminder.type')}</FormLabel>
                <Select
                  options={reminderTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sentVia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('reminder.sentVia')}</FormLabel>
                <Select
                  options={sendViaOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="recipientEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('reminder.email')}</FormLabel>
                <Input type="email" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('reminder.subject')}</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="messageBody"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('reminder.message')}</FormLabel>
                <Textarea rows={5} {...field} />
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
            <Button type="submit" disabled={sendReminder.isPending}>
              {t('actions.sendReminder')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
