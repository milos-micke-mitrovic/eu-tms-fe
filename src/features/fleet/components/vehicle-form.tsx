import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { Select } from '@/shared/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import type { VehicleRequest } from '../types'
import { useDrivers } from '../api/use-drivers'
import { useVehicle } from '../api/use-vehicles'
import {
  useCreateVehicle,
  useUpdateVehicle,
} from '../api/use-vehicle-mutations'
import { vehicleSchema, type VehicleFormData } from '../schemas'

type VehicleFormProps = {
  open: boolean
  onClose: () => void
  vehicleId?: string | null
}

const defaultValues: VehicleFormData = {
  regNumber: '',
  make: '',
  model: '',
  year: null,
  vin: null,
  vehicleType: 'TRUCK',
  fuelType: 'DIESEL',
  ownership: 'OWNED',
  cargoCapacityKg: null,
  cargoVolumeM3: null,
  avgConsumptionL100km: null,
  odometerKm: null,
  currentDriverId: null,
}

export function VehicleForm({ open, onClose, vehicleId }: VehicleFormProps) {
  const { t } = useTranslation('fleet')
  const isEditing = !!vehicleId

  const { data: vehicleData } = useVehicle(vehicleId ?? null)
  const vehicle = vehicleData?.vehicle
  const { data: driversData } = useDrivers({ status: 'ACTIVE', size: 100 })
  const createMutation = useCreateVehicle()
  const updateMutation = useUpdateVehicle()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<VehicleFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues,
  })

  useEffect(() => {
    if (vehicle) {
      form.reset({
        regNumber: vehicle.regNumber,
        make: vehicle.make ?? '',
        model: vehicle.model ?? '',
        year: vehicle.year ?? null,
        vin: vehicle.vin ?? null,
        vehicleType: vehicle.vehicleType as VehicleRequest['vehicleType'],
        fuelType: vehicle.fuelType as VehicleRequest['fuelType'],
        ownership:
          (vehicle.ownership as VehicleRequest['ownership']) ?? 'OWNED',
        cargoCapacityKg: vehicle.cargoCapacityKg ?? null,
        cargoVolumeM3: vehicle.cargoVolumeM3 ?? null,
        avgConsumptionL100km: vehicle.avgConsumptionL100km ?? null,
        odometerKm: vehicle.odometerKm ?? null,
        currentDriverId: vehicle.currentDriverId
          ? Number(vehicle.currentDriverId)
          : null,
      })
    } else if (!vehicleId) {
      form.reset(defaultValues)
    }
  }, [vehicle, vehicleId, form])

  const onSubmit = async (data: VehicleFormData) => {
    const request: VehicleRequest = {
      regNumber: data.regNumber,
      make: data.make,
      model: data.model,
      year: data.year ?? undefined,
      vin: data.vin ?? undefined,
      vehicleType: data.vehicleType,
      fuelType: data.fuelType,
      ownership: data.ownership ?? undefined,
      cargoCapacityKg: data.cargoCapacityKg ?? undefined,
      cargoVolumeM3: data.cargoVolumeM3 ?? undefined,
      avgConsumptionL100km: data.avgConsumptionL100km ?? undefined,
      odometerKm: data.odometerKm ?? undefined,
      currentDriverId: data.currentDriverId ?? undefined,
    }

    try {
      if (isEditing && vehicleId) {
        await updateMutation.mutateAsync({ id: vehicleId, data: request })
      } else {
        await createMutation.mutateAsync(request)
      }
      onClose()
    } catch (error) {
      setFormFieldErrors(error, form.setError)
    }
  }

  const vehicleTypeOptions = (
    ['TRUCK', 'TRACTOR', 'TRAILER', 'SEMI_TRAILER'] as const
  ).map((v) => ({ value: v, label: t(`vehicles.vehicleTypes.${v}`) }))

  const fuelTypeOptions = (
    ['DIESEL', 'PETROL', 'LPG', 'CNG', 'ELECTRIC'] as const
  ).map((v) => ({ value: v, label: t(`vehicles.fuelTypes.${v}`) }))

  const ownershipOptions = (['OWNED', 'LEASED', 'RENTED'] as const).map(
    (v) => ({ value: v, label: t(`vehicles.ownershipTypes.${v}`) })
  )

  const driverOptions = (driversData?.drivers?.content ?? []).map((d) => ({
    value: String(d.id),
    label: `${d.firstName} ${d.lastName}`,
  }))

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="sm:max-w-lg">
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
              {isEditing ? t('common:actions.edit') : t('vehicles.addNew')}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <FormField
              control={form.control}
              name="regNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('vehicles.regNumber')}</FormLabel>
                  <FormControl>
                    <Input placeholder="BG 123-AA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('vehicles.make')}</FormLabel>
                    <FormControl>
                      <Input placeholder="Scania" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('vehicles.model')}</FormLabel>
                    <FormControl>
                      <Input placeholder="R450" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.year')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
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
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.vin')}</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('vehicles.type')}</FormLabel>
                    <Select
                      options={vehicleTypeOptions}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('vehicles.fuelType')}</FormLabel>
                    <Select
                      options={fuelTypeOptions}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ownership"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicles.ownership')}</FormLabel>
                  <Select
                    options={ownershipOptions}
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentDriverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vehicles.driver')}</FormLabel>
                  <Select
                    options={driverOptions}
                    value={field.value ? String(field.value) : undefined}
                    onChange={(v) => field.onChange(v ? Number(v) : null)}
                    clearable
                    searchable
                    placeholder={t('common:select.placeholder')}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cargoCapacityKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.capacity')}</FormLabel>
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
                    <FormLabel>{t('vehicles.volume')}</FormLabel>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="avgConsumptionL100km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.consumption')}</FormLabel>
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
              <FormField
                control={form.control}
                name="odometerKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('vehicles.odometer')}</FormLabel>
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
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
