import { useTranslation } from 'react-i18next'
import { StatusBadge, type StatusConfig } from '@/shared/components'

type DriverStatusBadgeProps = {
  status: 'OK' | 'WARNING' | 'VIOLATION'
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  OK: { color: 'success' },
  WARNING: { color: 'warning' },
  VIOLATION: { color: 'destructive' },
}

export function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  const { t } = useTranslation('tachograph')
  const labelMap: Record<string, string> = {
    OK: t('status.ok'),
    WARNING: t('status.warning'),
    VIOLATION: t('status.violation'),
  }
  return (
    <StatusBadge
      status={status}
      config={STATUS_CONFIG}
      label={labelMap[status] ?? status}
    />
  )
}
