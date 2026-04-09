import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { useCreateFuelTransaction } from '../api/use-fuel'
import type { FuelTank, FuelTransactionRequest } from '../types'

const transactionSchema = z.object({
  tankId: z.coerce.number().positive(),
  type: z.enum(['REFILL', 'DISPENSE']),
  liters: z.coerce.number().positive(),
  pricePerLiter: z.coerce.number().positive().optional().nullable(),
  vehicleId: z.coerce.number().positive().optional().nullable(),
  odometerKm: z.coerce.number().min(0).optional().nullable(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

type FuelTransactionFormProps = {
  open: boolean
  onClose: () => void
  tanks: FuelTank[]
}

export function FuelTransactionForm({ open, onClose, tanks }: FuelTransactionFormProps) {
  const { t } = useTranslation('fuel')
  const createMutation = useCreateFuelTransaction()

  const form = useForm<TransactionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: { tankId: 0, type: 'DISPENSE', liters: 0, pricePerLiter: null, vehicleId: null, odometerKm: null },
  })

  const onSubmit = async (data: TransactionFormData) => {
    const request: FuelTransactionRequest = {
      tankId: data.tankId,
      type: data.type,
      liters: data.liters,
      pricePerLiter: data.pricePerLiter ?? undefined,
      vehicleId: data.vehicleId ?? undefined,
      odometerKm: data.odometerKm ?? undefined,
    }
    await createMutation.mutateAsync(request)
    form.reset()
    onClose()
  }

  const tankOptions = tanks.map((tank) => ({ value: String(tank.id), label: tank.name }))
  const typeOptions = [
    { value: 'REFILL', label: t('refill') },
    { value: 'DISPENSE', label: t('dispense') },
  ]

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader><SheetTitle>{t('addTransaction')}</SheetTitle></SheetHeader>
        <Form form={form} onSubmit={onSubmit} className="space-y-4 p-4">
          <FormField control={form.control} name="tankId" render={({ field }) => (
            <FormItem><FormLabel>{t('tankName')}</FormLabel><Select options={tankOptions} value={String(field.value)} onChange={(v) => field.onChange(Number(v))} /><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem><FormLabel>{t('common:actions.edit')}</FormLabel><Select options={typeOptions} value={field.value} onChange={field.onChange} /><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="liters" render={({ field }) => (
            <FormItem><FormLabel>{t('liters')}</FormLabel><FormControl><Input type="number" step="0.1" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="pricePerLiter" render={({ field }) => (
            <FormItem><FormLabel>{t('pricePerLiter')}</FormLabel><FormControl><Input type="number" step="0.01" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="odometerKm" render={({ field }) => (
            <FormItem><FormLabel>{t('odometer')}</FormLabel><FormControl><Input type="number" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
            <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? t('common:app.loading') : t('common:actions.save')}</Button>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
