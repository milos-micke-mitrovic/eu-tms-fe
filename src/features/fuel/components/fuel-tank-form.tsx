import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { setFormFieldErrors } from '@/shared/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/overlay/dialog'
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
import { useCreateFuelTank } from '../api/use-fuel'
import { tankSchema, type TankFormData } from '../schemas'

type FuelTankFormProps = { open: boolean; onClose: () => void }

export function FuelTankForm({ open, onClose }: FuelTankFormProps) {
  const { t } = useTranslation('fuel')
  const createMutation = useCreateFuelTank()

  const form = useForm<TankFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tankSchema) as any,
    defaultValues: {
      name: '',
      capacityLiters: 0,
      fuelType: 'DIESEL',
      location: '',
    },
  })

  const fuelTypeOptions = [
    { value: 'DIESEL', label: 'Dizel' },
    { value: 'PETROL', label: 'Benzin' },
    { value: 'LPG', label: 'TNG' },
    { value: 'CNG', label: 'KPG' },
  ]

  const onSubmit = async (data: TankFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        capacityLiters: data.capacityLiters,
        fuelType: data.fuelType,
        location: data.location || undefined,
      })
      form.reset()
      onClose()
    } catch (error) {
      setFormFieldErrors(error, form.setError)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <Form form={form} onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{t('addTank')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('tankName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacityLiters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('capacity')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('fuelType')}</FormLabel>
                  <Select
                    options={fuelTypeOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common:actions.location')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? t('common:app.loading')
                : t('common:actions.save')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
