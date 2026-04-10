import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'
import type { RouteStatus } from '../types'

const statusVariant: Record<RouteStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  CREATED: 'outline',
  DISPATCHED: 'default',
  IN_TRANSIT: 'secondary',
  COMPLETED: 'default',
  INVOICED: 'secondary',
  PAID: 'default',
  CANCELLED: 'destructive',
}

export function RouteStatusBadge({ status }: { status: RouteStatus }) {
  const { t } = useTranslation('spedition')
  return <Badge variant={statusVariant[status]}>{t(`routes.status.${status}`)}</Badge>
}

export function RouteTypeBadge({ routeType }: { routeType: string }) {
  const { t } = useTranslation('spedition')
  return (
    <Badge variant={routeType === 'INTERNATIONAL' ? 'default' : 'outline'}>
      {routeType === 'INTERNATIONAL' ? t('routes.international') : t('routes.domestic')}
    </Badge>
  )
}
