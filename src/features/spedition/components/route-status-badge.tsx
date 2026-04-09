import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/ui/badge'
import type { RouteStatus } from '../types'

const statusVariant: Record<RouteStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  CREATED: 'outline',
  DISPATCHED: 'secondary',
  IN_TRANSIT: 'default',
  COMPLETED: 'default',
  INVOICED: 'secondary',
  PAID: 'default',
  CANCELLED: 'destructive',
}

export function RouteStatusBadge({ status }: { status: RouteStatus }) {
  const { t } = useTranslation('spedition')
  return (
    <Badge variant={statusVariant[status]}>
      {t(`routes.status.${status}`)}
    </Badge>
  )
}
