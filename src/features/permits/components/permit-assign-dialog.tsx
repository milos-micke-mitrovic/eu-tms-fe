import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { useVehicles } from '@/features/fleet/api/use-vehicles'
import { useAssignPermit } from '../api/use-permit-mutations'
import { permitAssignSchema, type PermitAssignFormData } from '../schemas'

type PermitAssignDialogProps = {
  permitId: number
  open: boolean
  onClose: () => void
}

export function PermitAssignDialog({
  permitId,
  open,
  onClose,
}: PermitAssignDialogProps) {
  const { t } = useTranslation('permits')
  const assignMutation = useAssignPermit()

  const { data: vehiclesData } = useVehicles({ status: 'ACTIVE', size: 100 })

  const form = useForm<PermitAssignFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(permitAssignSchema) as any,
    defaultValues: { vehicleId: 0, routeId: null },
  })

  const vehicleOptions = (vehiclesData?.vehicles?.content ?? []).map((v) => ({
    value: String(v.id),
    label: `${v.regNumber} — ${v.make ?? ''} ${v.model ?? ''}`.trim(),
  }))

  const onSubmit = async (data: PermitAssignFormData) => {
    await assignMutation.mutateAsync({
      id: permitId,
      data: {
        vehicleId: data.vehicleId,
        routeId: data.routeId ?? undefined,
      },
    })
    form.reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <Form form={form} onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{t('assign')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('vehicle')}</FormLabel>
                  <Select
                    options={vehicleOptions}
                    value={field.value ? String(field.value) : undefined}
                    onChange={(v) => field.onChange(v ? Number(v) : 0)}
                    searchable
                    placeholder={t('vehicle')}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={assignMutation.isPending}>
              {assignMutation.isPending ? t('common:app.loading') : t('assign')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
