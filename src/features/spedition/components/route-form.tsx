import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select } from '@/shared/ui/select'
import { AutocompleteInput } from '@/shared/ui/select/autocomplete-input'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { usePartners } from '@/features/partners/api/use-partners'
import { useVehicles } from '@/features/fleet/api/use-vehicles'
import { useDrivers } from '@/features/fleet/api/use-drivers'
import type { Route, RouteRequest } from '../types'
import { useCreateRoute, useUpdateRoute } from '../api/use-route-mutations'

// PARTIAL: BE Sprint 3 — form ready, mutations will fail until BE implements endpoints

const routeSchema = z.object({
  routeType: z.enum(['DOMESTIC', 'INTERNATIONAL']),
  partnerId: z.coerce.number().positive(),
  vehicleId: z.coerce.number().positive(),
  driverId: z.coerce.number().positive().optional().nullable(),
  departureDate: z.string().optional().nullable(),
  returnDate: z.string().optional().nullable(),
  cargoDescription: z.string().optional().nullable(),
  cargoWeightKg: z.coerce.number().positive().optional().nullable(),
  cargoVolumeM3: z.coerce.number().positive().optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().optional().nullable(),
  distanceKm: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
})

type RouteFormData = z.infer<typeof routeSchema>

type RouteFormProps = {
  open: boolean
  onClose: () => void
  route?: Route | null
}

const defaultValues: RouteFormData = {
  routeType: 'INTERNATIONAL',
  partnerId: 0,
  vehicleId: 0,
  driverId: null,
  departureDate: '',
  returnDate: '',
  cargoDescription: '',
  cargoWeightKg: null,
  cargoVolumeM3: null,
  price: null,
  currency: 'EUR',
  distanceKm: null,
  notes: '',
}

