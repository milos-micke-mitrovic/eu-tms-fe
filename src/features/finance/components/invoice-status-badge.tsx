import { useTranslation } from 'react-i18next'
import { StatusBadge, type StatusConfig } from '@/shared/components'
import type { InvoiceStatus } from '../types'

const STATUS_CONFIG: Record<InvoiceStatus, StatusConfig> = {
  UNPAID: { color: 'info' },
  PARTIAL: { color: 'warning' },
  PAID: { color: 'success' },
  OVERDUE: { variant: 'destructive' },
  CANCELLED: { variant: 'outline' },
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation('finance')
  return (
    <StatusBadge
      status={status}
      config={STATUS_CONFIG}
      label={t(`invoices.statuses.${status}`)}
    />
  )
}
