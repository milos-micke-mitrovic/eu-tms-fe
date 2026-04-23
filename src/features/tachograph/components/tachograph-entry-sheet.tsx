import { useEffect, useCallback, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Trash2, CheckCircle2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
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
import { SectionDivider } from '@/shared/components'
import { Caption } from '@/shared/ui/typography'
import { toast } from 'sonner'
import { useState } from 'react'
import { useDrivers } from '@/features/fleet/api/use-drivers'
import {
  useCreateTachographEntry,
  useUpdateTachographEntry,
  useDeleteTachographEntry,
  useConfirmTachographEntry,
} from '../api'
import { tachographEntrySchema, type TachographEntryFormData } from '../schemas'
import { MINUTES_IN_DAY, ACTIVITY_COLORS } from '../constants'
import type { TachographEntry, TachographEntryRequest } from '../types'

type TachographEntrySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: TachographEntry | null
  defaultDriverId?: number
  defaultDate?: string
}

function minutesToHM(minutes: number) {
  return { h: Math.floor(minutes / 60), m: minutes % 60 }
}

function TimeInput({
  value,
  onChange,
  label,
  color,
  autoFilled,
}: {
  value: number
  onChange: (minutes: number) => void
  label: string
  color: string
  autoFilled?: boolean
}) {
  const { t } = useTranslation('tachograph')
  const { h, m } = minutesToHM(value)
  const percent = Math.round((value / MINUTES_IN_DAY) * 100)

  return (
    <div
      className={`space-y-1 rounded-md border p-3 ${autoFilled ? 'bg-muted/50' : ''}`}
    >
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <Caption className="font-medium">{label}</Caption>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          max={24}
          value={h}
          onChange={(e) => {
            const newH = Math.min(24, Math.max(0, Number(e.target.value) || 0))
            onChange(newH * 60 + m)
          }}
          className="w-16 text-center"
        />
        <Caption>{t('entry.hours')}</Caption>
        <Input
          type="number"
          min={0}
          max={59}
          value={m}
          onChange={(e) => {
            const newM = Math.min(59, Math.max(0, Number(e.target.value) || 0))
            onChange(h * 60 + newM)
          }}
          className="w-16 text-center"
        />
        <Caption>{t('entry.minutes')}</Caption>
      </div>
      <Caption className="text-muted-foreground">{percent}%</Caption>
    </div>
  )
}

function ActivityBar({
  driving,
  rest,
  otherWork,
  availability,
}: {
  driving: number
  rest: number
  otherWork: number
  availability: number
}) {
  const total = driving + rest + otherWork + availability
  if (total === 0) return null
  const pct = (v: number) => `${(v / total) * 100}%`

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full">
      <div
        style={{
          width: pct(driving),
          backgroundColor: ACTIVITY_COLORS.driving,
        }}
      />
      <div
        style={{ width: pct(rest), backgroundColor: ACTIVITY_COLORS.rest }}
      />
      <div
        style={{
          width: pct(otherWork),
          backgroundColor: ACTIVITY_COLORS.otherWork,
        }}
      />
      <div
        style={{
          width: pct(availability),
          backgroundColor: ACTIVITY_COLORS.availability,
        }}
      />
    </div>
  )
}

