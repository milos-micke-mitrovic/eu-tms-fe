import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'

type DriverStatusBadgeProps = {
  status: 'OK' | 'WARNING' | 'VIOLATION'
}

const STATUS_CONFIG: Record<
  string,
  { color?: 'success' | 'warning' | 'destructive' }
> = {
  OK: { color: 'success' },
  WARNING: { color: 'warning' },
  VIOLATION: { color: 'destructive' },
}

export function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  const { t } = useTranslation('tachograph')
  const config = STATUS_CONFIG[status] ?? {}
  const labelMap: Record<string, string> = {
    OK: t('status.ok'),
    WARNING: t('status.warning'),
    VIOLATION: t('status.violation'),
  }
  return <Badge color={config.color}>{labelMap[status] ?? status}</Badge>
}
