import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'
import type { RouteStatus } from '../types'

type BadgeConfig = {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  color?: 'success' | 'warning' | 'destructive' | 'info' | 'muted'
}

const statusConfig: Record<RouteStatus, BadgeConfig> = {
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
  const config = statusConfig[status] ?? { variant: 'outline' as const }
  return (
    <Badge variant={config.variant} color={config.color}>
      {t(`routes.status.${status}`)}
    </Badge>
  )
}

const typeConfig: Record<string, BadgeConfig> = {
  DOMESTIC: { color: 'info' },
  INTERNATIONAL: { color: 'success' },
}

export function RouteTypeBadge({ routeType }: { routeType: string }) {
  const { t } = useTranslation('spedition')
  const config = typeConfig[routeType] ?? { variant: 'outline' as const }
  return (
    <Badge variant={config.variant} color={config.color}>
      {routeType === 'INTERNATIONAL'
        ? t('routes.international')
        : t('routes.domestic')}
    </Badge>
  )
}