export function RouteForm({ open, onClose, route }: RouteFormProps) {
  const { t } = useTranslation('spedition')
  const isEditing = !!route

  const createMutation = useCreateRoute()
  const updateMutation = useUpdateRoute()
  const isPending = createMutation.isPending || updateMutation.isPending

  // Autocomplete search state
  const [partnerSearch, setPartnerSearch] = useState('')
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [driverSearch, setDriverSearch] = useState('')

  // Query data for autocomplete
  const { data: partnersData, loading: partnersLoading } = usePartners({ search: partnerSearch, size: 10 })
  const { data: vehiclesData, loading: vehiclesLoading } = useVehicles({ search: vehicleSearch, status: 'ACTIVE', size: 10 })
  const { data: driversData, loading: driversLoading } = useDrivers({ search: driverSearch, status: 'ACTIVE', size: 10 })

  const partnerOptions = (partnersData?.partners?.content ?? []).map((p) => ({ value: String(p.id), label: p.name }))
  const vehicleOptions = (vehiclesData?.vehicles?.content ?? []).map((v) => ({ value: String(v.id), label: `${v.regNumber} — ${v.make} ${v.model}` }))
  const driverOptions = (driversData?.drivers?.content ?? []).map((d) => ({ value: String(d.id), label: `${d.firstName} ${d.lastName}` }))

  const form = useForm<RouteFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(routeSchema) as any,
    defaultValues,
  })

  // Initial labels for autocomplete in edit mode
  const [partnerLabel, setPartnerLabel] = useState('')
  const [vehicleLabel, setVehicleLabel] = useState('')
  const [driverLabel, setDriverLabel] = useState('')

  useEffect(() => {
    if (route) {
      form.reset({
        routeType: route.routeType,
        partnerId: route.partner?.id ?? 0,
        vehicleId: route.vehicle?.id ?? 0,
        driverId: route.driver?.id ?? null,
        departureDate: route.departureDate ?? '',
        returnDate: route.returnDate ?? '',
        cargoDescription: route.cargoDescription ?? '',
        cargoWeightKg: route.cargoWeightKg,
        cargoVolumeM3: route.cargoVolumeM3,
        price: route.price,
        currency: route.currency ?? 'EUR',
        distanceKm: route.distanceKm,
        notes: route.notes ?? '',
      })
      setPartnerLabel(route.partner?.name ?? '')
      setVehicleLabel(route.vehicle?.regNumber ?? '')
      setDriverLabel(route.driver ? `${route.driver.firstName} ${route.driver.lastName}` : '')
    } else {
      form.reset(defaultValues)
      setPartnerLabel('')
      setVehicleLabel('')
      setDriverLabel('')
    }
  }, [route, form])

  const onSubmit = async (data: RouteFormData) => {
    const request: RouteRequest = {
      routeType: data.routeType,
      partnerId: data.partnerId,
      vehicleId: data.vehicleId,
      driverId: data.driverId ?? undefined,
      departureDate: data.departureDate || undefined,
      returnDate: data.returnDate || undefined,
      cargoDescription: data.cargoDescription || undefined,
      cargoWeightKg: data.cargoWeightKg ?? undefined,
      cargoVolumeM3: data.cargoVolumeM3 ?? undefined,
      price: data.price ?? undefined,
      currency: data.currency || undefined,
      distanceKm: data.distanceKm ?? undefined,
      notes: data.notes || undefined,
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: route.id, data: request })
    } else {
      await createMutation.mutateAsync(request)
    }
    onClose()
  }

  const handlePartnerSearch = useCallback((q: string) => setPartnerSearch(q), [])
  const handleVehicleSearch = useCallback((q: string) => setVehicleSearch(q), [])
  const handleDriverSearch = useCallback((q: string) => setDriverSearch(q), [])

  const routeTypeOptions = [
    { value: 'DOMESTIC', label: t('routes.domestic') },
    { value: 'INTERNATIONAL', label: t('routes.international') },
  ]

  const currencyOptions = [
    { value: 'EUR', label: 'EUR' },
    { value: 'RSD', label: 'RSD' },
  ]

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? t('common:actions.edit') : t('routes.addNew')}</SheetTitle>
        </SheetHeader>
        <Form form={form} onSubmit={onSubmit} className="space-y-4 p-4">
          <FormField control={form.control} name="routeType" render={({ field }) => (
            <FormItem><FormLabel>{t('routes.routeType')}</FormLabel><Select options={routeTypeOptions} value={field.value} onChange={field.onChange} /><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="partnerId" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('routes.partner')}</FormLabel>
              <AutocompleteInput
                value={String(field.value || '')}
                onChange={(v) => field.onChange(Number(v) || 0)}
                options={partnerOptions}
                onSearchChange={handlePartnerSearch}
                placeholder={t('common:actions.search')}
                loading={partnersLoading}
                initialLabel={partnerLabel}
              />
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="vehicleId" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('routes.vehicle')}</FormLabel>
                <AutocompleteInput
                  value={String(field.value || '')}
                  onChange={(v) => field.onChange(Number(v) || 0)}
                  options={vehicleOptions}
                  onSearchChange={handleVehicleSearch}
                  placeholder={t('common:actions.search')}
                  loading={vehiclesLoading}
                  initialLabel={vehicleLabel}
                />
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="driverId" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('routes.driver')}</FormLabel>
                <AutocompleteInput
                  value={String(field.value ?? '')}
                  onChange={(v) => field.onChange(v ? Number(v) : null)}
                  options={driverOptions}
                  onSearchChange={handleDriverSearch}
                  placeholder={t('common:actions.search')}
                  loading={driversLoading}
                  initialLabel={driverLabel}
                />
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="departureDate" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('routes.departure')}</FormLabel>
                <DatePicker
                  value={field.value ?? undefined}
                  onChange={(d) => field.onChange(d ?? '')}
                  returnFormat="iso"
                  clearable
                />
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="returnDate" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('routes.return')}</FormLabel>
                <DatePicker
                  value={field.value ?? undefined}
                  onChange={(d) => field.onChange(d ?? '')}
                  returnFormat="iso"
                  clearable
                />
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="cargoDescription" render={({ field }) => (
            <FormItem><FormLabel>{t('routes.cargo')}</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField control={form.control} name="cargoWeightKg" render={({ field }) => (
              <FormItem><FormLabel>{t('routes.weight')}</FormLabel><FormControl><Input type="number" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="cargoVolumeM3" render={({ field }) => (
              <FormItem><FormLabel>{t('routes.volume')}</FormLabel><FormControl><Input type="number" step="0.1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="distanceKm" render={({ field }) => (
              <FormItem><FormLabel>{t('routes.distance')}</FormLabel><FormControl><Input type="number" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem><FormLabel>{t('routes.price')}</FormLabel><FormControl><Input type="number" step="0.01" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="currency" render={({ field }) => (
              <FormItem><FormLabel>{t('expenses.currency')}</FormLabel><Select options={currencyOptions} value={field.value ?? 'EUR'} onChange={field.onChange} /><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem><FormLabel>{t('common:actions.edit')}</FormLabel><FormControl><Textarea rows={3} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
            <Button type="submit" disabled={isPending}>{isPending ? t('common:app.loading') : t('common:actions.save')}</Button>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
