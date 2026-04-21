import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
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
import { SectionDivider } from '@/shared/components'
import {
  useCreateSalaryConfig,
  useUpdateSalaryConfig,
  useDeleteSalaryConfig,
} from '../api'
import { salaryConfigSchema, type SalaryConfigFormData } from '../schemas'
import type { DriverSalaryConfig } from '../types'

type SalaryConfigSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverId: number
  config?: DriverSalaryConfig | null
}

export function SalaryConfigSheet({
  open,
  onOpenChange,
  driverId,
  config,
}: SalaryConfigSheetProps) {
  const { t } = useTranslation('payroll')
  const isEditing = !!config

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const createMutation = useCreateSalaryConfig()
  const updateMutation = useUpdateSalaryConfig()
  const deleteMutation = useDeleteSalaryConfig()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<SalaryConfigFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(salaryConfigSchema) as any,
    defaultValues: {
      driverId,
      baseSalaryRsd: 0,
      hourlyRateRsd: null,
      overtimeRateMultiplier: 1.5,
      perKmRateRsd: null,
      bonusPerRouteRsd: null,
      validFrom: '',
      validTo: null,
      notes: null,
    },
  })

  useEffect(() => {
    if (!open) return
    if (config) {
      form.reset({
        driverId: config.driverId,
        baseSalaryRsd: config.baseSalaryRsd,
        hourlyRateRsd: config.hourlyRateRsd,
        overtimeRateMultiplier: config.overtimeRateMultiplier ?? 1.5,
        perKmRateRsd: config.perKmRateRsd,
        bonusPerRouteRsd: config.bonusPerRouteRsd,
        validFrom: config.validFrom,
        validTo: config.validTo,
        notes: config.notes,
      })
    } else {
      form.reset({
        driverId,
        baseSalaryRsd: 0,
        hourlyRateRsd: null,
        overtimeRateMultiplier: 1.5,
        perKmRateRsd: null,
        bonusPerRouteRsd: null,
        validFrom: '',
        validTo: null,
        notes: null,
      })
    }
  }, [open, config, driverId, form])

  const onSubmit = async (data: SalaryConfigFormData) => {
    const request = {
      driverId: data.driverId,
      baseSalaryRsd: data.baseSalaryRsd,
      hourlyRateRsd: data.hourlyRateRsd ?? undefined,
      overtimeRateMultiplier: data.overtimeRateMultiplier ?? undefined,
      perKmRateRsd: data.perKmRateRsd ?? undefined,
      bonusPerRouteRsd: data.bonusPerRouteRsd ?? undefined,
      validFrom: data.validFrom,
      validTo: data.validTo ?? undefined,
      notes: data.notes ?? undefined,
    }

    if (isEditing) {
      await updateMutation.mutateAsync({ id: config.id, data: request })
    } else {
      await createMutation.mutateAsync(request)
    }
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (config) {
      await deleteMutation.mutateAsync(config.id)
      setDeleteConfirmOpen(false)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <Form
            form={form}
            onSubmit={onSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <SheetHeader
              actions={
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteConfirmOpen(true)}
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      {t('actions.delete')}
                    </Button>
                  )}
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? t('common:app.loading') : t('actions.save')}
                  </Button>
                </div>
              }
            >
              <SheetTitle>
                {isEditing ? t('config.editTitle') : t('config.newTitle')}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Section: Base salary */}
              <SectionDivider title={t('config.sections.baseSalary')} />
              <FormField
                control={form.control}
                name="baseSalaryRsd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('config.baseSalary')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : 0
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourlyRateRsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('config.hourlyRate')}</FormLabel>
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
                  name="overtimeRateMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('config.overtimeMultiplier')}</FormLabel>
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

              {/* Section: Bonuses */}
              <SectionDivider title={t('config.sections.bonuses')} />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="perKmRateRsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('config.perKmRate')}</FormLabel>
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
                  name="bonusPerRouteRsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('config.bonusPerRoute')}</FormLabel>
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

              {/* Section: Validity period */}
              <SectionDivider title={t('config.sections.validity')} />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('config.validFrom')}</FormLabel>
                      <DatePicker
                        value={field.value || undefined}
                        onChange={(date) => field.onChange(date ?? '')}
                        returnFormat="iso"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('config.validTo')}</FormLabel>
                      <DatePicker
                        value={field.value || undefined}
                        onChange={(date) => field.onChange(date ?? null)}
                        returnFormat="iso"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('config.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        maxLength={500}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </SheetContent>
      </Sheet>

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
