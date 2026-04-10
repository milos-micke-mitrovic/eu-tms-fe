import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Select } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Caption } from '@/shared/ui/typography'
import { useVehicles } from '@/features/fleet/api/use-vehicles'
import { useDrivers } from '@/features/fleet/api/use-drivers'
import { useCreateFuelTransaction } from '../api/use-fuel'
import type { FuelTransactionRequest } from '../types'
import { transactionSchema, type TransactionFormData } from '../schemas'

type FuelTransactionFormProps = {
  open: boolean
  onClose: () => void
  tankId: string
  transactionType: 'REFILL' | 'DISPENSE'
}

export function FuelTransactionForm({
  open,
  onClose,
  tankId,
  transactionType,
}: FuelTransactionFormProps) {
  const { t } = useTranslation('fuel')
  const createMutation = useCreateFuelTransaction()
  const isDispense = transactionType === 'DISPENSE'

  const { data: vehiclesData } = useVehicles({ status: 'ACTIVE', size: 100 })
  const { data: driversData } = useDrivers({ status: 'ACTIVE', size: 100 })
  const vehicleOptions = (vehiclesData?.vehicles?.content ?? []).map((v) => ({
    value: String(v.id),
    label: v.regNumber,
  }))
  const driverOptions = (driversData?.drivers?.content ?? []).map((d) => ({
    value: String(d.id),
    label: `${d.firstName} ${d.lastName}`,
  }))

  const form = useForm<TransactionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      liters: 0,
      pricePerLiter: null,
      vehicleId: null,
      driverId: null,
      odometerKm: null,
      transactionDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  })

  const liters = useWatch({ control: form.control, name: 'liters' })
  const pricePerLiter = useWatch({
    control: form.control,
    name: 'pricePerLiter',
  })
  const totalCost = liters && pricePerLiter ? liters * pricePerLiter : null

  const onSubmit = async (data: TransactionFormData) => {
    const request: FuelTransactionRequest = {
      tankId: Number(tankId),
      transactionType,
      liters: data.liters,
      pricePerLiter: data.pricePerLiter ?? undefined,
      vehicleId: data.vehicleId ?? undefined,
      driverId: data.driverId ?? undefined,
      odometerKm: data.odometerKm ?? undefined,
      transactionDate: data.transactionDate,
      notes: data.notes || undefined,
    }
    await createMutation.mutateAsync(request)
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('addTransaction')}
            <Badge variant={isDispense ? 'default' : 'secondary'}>
              {isDispense ? t('dispense') : t('refill')}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="liters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('liters')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pricePerLiter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pricePerLiter')}</FormLabel>
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
          {totalCost != null && (
            <div>
              <Caption className="text-muted-foreground">
                Ukupno:{' '}
                {totalCost.toLocaleString('sr-RS', {
                  minimumFractionDigits: 2,
                })}{' '}
                RSD
              </Caption>
            </div>
          )}
          {isDispense && (
            <>
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('common:fleet.vehicles.title', {
                        defaultValue: 'Vozilo',
                      })}
                    </FormLabel>
                    <Select
                      options={vehicleOptions}
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
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vozač</FormLabel>
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
              <FormField
                control={form.control}
                name="odometerKm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('odometer')}</FormLabel>
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
            </>
          )}
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Datum</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={(d) => field.onChange(d ?? '')}
                  returnFormat="iso"
                  clearable
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common:actions.notes')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common:actions.cancel')}
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? t('common:app.loading')
                : t('common:actions.save')}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
