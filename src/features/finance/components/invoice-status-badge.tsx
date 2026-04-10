import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'
import type { InvoiceStatus } from '../types'

type StatusConfig = {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  color?: 'success' | 'warning' | 'destructive' | 'info' | 'muted' | 'default'
}

const STATUS_CONFIG: Record<InvoiceStatus, StatusConfig> = {
  DRAFT: { variant: 'outline' },
  SENT: { variant: 'secondary' },
  PAID: { color: 'success' },
  OVERDUE: { variant: 'destructive' },
  CANCELLED: { variant: 'outline' },
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation('finance')
  const config = STATUS_CONFIG[status] ?? { variant: 'outline' as const }
  return (
    <Badge variant={config.variant} color={config.color}>
      {t(`invoices.statuses.${status}`)}
    </Badge>
  )
}
