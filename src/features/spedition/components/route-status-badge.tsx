import { useTranslation } from 'react-i18next'
import { StatusBadge, type StatusConfig } from '@/shared/components'
import type { RouteStatus } from '../types'

const statusConfig: Record<RouteStatus, StatusConfig> = {
  CREATED: { variant: 'outline' },
  DISPATCHED: { color: 'info' },
  IN_TRANSIT: { color: 'warning' },
  COMPLETED: { color: 'success' },
  INVOICED: { color: 'muted' },
  PAID: { color: 'success' },
  CANCELLED: { color: 'destructive' },
}

export function RouteStatusBadge({ status }: { status: RouteStatus }) {
  const { t } = useTranslation('spedition')
  return (
    <StatusBadge
      status={status}
      config={statusConfig}
      label={t(`routes.status.${status}`)}
    />
  )
}

const typeConfig: Record<string, StatusConfig> = {
  DOMESTIC: { color: 'info' },
  INTERNATIONAL: { color: 'success' },
}

export function RouteTypeBadge({ routeType }: { routeType: string }) {
  const { t } = useTranslation('spedition')
  return (
    <StatusBadge
      status={routeType}
      config={typeConfig}
      label={
        routeType === 'INTERNATIONAL'
          ? t('routes.international')
          : t('routes.domestic')
      }
    />
  )
}
