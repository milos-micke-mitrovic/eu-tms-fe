import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Trash2, Calculator, MapPin, Inbox } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { BodySmall, Caption, H4 } from '@/shared/ui/typography'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import { Select } from '@/shared/ui/select'
import { formatDate, formatCurrency, cn } from '@/shared/utils'
import { TableSkeleton } from '@/shared/components'
import { useRouteDetail } from '../api/use-route-detail'
import { useUpdateRouteStatus } from '../api/use-route-mutations'
import { useDeleteExpense } from '../api/use-expenses'
import { useCalculateAndSavePerDiem } from '@/features/finance/api/use-per-diem'
import { CmrSection } from '@/features/documents/components/cmr-section'
import { TravelOrderSection } from '@/features/documents/components/travel-order-section'
import { RouteStatusBadge, RouteTypeBadge } from './route-status-badge'
import { ExpenseForm } from './expense-form'
import { VALID_NEXT_STATUSES, STOP_TYPE_COLORS } from '../constants'
import type { RouteListItem, RouteStatus, StopType } from '../types'

type RouteDetailSheetProps = {
  open: boolean
  onClose: () => void
  routeId: string | null
  onEdit: (route: RouteListItem) => void
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5">
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall>{value ?? '—'}</BodySmall>
    </div>
  )
}

