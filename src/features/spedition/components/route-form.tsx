import { useEffect, useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { setFormFieldErrors } from '@/shared/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select } from '@/shared/ui/select'
import { AutocompleteInput } from '@/shared/ui/select/autocomplete-input'
import { DateTimePicker } from '@/shared/ui/date-time/date-time-picker'
import { Plus, Trash2 } from 'lucide-react'
import { SectionDivider } from '@/shared/components'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'

import { usePartners } from '@/features/partners/api/use-partners'
import { useVehicles } from '@/features/fleet/api/use-vehicles'
import { useDrivers } from '@/features/fleet/api/use-drivers'
import { useTrailers } from '@/features/fleet/api/use-trailers'
import { CURRENCIES, COUNTRY_CODES } from '../constants'
import type { RouteListItem, RouteRequest } from '../types'
import { useRouteDetail } from '../api/use-route-detail'
import { useCreateRoute, useUpdateRoute } from '../api/use-route-mutations'
import { routeSchema, type RouteFormData } from '../schemas'

type RouteFormProps = {
  open: boolean
  onClose: () => void
  route?: RouteListItem | null
}

const defaultValues: RouteFormData = {
  routeType: 'INTERNATIONAL',
  partnerId: 0,
  vehicleId: null,
  driverId: null,
  trailerId: null,
  trailerRegNumber: '',
  departureTime: '',
  arrivalTime: '',
  cargoDescription: '',
  cargoType: '',
  cargoWeightKg: null,
  cargoVolumeM3: null,
  price: null,
  currency: 'EUR',
  distanceKm: null,
  notes: '',
  stops: [],
}

export function RouteForm({ open, onClose, route }: RouteFormProps) {
  const { t } = useTranslation('spedition')
  const isEditing = !!route
  // Fetch full route detail for edit mode (list item only has subset of fields)
  const { data: detailData } = useRouteDetail(
    isEditing ? String(route.id) : null
  )
  const fullRoute = detailData?.route
  const createMutation = useCreateRoute()
  const updateMutation = useUpdateRoute()
  const isPending = createMutation.isPending || updateMutation.isPending

  const [partnerSearch, setPartnerSearch] = useState('')
  const { data: partnersData, loading: partnersLoading } = usePartners({
    search: partnerSearch,
    size: 50,
  })
  const { data: vehiclesData } = useVehicles({ status: 'ACTIVE', size: 100 })
  const { data: driversData } = useDrivers({ status: 'ACTIVE', size: 100 })
  const { data: trailersData } = useTrailers({ page: 0, size: 100 })

  const partnerOptions = (partnersData?.partners?.content ?? []).map((p) => ({
    value: String(p.id),
    label: `${p.name}${p.pib ? ` (PIB: ${p.pib})` : ''}`,
  }))
  const vehicleOptions = (vehiclesData?.vehicles?.content ?? []).map((v) => ({
    value: String(v.id),
    label: `${v.regNumber} — ${v.make} ${v.model}`,
  }))
  const driverOptions = (driversData?.drivers?.content ?? []).map((d) => ({
    value: String(d.id),
    label: `${d.firstName} ${d.lastName}`,
  }))
  const trailerOptions = (trailersData?.trailers?.content ?? []).map((tr) => ({
    value: String(tr.id),
    label: tr.regNumber,
  }))
  const currencyOptions = CURRENCIES.map((c) => ({ value: c, label: c }))

  const form = useForm<RouteFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(routeSchema) as any,
    defaultValues,
  })

  const {
    fields: stopFields,
    append: appendStop,
    remove: removeStop,
  } = useFieldArray({
    control: form.control,
    name: 'stops',
  })

  const [partnerLabel, setPartnerLabel] = useState('')

  // Use full route detail when available, fall back to list item
  const editSource = fullRoute ?? route

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- editSource may be list item or detail, different shapes
    const src = editSource as any
    if (src && isEditing) {
      form.reset({
        routeType: src.routeType as 'DOMESTIC' | 'INTERNATIONAL',
        partnerId: Number(src.partnerId ?? src.partner?.id ?? 0),
        vehicleId: src.vehicleId
          ? Number(src.vehicleId)
          : src.vehicle
            ? Number(src.vehicle.id)
            : null,
        driverId: src.driverId
          ? Number(src.driverId)
          : src.driver
            ? Number(src.driver.id)
            : null,
        trailerId: src.trailerId ? Number(src.trailerId) : null,
        trailerRegNumber: src.trailerRegNumber ?? '',
        departureTime: src.departureTime ?? '',
        arrivalTime: src.arrivalTime ?? '',
        cargoDescription: src.cargoDescription ?? '',
        cargoType: src.cargoType ?? '',
        cargoWeightKg: src.cargoWeightKg ?? null,
        cargoVolumeM3: src.cargoVolumeM3 ?? null,
        price: src.price ?? null,
        currency: src.currency ?? 'EUR',
        distanceKm: src.distanceKm ?? null,
        notes: src.notes ?? '',
        stops: (src.stops ?? []).map(
          (s: {
            stopOrder: number
            stopType: string
            address?: string
            city?: string
            countryCode: string
            zipCode?: string
            plannedArrival?: string
            plannedDeparture?: string
            notes?: string
            companyName?: string | null
            contactName?: string | null
            contactPhone?: string | null
          }) => ({
            stopOrder: s.stopOrder,
            stopType: s.stopType,
            address: s.address ?? '',
            city: s.city ?? '',
            countryCode: s.countryCode,
            zipCode: s.zipCode ?? '',
            plannedArrival: s.plannedArrival ?? '',
            plannedDeparture: s.plannedDeparture ?? '',
            notes: s.notes ?? '',
            companyName: s.companyName ?? '',
            contactName: s.contactName ?? '',
            contactPhone: s.contactPhone ?? '',
          })
        ),
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing label with route prop
      setPartnerLabel(src.partner?.name ?? '')
    } else if (!isEditing) {
      form.reset(defaultValues)
      setPartnerLabel('')
    }
  }, [editSource, isEditing, form])

  const onSubmit = async (data: RouteFormData) => {
    const request: RouteRequest = {
      routeType: data.routeType,
      partnerId: data.partnerId || null,
      vehicleId: data.vehicleId ?? null,
      driverId: data.driverId ?? null,
      trailerId: data.trailerId ?? null,
      trailerRegNumber: data.trailerRegNumber || undefined,
      departureTime: data.departureTime
        ? new Date(data.departureTime).toISOString()
        : undefined,
      arrivalTime: data.arrivalTime
        ? new Date(data.arrivalTime).toISOString()
        : undefined,
      cargoDescription: data.cargoDescription,
      cargoType: data.cargoType || undefined,
      cargoWeightKg: data.cargoWeightKg ?? undefined,
      cargoVolumeM3: data.cargoVolumeM3 ?? undefined,
      price: data.price ?? undefined,
      currency: data.currency,
      distanceKm: data.distanceKm ?? undefined,
      notes: data.notes || undefined,
      stops: (data.stops ?? []).map((s) => ({
        stopOrder: s.stopOrder,
        stopType: s.stopType,
        address: s.address || undefined,
        city: s.city || undefined,
        countryCode: s.countryCode,
        zipCode: s.zipCode || undefined,
        plannedArrival: s.plannedArrival
          ? `${s.plannedArrival}T00:00:00Z`
          : undefined,
        plannedDeparture: s.plannedDeparture
          ? `${s.plannedDeparture}T00:00:00Z`
          : undefined,
        notes: s.notes || undefined,
        companyName: s.companyName || undefined,
        contactName: s.contactName || undefined,
        contactPhone: s.contactPhone || undefined,
      })),
    }
    try {
      if (isEditing)
        await updateMutation.mutateAsync({ id: route.id, data: request })
      else await createMutation.mutateAsync(request)
      onClose()
    } catch (error) {
      setFormFieldErrors(error, form.setError)
    }
  }

  const handlePartnerSearch = useCallback(
    (q: string) => setPartnerSearch(q),
    []
  )

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="sm:max-w-xl">
        <Form
          form={form}
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <SheetHeader
            actions={
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? t('common:app.loading') : t('common:actions.save')}
              </Button>
            }
          >
            <SheetTitle>
              {isEditing
                ? `${t('common:actions.edit')} ${route.internalNumber}`
                : t('routes.addNew')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            {/* Section: Osnovno */}
            <div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="routeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('routes.routeType')}</FormLabel>
                      <Select
                        options={[
                          { value: 'DOMESTIC', label: t('routes.domestic') },
                          {
                            value: 'INTERNATIONAL',
                            label: t('routes.international'),
                          },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerId"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel required>{t('routes.partner')}</FormLabel>
                      <AutocompleteInput
                        value={String(field.value || '')}
                        onChange={(v) => field.onChange(Number(v) || 0)}
                        options={partnerOptions}
                        onSearchChange={handlePartnerSearch}
                        placeholder={t('common:actions.search')}
                        loading={partnersLoading}
                        initialLabel={partnerLabel}
                        error={!!fieldState.error}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('routes.vehicle')}</FormLabel>
                        <Select
                          options={vehicleOptions}
                          value={field.value ? String(field.value) : undefined}
                          onChange={(v) => field.onChange(v ? Number(v) : null)}
                          clearable
                          placeholder={t('common:select.placeholder')}
                          searchable
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driverId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('routes.driver')}</FormLabel>
                        <Select
                          options={driverOptions}
                          value={field.value ? String(field.value) : undefined}
                          onChange={(v) => field.onChange(v ? Number(v) : null)}
                          clearable
                          placeholder={t('common:select.placeholder')}
                          searchable
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="trailerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common:actions.trailer')}</FormLabel>
                        <Select
                          options={trailerOptions}
                          value={field.value ? String(field.value) : undefined}
                          onChange={(v) => field.onChange(v ? Number(v) : null)}
                          clearable
                          placeholder={t('common:select.placeholder')}
                          searchable
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trailerRegNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('routes.trailerRegNumber')}</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Section: Roba */}
            <div>
              <SectionDivider title={t('routes.cargo')} />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cargoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('routes.cargo')}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cargoType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('routes.cargoType')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cargoWeightKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('routes.weight')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cargoVolumeM3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('routes.volume')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Section: Transport */}
            <div>
              <SectionDivider title={t('common:actions.transport')} />
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="departureTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('routes.departure')}</FormLabel>
                        <DateTimePicker
                          value={field.value ?? undefined}
                          onChange={(d) =>
                            field.onChange(typeof d === 'string' ? d : '')
                          }
                          returnFormat="iso"
                          clearable
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arrivalTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('routes.arrival')}</FormLabel>
                        <DateTimePicker
                          value={field.value ?? undefined}
                          onChange={(d) =>
                            field.onChange(typeof d === 'string' ? d : '')
                          }
                          returnFormat="iso"
                          clearable
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('routes.price')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('expenses.currency')}</FormLabel>
                        <Select
                          options={currencyOptions}
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="distanceKm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('routes.distance')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common:actions.notes')}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={2}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Stopovi */}
            <div>
              <SectionDivider title={t('stops.title')} />
              <div className="space-y-3">
                {stopFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative space-y-3 rounded-lg border p-3"
                  >
                    <button
                      type="button"
                      className="text-destructive hover:bg-destructive/10 absolute top-2 right-2 rounded-sm p-1"
                      onClick={() => removeStop(index)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`stops.${index}.stopType`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel required>
                              {t('stops.stopType')}
                            </FormLabel>
                            <Select
                              options={[
                                'LOADING',
                                'UNLOADING',
                                'BORDER',
                                'CUSTOMS',
                                'REST',
                                'FUEL',
                                'OTHER',
                              ].map((v) => ({
                                value: v,
                                label: t(`stops.types.${v}`),
                              }))}
                              value={f.value}
                              onChange={f.onChange}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`stops.${index}.countryCode`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel required>{t('stops.country')}</FormLabel>
                            <Select
                              options={COUNTRY_CODES.map((c) => ({
                                value: c.code,
                                label: c.name,
                              }))}
                              value={f.value}
                              onChange={f.onChange}
                              searchable
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`stops.${index}.city`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>{t('stops.city')}</FormLabel>
                            <FormControl>
                              <Input {...f} value={f.value ?? ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`stops.${index}.address`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>{t('stops.address')}</FormLabel>
                            <FormControl>
                              <Input {...f} value={f.value ?? ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`stops.${index}.companyName`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>{t('stops.companyName')}</FormLabel>
                          <FormControl>
                            <Input {...f} value={f.value ?? ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`stops.${index}.contactName`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>{t('stops.contactName')}</FormLabel>
                            <FormControl>
                              <Input {...f} value={f.value ?? ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`stops.${index}.contactPhone`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>{t('stops.contactPhone')}</FormLabel>
                            <FormControl>
                              <Input {...f} value={f.value ?? ''} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    appendStop({
                      stopOrder: stopFields.length + 1,
                      stopType: 'LOADING',
                      address: '',
                      city: '',
                      countryCode: 'RS',
                      zipCode: '',
                      plannedArrival: '',
                      plannedDeparture: '',
                      notes: '',
                      companyName: '',
                      contactName: '',
                      contactPhone: '',
                    })
                  }
                >
                  <Plus className="mr-2 size-4" />
                  {t('stops.addNew')}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