export function TachographEntrySheet({
  open,
  onOpenChange,
  entry,
  defaultDriverId,
  defaultDate,
}: TachographEntrySheetProps) {
  const { t } = useTranslation('tachograph')
  const isEditing = !!entry

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const autoFilledFieldRef = useRef<string | null>(null)

  const { data: driversData } = useDrivers({ status: 'ACTIVE', size: 100 })
  const createMutation = useCreateTachographEntry()
  const updateMutation = useUpdateTachographEntry()
  const deleteMutation = useDeleteTachographEntry()
  const confirmMutation = useConfirmTachographEntry()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    confirmMutation.isPending

  const form = useForm<TachographEntryFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tachographEntrySchema) as any,
    defaultValues: {
      driverId: defaultDriverId ?? 0,
      entryDate: defaultDate ?? format(new Date(), 'yyyy-MM-dd'),
      drivingMinutes: 0,
      restMinutes: 0,
      otherWorkMinutes: 0,
      availabilityMinutes: 0,
      startOdometerKm: null,
      endOdometerKm: null,
      notes: null,
    },
  })

  useEffect(() => {
    if (!open) return
    if (entry) {
      form.reset({
        driverId: Number(entry.driverId),
        entryDate: entry.entryDate,
        drivingMinutes: entry.drivingMinutes,
        restMinutes: entry.restMinutes,
        otherWorkMinutes: entry.otherWorkMinutes,
        availabilityMinutes: entry.availabilityMinutes,
        startOdometerKm: entry.startOdometerKm,
        endOdometerKm: entry.endOdometerKm,
        notes: entry.notes,
      })
    } else {
      form.reset({
        driverId: defaultDriverId ?? 0,
        entryDate: defaultDate ?? format(new Date(), 'yyyy-MM-dd'),
        drivingMinutes: 0,
        restMinutes: 0,
        otherWorkMinutes: 0,
        availabilityMinutes: 0,
        startOdometerKm: null,
        endOdometerKm: null,
        notes: null,
      })
    }
    autoFilledFieldRef.current = null
  }, [open, entry, defaultDriverId, defaultDate, form])

  const driving = useWatch({ control: form.control, name: 'drivingMinutes' })
  const rest = useWatch({ control: form.control, name: 'restMinutes' })
  const otherWork = useWatch({
    control: form.control,
    name: 'otherWorkMinutes',
  })
  const availability = useWatch({
    control: form.control,
    name: 'availabilityMinutes',
  })
  const startKm = useWatch({ control: form.control, name: 'startOdometerKm' })
  const endKm = useWatch({ control: form.control, name: 'endOdometerKm' })

  const total = driving + rest + otherWork + availability
  const remaining = MINUTES_IN_DAY - total
  const totalHM = minutesToHM(total)
  const isValid24 = total === MINUTES_IN_DAY

  // Auto-calculate availability when other 3 fields change
  const autoCalcAvailability = useCallback(
    (field: string, d: number, r: number, o: number) => {
      if (field === 'availabilityMinutes') return
      const calc = MINUTES_IN_DAY - d - r - o
      if (calc >= 0 && calc <= MINUTES_IN_DAY) {
        form.setValue('availabilityMinutes', calc)
        autoFilledFieldRef.current = 'availabilityMinutes'
      }
    },
    [form]
  )

  const handleActivityChange = (
    field:
      | 'drivingMinutes'
      | 'restMinutes'
      | 'otherWorkMinutes'
      | 'availabilityMinutes',
    value: number
  ) => {
    form.setValue(field, value)
    autoFilledFieldRef.current = null
    const d =
      field === 'drivingMinutes' ? value : form.getValues('drivingMinutes')
    const r = field === 'restMinutes' ? value : form.getValues('restMinutes')
    const o =
      field === 'otherWorkMinutes' ? value : form.getValues('otherWorkMinutes')
    autoCalcAvailability(field, d, r, o)
  }

  const showViolationToasts = (violations: TachographEntry['violations']) => {
    for (const v of violations) {
      if (v.severity === 'VIOLATION') {
        toast.error(v.description)
      } else {
        toast.warning(v.description)
      }
    }
  }

  const onSubmit = async (data: TachographEntryFormData) => {
    const request: TachographEntryRequest = {
      driverId: data.driverId,
      entryDate: data.entryDate,
      drivingMinutes: data.drivingMinutes,
      restMinutes: data.restMinutes,
      otherWorkMinutes: data.otherWorkMinutes,
      availabilityMinutes: data.availabilityMinutes,
      startOdometerKm: data.startOdometerKm ?? undefined,
      endOdometerKm: data.endOdometerKm ?? undefined,
      notes: data.notes ?? undefined,
    }

    if (isEditing) {
      const result = await updateMutation.mutateAsync({
        id: Number(entry.id),
        data: request,
      })
      if (result.violations?.length) showViolationToasts(result.violations)
    } else {
      const result = await createMutation.mutateAsync(request)
      if (result.violations?.length) showViolationToasts(result.violations)
    }
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (entry) {
      await deleteMutation.mutateAsync(Number(entry.id))
      setDeleteConfirmOpen(false)
      onOpenChange(false)
    }
  }

  const handleConfirm = async () => {
    if (entry) {
      await confirmMutation.mutateAsync(Number(entry.id))
      onOpenChange(false)
    }
  }

  const driverOptions = (driversData?.drivers?.content ?? []).map((d) => ({
    value: String(d.id),
    label: `${d.firstName} ${d.lastName}`,
  }))

  const distance =
    startKm != null && endKm != null && endKm > startKm ? endKm - startKm : null

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
                      {t('entry.delete')}
                    </Button>
                  )}
                  {isEditing && entry.status === 'DRAFT' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleConfirm}
                      disabled={confirmMutation.isPending}
                    >
                      <CheckCircle2 className="mr-1 size-3.5" />
                      {t('entry.confirm')}
                    </Button>
                  )}
                  <Button type="submit" size="sm" disabled={isPending}>
                    {isPending ? t('common:app.loading') : t('entry.save')}
                  </Button>
                </div>
              }
            >
              <SheetTitle>
                {isEditing ? t('entry.editTitle') : t('entry.addTitle')}
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {/* Section: Entry info */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('entry.driver')}</FormLabel>
                      <Select
                        options={driverOptions}
                        value={String(field.value)}
                        onChange={(v) => field.onChange(Number(v))}
                        placeholder={t('entry.selectDriver')}
                        searchable
                        disabled={!!defaultDriverId}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('entry.date')}</FormLabel>
                      <DatePicker
                        value={field.value || undefined}
                        onChange={(date) => field.onChange(date ?? '')}
                        returnFormat="iso"
                        maxDate={new Date()}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section: Activities */}
              <SectionDivider title={t('entry.activities')} />
              <div className="grid grid-cols-2 gap-3">
                <TimeInput
                  value={driving}
                  onChange={(v) => handleActivityChange('drivingMinutes', v)}
                  label={t('entry.driving')}
                  color={ACTIVITY_COLORS.driving}
                />
                <TimeInput
                  value={rest}
                  onChange={(v) => handleActivityChange('restMinutes', v)}
                  label={t('entry.rest')}
                  color={ACTIVITY_COLORS.rest}
                />
                <TimeInput
                  value={otherWork}
                  onChange={(v) => handleActivityChange('otherWorkMinutes', v)}
                  label={t('entry.otherWork')}
                  color={ACTIVITY_COLORS.otherWork}
                />
                <TimeInput
                  value={availability}
                  onChange={(v) =>
                    handleActivityChange('availabilityMinutes', v)
                  }
                  label={t('entry.availability')}
                  color={ACTIVITY_COLORS.availability}
                  autoFilled={false}
                />
              </div>

              {/* Activity bar + total */}
              <ActivityBar
                driving={driving}
                rest={rest}
                otherWork={otherWork}
                availability={availability}
              />
              <div className="flex items-center justify-between text-sm">
                <span
                  className={
                    isValid24
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-destructive'
                  }
                >
                  {t('entry.total')}: {totalHM.h}h {totalHM.m}min / 24h 00min
                </span>
                {!isValid24 && (
                  <span className="text-destructive text-xs">
                    {remaining > 0
                      ? `${t('entry.remaining')}: ${remaining} min`
                      : `${t('entry.excess')}: ${Math.abs(remaining)} min`}
                  </span>
                )}
              </div>

              {/* Section: Additional */}
              <SectionDivider title={t('entry.additional')} />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startOdometerKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('entry.startOdometer')}</FormLabel>
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
                  name="endOdometerKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('entry.endOdometer')}</FormLabel>
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
              {distance != null && (
                <Caption className="text-muted-foreground">
                  {t('entry.distance')}: {distance.toLocaleString('sr-RS')} km
                </Caption>
              )}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('entry.notes')}</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        maxLength={500}
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
        title={t('deleteConfirm.title')}
        description={t('deleteConfirm.description')}
        loading={deleteMutation.isPending}
      />
    </>
  )
}
