import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatDate, formatCurrency } from '@/shared/utils'
import {
  useTravelOrdersByRoute,
  useCreateTravelOrder,
  downloadTravelOrderPdf,
} from '../api/use-travel-orders'
type RouteInfo = {
  driverId?: string | null
  vehicleId?: string | null
  driver?: { firstName: string; lastName: string } | null
  vehicle?: { regNumber: string } | null
  departureDate?: string | null
  returnDate?: string | null
  notes?: string | null
}

type TravelOrderSectionProps = {
  routeId: string
  route: RouteInfo
}

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  DRAFT: 'outline',
  APPROVED: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
}

export function TravelOrderSection({
  routeId,
  route,
}: TravelOrderSectionProps) {
  const { t } = useTranslation('spedition')
  const queryClient = useQueryClient()
  const { data: orders, isLoading } = useTravelOrdersByRoute(routeId)
  const createMutation = useCreateTravelOrder()

  const canCreate = !!route.driverId && !!route.vehicleId

  const handleCreate = async () => {
    if (!route.driverId || !route.vehicleId) return

    await createMutation.mutateAsync({
      routeId: Number(routeId),
      driverId: Number(route.driverId),
      vehicleId: Number(route.vehicleId),
      departureDate:
        route.departureDate ?? new Date().toISOString().slice(0, 10),
      returnDate: route.returnDate,
      purpose: 'Transport robe',
      notes: route.notes ?? undefined,
    })
    queryClient.invalidateQueries({
      queryKey: ['travelOrders', 'byRoute', routeId],
    })
  }

  if (isLoading) {
    return (
      <Caption className="text-muted-foreground py-8 text-center">
        {t('common:app.loading')}
      </Caption>
    )
  }

  const orderList = orders ?? []

  if (orderList.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Caption className="text-muted-foreground">
          {t('travelOrder.noOrder')}
        </Caption>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={createMutation.isPending || !canCreate}
        >
          <Plus className="mr-2 size-4" />
          {createMutation.isPending
            ? t('common:app.loading')
            : t('travelOrder.create')}
        </Button>
        {!canCreate && (
          <Caption className="text-destructive">
            {t('routes.driver')} i {t('routes.vehicle')} su obavezni
          </Caption>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orderList.map((order) => (
        <div key={order.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BodySmall className="font-mono font-medium">
                {order.orderNumber}
              </BodySmall>
              <Badge variant={STATUS_VARIANT[order.status] ?? 'outline'}>
                {order.status}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadTravelOrderPdf(order.id, order.orderNumber)
              }
            >
              <FileText className="mr-1 size-4" />
              {t('travelOrder.download')}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <Caption className="text-muted-foreground">
                {t('routes.driver')}
              </Caption>
              <BodySmall>{order.driverName}</BodySmall>
            </div>
            <div>
              <Caption className="text-muted-foreground">
                {t('routes.vehicle')}
              </Caption>
              <BodySmall>{order.vehicleRegNumber}</BodySmall>
            </div>
            <div>
              <Caption className="text-muted-foreground">
                {t('routes.departure')}
              </Caption>
              <BodySmall>{formatDate(order.departureDate)}</BodySmall>
            </div>
            <div>
              <Caption className="text-muted-foreground">
                {t('routes.return')}
              </Caption>
              <BodySmall>
                {order.returnDate ? formatDate(order.returnDate) : '—'}
              </BodySmall>
            </div>
          </div>
          {order.perDiemTotalRsd != null && (
            <div>
              <Caption className="text-muted-foreground">
                {t('travelOrder.advances')}
              </Caption>
              <BodySmall className="font-medium">
                {formatCurrency(order.perDiemTotalRsd, 'RSD')}
              </BodySmall>
            </div>
          )}
          {order.notes && (
            <div>
              <Caption className="text-muted-foreground">
                {t('common:actions.notes')}
              </Caption>
              <BodySmall>{order.notes}</BodySmall>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
