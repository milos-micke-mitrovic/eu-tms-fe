import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Trash2, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { ConfirmDialog } from '@/shared/ui/overlay/confirm-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Caption } from '@/shared/ui/typography'
import { format } from 'date-fns'
import { useCreateAdvance, useUpdateAdvance, useDeleteAdvance } from '../api'
import { advanceSchema, type AdvanceFormData } from '../schemas'
import { ADVANCE_TYPE_CONFIG } from '../constants'
import type { DriverAdvance } from '../types'

type AdvanceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverId: number
  advance?: DriverAdvance | null
}

export function AdvanceDialog({
  open,
  onOpenChange,
  driverId,
  advance,
}: AdvanceDialogProps) {
  const { t } = useTranslation('payroll')
  const isEditing = !!advance
  const isSettled = advance?.settled === true

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const createMutation = useCreateAdvance()
  const updateMutation = useUpdateAdvance()
  const deleteMutation = useDeleteAdvance()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<AdvanceFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(advanceSchema) as any,
    defaultValues: {
      driverId,
      amountRsd: 0,
      advanceDate: format(new Date(), 'yyyy-MM-dd'),
      advanceType: 'ADVANCE',
      description: null,
    },
  })

  useEffect(() => {
    if (!open) return
    if (advance) {
      form.reset({
        driverId: Number(advance.driverId),
        amountRsd: advance.amountRsd,
        advanceDate: advance.advanceDate,
        advanceType: advance.advanceType as AdvanceFormData['advanceType'],
        description: advance.description,
      })
    } else {
      form.reset({
        driverId,
        amountRsd: 0,
        advanceDate: format(new Date(), 'yyyy-MM-dd'),
        advanceType: 'ADVANCE',
        description: null,
      })
    }
  }, [open, advance, driverId, form])

  const typeOptions = Object.entries(ADVANCE_TYPE_CONFIG).map(
    ([value, cfg]) => ({
      value,
      label: cfg.label,
    })
  )

  const onSubmit = async (data: AdvanceFormData) => {
    if (isSettled) return
    const request = {
      driverId: data.driverId,
      amountRsd: data.amountRsd,
      advanceDate: data.advanceDate,
      advanceType: data.advanceType,
      description: data.description ?? undefined,
    }

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: Number(advance.id),
        data: request,
      })
    } else {
      await createMutation.mutateAsync(request)
    }
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (advance) {
      await deleteMutation.mutateAsync(Number(advance.id))
      setDeleteConfirmOpen(false)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <Form form={form} onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? t('advance.editTitle') : t('advance.newTitle')}
              </DialogTitle>
            </DialogHeader>

            {isSettled && (
              <div className="bg-muted flex items-center gap-2 rounded-md p-3">
                <Info className="text-muted-foreground size-4 shrink-0" />
                <Caption className="text-muted-foreground">
                  {t('advance.settledInfo')}
                </Caption>
              </div>
            )}

            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="advanceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('advance.type')}</FormLabel>
                    <Select
                      options={typeOptions}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSettled}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amountRsd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('advance.amount')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : 0
                          )
                        }
                        disabled={isSettled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="advanceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('advance.date')}</FormLabel>
                    <DatePicker
                      value={field.value || undefined}
                      onChange={(date) => field.onChange(date ?? '')}
                      returnFormat="iso"
                      disabled={isSettled}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('advance.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        maxLength={500}
                        rows={2}
                        disabled={isSettled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              {isEditing && !isSettled && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive mr-auto"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="mr-1 size-3.5" />
                  {t('actions.delete')}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t('common:actions.cancel')}
              </Button>
              {!isSettled && (
                <Button type="submit" disabled={isPending}>
                  {isPending ? t('common:app.loading') : t('actions.save')}
                </Button>
              )}
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title={t('confirm.deleteTitle')}
        description={t('confirm.deleteDescription')}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
