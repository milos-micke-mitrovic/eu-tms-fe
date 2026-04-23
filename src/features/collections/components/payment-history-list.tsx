import { useTranslation } from 'react-i18next'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { Caption, BodySmall } from '@/shared/ui/typography'
import { formatCurrency, formatDate } from '@/shared/utils'
import { useInvoicePayments, useDeletePayment } from '../api'
import { PAYMENT_METHOD_CONFIG } from '../constants'
import type { InvoicePayment } from '../types'

type Props = {
  invoiceId: string
  onClose: () => void
}

export function PaymentHistoryList({ invoiceId, onClose }: Props) {
  const { t } = useTranslation('collections')
  const { data, loading } = useInvoicePayments(invoiceId)
  const deletePayment = useDeletePayment()

  const payments = [...(data?.invoicePayments ?? [])].sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  ) as InvoicePayment[]

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <BodySmall className="font-semibold">{t('payment.history')}</BodySmall>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onClose}
          aria-label={t('common:aria.closePanel')}
        >
          <X className="size-3.5" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <Caption className="text-muted-foreground">
          {t('payment.noPayments')}
        </Caption>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => {
            const methodCfg = PAYMENT_METHOD_CONFIG[p.paymentMethod]
            return (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <BodySmall className="font-medium">
                      {formatCurrency(p.amount, p.currency)}
                    </BodySmall>
                    <Caption className="text-muted-foreground">
                      {formatDate(p.paymentDate)}
                    </Caption>
                  </div>
                  <Badge color="muted">
                    {methodCfg
                      ? t(`paymentMethod.${methodCfg.key}`)
                      : p.paymentMethod}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {p.referenceNumber && (
                    <Caption className="text-muted-foreground">
                      {p.referenceNumber}
                    </Caption>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive size-7"
                    onClick={() => deletePayment.mutate(Number(p.id))}
                    disabled={deletePayment.isPending}
                    aria-label={t('common:aria.deletePayment')}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