export function RouteDetailSheet({
  open,
  onClose,
  routeId,
  onEdit,
}: RouteDetailSheetProps) {
  const { t } = useTranslation('spedition')
  const [activeTab, setActiveTab] = useState('info')
  const { data, loading } = useRouteDetail(routeId)
  const route = data?.route
  const statusMutation = useUpdateRouteStatus()
  const deleteExpenseMutation = useDeleteExpense()

  const perDiemMutation = useCalculateAndSavePerDiem()
  const [perDiemConfirmOpen, setPerDiemConfirmOpen] = useState(false)

  type ExpenseItem = NonNullable<typeof route>['expenses'][number]

  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null)
  const [deleteExpenseTarget, setDeleteExpenseTarget] =
    useState<ExpenseItem | null>(null)

  const nextStatuses = route
    ? (VALID_NEXT_STATUSES[route.status as RouteStatus] ?? [])
    : []

  const handleStatusChange = (newStatus: string) => {
    if (route) statusMutation.mutate({ id: route.id, newStatus })
  }

  const confirmDeleteExpense = async () => {
    if (deleteExpenseTarget) {
      await deleteExpenseMutation.mutateAsync(deleteExpenseTarget.id)
      setDeleteExpenseTarget(null)
    }
  }

  const confirmPerDiem = async () => {
    if (route) {
      await perDiemMutation.mutateAsync({
        routeId: Number(route.id),
      })
      setPerDiemConfirmOpen(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent className="overflow-y-auto sm:max-w-2xl">
          {loading ? (
            <div className="p-4">
              <TableSkeleton columns={2} rows={6} />
            </div>
          ) : route ? (
            <>
              <SheetHeader
                actions={
                  <div className="flex items-center gap-2">
                    {nextStatuses.length > 0 && (
                      <Select
                        options={nextStatuses.map((s) => ({
                          value: s,
                          label: t(`routes.status.${s}`),
                        }))}
                        placeholder="Status"
                        onChange={handleStatusChange}
                        className="w-36"
                      />
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onClose()
                        onEdit(route as unknown as RouteListItem)
                      }}
                    >
                      <Pencil className="mr-1 size-3.5" />
                      {t('common:actions.edit')}
                    </Button>
                  </div>
                }
              >
                <div className="flex items-center gap-2">
                  <SheetTitle className="font-mono">
                    {route.internalNumber}
                  </SheetTitle>
                  <RouteStatusBadge status={route.status as RouteStatus} />
                </div>
              </SheetHeader>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-4 px-4"
              >
                <TabsList>
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="stops">
                    Stopovi ({route.stops?.length ?? 0})
                  </TabsTrigger>
                  <TabsTrigger value="expenses">
                    {t('expenses.title')} ({route.expenses?.length ?? 0})
                  </TabsTrigger>
                  <TabsTrigger value="cmr">{t('cmr.title')}</TabsTrigger>
                  <TabsTrigger value="travel-order">
                    {t('travelOrder.title')}
                  </TabsTrigger>
                </TabsList>

                {/* INFO TAB */}
                <TabsContent value="info" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <InfoRow
                        label={t('routes.routeType')}
                        value={<RouteTypeBadge routeType={route.routeType} />}
                      />
                      <InfoRow
                        label={t('routes.partner')}
                        value={route.partner?.name}
                      />
                      <InfoRow label="PIB" value={route.partner?.pib} />
                      <InfoRow
                        label={t('routes.vehicle')}
                        value={
                          route.vehicle
                            ? `${route.vehicle.regNumber} — ${route.vehicle.make} ${route.vehicle.model}`
                            : null
                        }
                      />
                      <InfoRow
                        label={t('routes.driver')}
                        value={
                          route.driver
                            ? `${route.driver.firstName} ${route.driver.lastName}`
                            : null
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <InfoRow
                        label={t('routes.departure')}
                        value={
                          route.departureDate
                            ? formatDate(route.departureDate)
                            : null
                        }
                      />
                      <InfoRow
                        label={t('routes.return')}
                        value={
                          route.returnDate ? formatDate(route.returnDate) : null
                        }
                      />
                      <InfoRow
                        label={t('routes.cargo')}
                        value={route.cargoDescription}
                      />
                      <InfoRow
                        label={t('routes.weight')}
                        value={
                          route.cargoWeightKg != null
                            ? `${route.cargoWeightKg} kg`
                            : null
                        }
                      />
                      <InfoRow
                        label={t('routes.volume')}
                        value={
                          route.cargoVolumeM3 != null
                            ? `${route.cargoVolumeM3} m³`
                            : null
                        }
                      />
                      <InfoRow
                        label={t('routes.distance')}
                        value={
                          route.distanceKm != null
                            ? `${route.distanceKm} km`
                            : null
                        }
                      />
                    </div>
                  </div>

                  {/* Profit card */}
                  {(() => {
                    const hasExpenses =
                      route.totalExpenseRsd != null &&
                      route.totalExpenseRsd !== 0
                    return (
                      <div
                        className={cn(
                          'rounded-lg border p-4',
                          hasExpenses &&
                            route.profit != null &&
                            route.profit > 0
                            ? 'bg-green-50 dark:bg-green-950/20'
                            : hasExpenses &&
                                route.profit != null &&
                                route.profit < 0
                              ? 'bg-red-50 dark:bg-red-950/20'
                              : ''
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <Caption className="text-muted-foreground">
                              {t('routes.price')}
                            </Caption>
                            <BodySmall className="font-medium">
                              {route.price != null
                                ? formatCurrency(
                                    route.price,
                                    route.currency ?? 'EUR'
                                  )
                                : '—'}
                            </BodySmall>
                          </div>
                          <div>
                            <Caption className="text-muted-foreground">
                              {t('expenses.total')}
                            </Caption>
                            <BodySmall className="font-medium">
                              {hasExpenses
                                ? formatCurrency(route.totalExpenseRsd!, 'RSD')
                                : '—'}
                            </BodySmall>
                          </div>
                          <div>
                            <Caption className="text-muted-foreground">
                              {t('expenses.profit')}
                            </Caption>
                            <H4
                              className={cn(
                                hasExpenses &&
                                  route.profit != null &&
                                  route.profit > 0
                                  ? 'text-green-600'
                                  : hasExpenses &&
                                      route.profit != null &&
                                      route.profit < 0
                                    ? 'text-red-600'
                                    : ''
                              )}
                            >
                              {hasExpenses && route.profit != null
                                ? formatCurrency(route.profit, 'RSD')
                                : '—'}
                            </H4>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {route.notes && (
                    <div>
                      <Caption className="text-muted-foreground">
                        {t('common:actions.notes')}
                      </Caption>
                      <BodySmall>{route.notes}</BodySmall>
                    </div>
                  )}
                </TabsContent>

                {/* STOPS TAB */}
                <TabsContent value="stops" className="mt-4 space-y-3">
                  {route.stops?.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12">
                      <div className="bg-muted rounded-full p-3">
                        <MapPin className="text-muted-foreground size-6" />
                      </div>
                      <BodySmall className="font-medium">
                        {t('common:table.noData')}
                      </BodySmall>
                    </div>
                  ) : (
                    [...(route.stops ?? [])]
                      .sort((a, b) => a.stopOrder - b.stopOrder)
                      .map((stop, i) => (
                        <div key={stop.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                'flex size-8 items-center justify-center rounded-full text-xs font-medium',
                                STOP_TYPE_COLORS[stop.stopType as StopType] ??
                                  STOP_TYPE_COLORS.OTHER
                              )}
                            >
                              {stop.stopOrder}
                            </div>
                            {i < (route.stops?.length ?? 0) - 1 && (
                              <div className="bg-border mt-1 w-px flex-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {stop.stopType}
                              </Badge>
                              <BodySmall className="font-medium">
                                {stop.city ?? stop.address}
                              </BodySmall>
                              <Caption className="text-muted-foreground">
                                {stop.countryCode}
                              </Caption>
                            </div>
                            {stop.address && (
                              <Caption className="text-muted-foreground">
                                {stop.address}
                              </Caption>
                            )}
                            {stop.plannedArrival && (
                              <Caption className="text-muted-foreground">
                                Plan:{' '}
                                {formatDate(
                                  stop.plannedArrival,
                                  'dd.MM.yyyy HH:mm'
                                )}
                                {stop.actualArrival && (
                                  <span className="ml-2 text-green-600">
                                    Actual:{' '}
                                    {formatDate(
                                      stop.actualArrival,
                                      'dd.MM.yyyy HH:mm'
                                    )}
                                  </span>
                                )}
                              </Caption>
                            )}
                            {stop.notes && (
                              <Caption className="text-muted-foreground italic">
                                {stop.notes}
                              </Caption>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </TabsContent>

                {/* EXPENSES TAB */}
                <TabsContent value="expenses" className="mt-4 space-y-4">
                  {/* Summary cards */}
                  {(() => {
                    const hasExp =
                      route.totalExpenseRsd != null &&
                      route.totalExpenseRsd !== 0
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border p-3 text-center">
                          <Caption className="text-muted-foreground">
                            {t('expenses.total')}
                          </Caption>
                          <BodySmall className="font-medium">
                            {hasExp
                              ? formatCurrency(route.totalExpenseRsd!, 'RSD')
                              : '—'}
                          </BodySmall>
                        </div>
                        <div className="rounded-lg border p-3 text-center">
                          <Caption className="text-muted-foreground">
                            {t('routes.price')}
                          </Caption>
                          <BodySmall className="font-medium">
                            {route.price != null
                              ? formatCurrency(
                                  route.price,
                                  route.currency ?? 'EUR'
                                )
                              : '—'}
                          </BodySmall>
                        </div>
                        <div
                          className={cn(
                            'rounded-lg border p-3 text-center',
                            hasExp && route.profit != null && route.profit > 0
                              ? 'bg-green-50 dark:bg-green-950/20'
                              : hasExp &&
                                  route.profit != null &&
                                  route.profit < 0
                                ? 'bg-red-50 dark:bg-red-950/20'
                                : ''
                          )}
                        >
                          <Caption className="text-muted-foreground">
                            {t('expenses.profit')}
                          </Caption>
                          <BodySmall
                            className={cn(
                              'font-medium',
                              hasExp && route.profit != null && route.profit > 0
                                ? 'text-green-600'
                                : hasExp &&
                                    route.profit != null &&
                                    route.profit < 0
                                  ? 'text-red-600'
                                  : ''
                            )}
                          >
                            {hasExp && route.profit != null
                              ? formatCurrency(route.profit, 'RSD')
                              : '—'}
                          </BodySmall>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPerDiemConfirmOpen(true)}
                    >
                      <Calculator className="mr-2 size-4" />
                      {t('perDiem.calculate')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingExpense(null)
                        setExpenseFormOpen(true)
                      }}
                    >
                      <Plus className="mr-2 size-4" />
                      {t('expenses.addNew')}
                    </Button>
                  </div>

                  {/* Expense list */}
                  {route.expenses?.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12">
                      <div className="bg-muted rounded-full p-3">
                        <Inbox className="text-muted-foreground size-6" />
                      </div>
                      <BodySmall className="font-medium">
                        {t('common:table.noData')}
                      </BodySmall>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {route.expenses?.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex-1">
                            <BodySmall className="font-medium">
                              {t(`expenses.categories.${exp.category}`)}
                            </BodySmall>
                            <Caption className="text-muted-foreground">
                              {formatCurrency(exp.amount, exp.currency)}
                              {exp.amountRsd != null &&
                                exp.currency !== 'RSD' && (
                                  <span className="ml-2">
                                    ({formatCurrency(exp.amountRsd, 'RSD')})
                                  </span>
                                )}
                              {' · '}
                              {formatDate(exp.expenseDate)}
                              {exp.description && ` · ${exp.description}`}
                            </Caption>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => {
                                setEditingExpense(exp)
                                setExpenseFormOpen(true)
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive size-7"
                              onClick={() => setDeleteExpenseTarget(exp)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* CMR TAB */}
                <TabsContent value="cmr" className="mt-4">
                  <CmrSection routeId={route.id} />
                </TabsContent>

                {/* TRAVEL ORDER TAB */}
                <TabsContent value="travel-order" className="mt-4">
                  <TravelOrderSection routeId={route.id} route={route} />
                </TabsContent>
              </Tabs>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Expense form dialog */}
      {routeId && (
        <ExpenseForm
          open={expenseFormOpen}
          onClose={() => {
            setExpenseFormOpen(false)
            setEditingExpense(null)
          }}
          routeId={routeId}
          expense={editingExpense}
        />
      )}

      {/* Delete expense confirm */}
      <ConfirmDialog
        open={!!deleteExpenseTarget}
        onOpenChange={(isOpen) => !isOpen && setDeleteExpenseTarget(null)}
        onConfirm={confirmDeleteExpense}
        title={t('common:deleteConfirm.title')}
        description={t('common:deleteConfirm.description')}
        loading={deleteExpenseMutation.isPending}
      />

      {/* Per diem confirm */}
      <ConfirmDialog
        open={perDiemConfirmOpen}
        onOpenChange={setPerDiemConfirmOpen}
        onConfirm={confirmPerDiem}
        title={t('perDiem.confirmTitle')}
        description={t('perDiem.confirmDescription')}
        variant="default"
        confirmLabel={t('perDiem.calculate')}
        loading={perDiemMutation.isPending}
      />
    </>
  )
}
