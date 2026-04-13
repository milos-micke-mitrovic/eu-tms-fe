import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Spinner } from '@/shared/ui/spinner'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatDate, formatCurrency } from '@/shared/utils'
import {
  useTravelOrdersByRoute,
  useCreateTravelOrder,
  useDeleteTravelOrder,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expenses?: any[] | null
  [key: string]: unknown
}

function calcAdvances(
  expenses: { category: string; amountRsd?: number | null }[]
) {
  let fuel = 0
  let perDiem = 0
  let toll = 0
  let other = 0
  for (const e of expenses) {
    const amt = e.amountRsd ?? 0
    switch (e.category) {
      case 'FUEL':
        fuel += amt
        break
      case 'PER_DIEM':
        perDiem += amt
        break
      case 'TOLL_DOMESTIC':
      case 'TOLL_INTERNATIONAL':
        toll += amt
        break
      default:
        other += amt
    }
  }
  return {
    fuelAdvance: fuel,
    perDiemAdvance: perDiem,
    tollAdvance: toll,
    otherAdvance: other,
  }
}

type TravelOrderSectionProps = {
  routeId: string
  route: RouteInfo
}

const STATUS_CONFIG: Record<
  string,
  {
    variant?: 'default' | 'secondary' | 'outline' | 'destructive'
    color?: 'success' | 'warning' | 'info' | 'destructive' | 'muted'
  }
> = {
  DRAFT: { variant: 'outline' },
  ISSUED: { color: 'info' },
  COMPLETED: { color: 'success' },
  CANCELLED: { color: 'destructive' },
}

export function TravelOrderSection({
  routeId,
  route,
}: TravelOrderSectionProps) {
  const { t } = useTranslation('spedition')
  const queryClient = useQueryClient()
  const { data: orders, isLoading } = useTravelOrdersByRoute(routeId)
  const createMutation = useCreateTravelOrder()
  const deleteMutation = useDeleteTravelOrder()
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const canCreate = !!route.driverId && !!route.vehicleId

  const handleCreate = async () => {
    if (!route.driverId || !route.vehicleId) return

    const advances = calcAdvances(route.expenses ?? [])

    await createMutation.mutateAsync({
      routeId: Number(routeId),
      driverId: Number(route.driverId),
      vehicleId: Number(route.vehicleId),
      departureDatetime: route.departureDate
        ? `${route.departureDate}T08:00:00Z`
        : undefined,
      returnDatetime: route.returnDate
        ? `${route.returnDate}T18:00:00Z`
        : undefined,
      purpose: 'Transport robe',
      notes: route.notes ?? undefined,
      ...advances,
    })
    queryClient.invalidateQueries({
      queryKey: ['travelOrders', 'byRoute', routeId],
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  const orderList = orders ?? []

  if (orderList.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="bg-muted rounded-full p-3">
          <FileText className="text-muted-foreground size-6" />
        </div>
        <BodySmall className="font-medium">
          {t('travelOrder.noOrder')}
        </BodySmall>
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
              <Badge
                variant={STATUS_CONFIG[order.status]?.variant}
                color={STATUS_CONFIG[order.status]?.color}
              >
                {t(`travelOrder.statuses.${order.status}`, {
                  defaultValue: order.status,
                })}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
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
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive size-8"
                onClick={() => setDeleteTarget(order.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
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
              <BodySmall>
                {order.departureDatetime
                  ? formatDate(order.departureDatetime)
                  : '—'}
              </BodySmall>
            </div>
            <div>
              <Caption className="text-muted-foreground">
                {t('routes.return')}
              </Caption>
              <BodySmall>
                {order.returnDatetime ? formatDate(order.returnDatetime) : '—'}
              </BodySmall>
            </div>
          </div>
          {order.perDiemAdvance != null && (
            <div>
              <Caption className="text-muted-foreground">
                {t('travelOrder.advances')}
              </Caption>
              <BodySmall className="font-medium">
                {formatCurrency(order.perDiemAdvance, 'RSD')}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMutation.mutateAsync(deleteTarget)
            queryClient.invalidateQueries({
              queryKey: ['travelOrders', 'byRoute', routeId],
            })
            setDeleteTarget(null)
          }
        }}
        title={t('common:deleteConfirm.title')}
        description={t('common:deleteConfirm.description')}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
