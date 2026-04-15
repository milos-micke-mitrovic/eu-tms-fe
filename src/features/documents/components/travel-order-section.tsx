import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { FileText, Plus, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { Spinner } from '@/shared/ui/spinner'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { SectionDivider } from '@/shared/components'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatDate, formatCurrency } from '@/shared/utils'
import {
  useTravelOrdersByRoute,
  useCreateTravelOrder,
  useUpdateTravelOrder,
  useDeleteTravelOrder,
  downloadTravelOrderPdf,
} from '../api/use-travel-orders'
import type { TravelOrder } from '../types'
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

type EditState = {
  fuelAdvance: string
  perDiemAdvance: string
  tollAdvance: string
  otherAdvance: string
  departureDatetime: string
  returnDatetime: string
  notes: string
}

function orderToEditState(order: TravelOrder): EditState {
  return {
    fuelAdvance: String(order.fuelAdvance ?? 0),
    perDiemAdvance: String(order.perDiemAdvance ?? 0),
    tollAdvance: String(order.tollAdvance ?? 0),
    otherAdvance: String(order.otherAdvance ?? 0),
    departureDatetime: order.departureDatetime
      ? order.departureDatetime.split('T')[0]
      : '',
    returnDatetime: order.returnDatetime
      ? order.returnDatetime.split('T')[0]
      : '',
    notes: order.notes ?? '',
  }
}

export function TravelOrderSection({
  routeId,
  route,
}: TravelOrderSectionProps) {
  const { t } = useTranslation('spedition')
  const queryClient = useQueryClient()
  const { data: orders, isLoading } = useTravelOrdersByRoute(routeId)
  const createMutation = useCreateTravelOrder()
  const updateMutation = useUpdateTravelOrder()
  const deleteMutation = useDeleteTravelOrder()
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)

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

  const startEdit = (order: TravelOrder) => {
    setEditingId(order.id)
    setEditState(orderToEditState(order))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditState(null)
  }

  const saveEdit = async (order: TravelOrder) => {
    if (!editState) return
    await updateMutation.mutateAsync({
      id: order.id,
      data: {
        routeId: order.routeId,
        driverId: order.driverId,
        vehicleId: order.vehicleId,
        departureDatetime: editState.departureDatetime
          ? `${editState.departureDatetime}T08:00:00Z`
          : undefined,
        returnDatetime: editState.returnDatetime
          ? `${editState.returnDatetime}T18:00:00Z`
          : undefined,
        purpose: order.purpose,
        notes: editState.notes || undefined,
        fuelAdvance: parseFloat(editState.fuelAdvance) || 0,
        perDiemAdvance: parseFloat(editState.perDiemAdvance) || 0,
        tollAdvance: parseFloat(editState.tollAdvance) || 0,
        otherAdvance: parseFloat(editState.otherAdvance) || 0,
      },
    })
    queryClient.invalidateQueries({
      queryKey: ['travelOrders', 'byRoute', routeId],
    })
    cancelEdit()
  }

  return (
    <div className="space-y-3">
      {orderList.map((order) => {
        const isEditing = editingId === order.id && editState

        return (
          <div key={order.id} className="space-y-3 rounded-lg border p-4">
            {/* Header */}
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
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => saveEdit(order)}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending
                        ? t('common:app.loading')
                        : t('common:actions.save')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      {t('common:actions.cancel')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => startEdit(order)}
                    >
                      <Pencil className="size-4" />
                    </Button>
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
                  </>
                )}
              </div>
            </div>

            {/* Info / Edit */}
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
                {isEditing ? (
                  <DatePicker
                    value={editState.departureDatetime || undefined}
                    onChange={(d) =>
                      setEditState({
                        ...editState,
                        departureDatetime: typeof d === 'string' ? d : '',
                      })
                    }
                    returnFormat="iso"
                  />
                ) : (
                  <BodySmall>
                    {order.departureDatetime
                      ? formatDate(order.departureDatetime)
                      : '—'}
                  </BodySmall>
                )}
              </div>
              <div>
                <Caption className="text-muted-foreground">
                  {t('routes.return')}
                </Caption>
                {isEditing ? (
                  <DatePicker
                    value={editState.returnDatetime || undefined}
                    onChange={(d) =>
                      setEditState({
                        ...editState,
                        returnDatetime: typeof d === 'string' ? d : '',
                      })
                    }
                    returnFormat="iso"
                  />
                ) : (
                  <BodySmall>
                    {order.returnDatetime
                      ? formatDate(order.returnDatetime)
                      : '—'}
                  </BodySmall>
                )}
              </div>
            </div>

            {/* Advances */}
            {isEditing ? (
              <>
                <SectionDivider title={t('travelOrder.advances')} />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <Caption className="text-muted-foreground">
                      {t('expenses.categories.FUEL', {
                        defaultValue: 'Gorivo',
                      })}
                    </Caption>
                    <Input
                      type="number"
                      value={editState.fuelAdvance}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          fuelAdvance: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Caption className="text-muted-foreground">
                      {t('expenses.categories.PER_DIEM', {
                        defaultValue: 'Dnevnice',
                      })}
                    </Caption>
                    <Input
                      type="number"
                      value={editState.perDiemAdvance}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          perDiemAdvance: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Caption className="text-muted-foreground">
                      {t('expenses.categories.TOLL_DOMESTIC', {
                        defaultValue: 'Putarine',
                      })}
                    </Caption>
                    <Input
                      type="number"
                      value={editState.tollAdvance}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          tollAdvance: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Caption className="text-muted-foreground">
                      {t('travelOrder.otherAdvance', {
                        defaultValue: 'Ostalo',
                      })}
                    </Caption>
                    <Input
                      type="number"
                      value={editState.otherAdvance}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          otherAdvance: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Caption className="text-muted-foreground">
                    {t('common:actions.notes')}
                  </Caption>
                  <Input
                    value={editState.notes}
                    onChange={(e) =>
                      setEditState({ ...editState, notes: e.target.value })
                    }
                  />
                </div>
              </>
            ) : (
              <>
                {(order.fuelAdvance > 0 ||
                  order.perDiemAdvance > 0 ||
                  order.tollAdvance > 0 ||
                  order.otherAdvance > 0) && (
                  <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <div>
                      <Caption className="text-muted-foreground">
                        {t('expenses.categories.FUEL', {
                          defaultValue: 'Gorivo',
                        })}
                      </Caption>
                      <BodySmall className="font-medium">
                        {formatCurrency(order.fuelAdvance, 'RSD')}
                      </BodySmall>
                    </div>
                    <div>
                      <Caption className="text-muted-foreground">
                        {t('expenses.categories.PER_DIEM', {
                          defaultValue: 'Dnevnice',
                        })}
                      </Caption>
                      <BodySmall className="font-medium">
                        {formatCurrency(order.perDiemAdvance, 'RSD')}
                      </BodySmall>
                    </div>
                    <div>
                      <Caption className="text-muted-foreground">
                        {t('expenses.categories.TOLL_DOMESTIC', {
                          defaultValue: 'Putarine',
                        })}
                      </Caption>
                      <BodySmall className="font-medium">
                        {formatCurrency(order.tollAdvance, 'RSD')}
                      </BodySmall>
                    </div>
                    <div>
                      <Caption className="text-muted-foreground">
                        {t('travelOrder.otherAdvance', {
                          defaultValue: 'Ostalo',
                        })}
                      </Caption>
                      <BodySmall className="font-medium">
                        {formatCurrency(order.otherAdvance, 'RSD')}
                      </BodySmall>
                    </div>
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
              </>
            )}
          </div>
        )
      })}

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
