import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Wallet,
  RefreshCw,
  Download,
  Pencil,
  Route,
  MapPin,
  Clock,
  CalendarDays,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
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
import { Badge } from '@/shared/ui/badge'
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
import { Caption, BodySmall, H4 } from '@/shared/ui/typography'
import { formatCurrency } from '@/shared/utils'
import {
  useConfirmPayroll,
  useMarkPayrollPaid,
  useRecalculatePayroll,
  useAdjustPayroll,
  usePayslipDownload,
} from '../api'
import {
  payrollAdjustmentSchema,
  type PayrollAdjustmentFormData,
} from '../schemas'
import { PAYROLL_STATUS_CONFIG } from '../constants'
import type { Payroll } from '../types'
import { AdvanceList } from './advance-list'
import { AdvanceDialog } from './advance-dialog'
import type { DriverAdvance } from '../types'

type PayrollDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  payroll: Payroll | null
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border p-3">
      <Icon className="text-muted-foreground size-4" />
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall className="font-semibold">{value}</BodySmall>
    </div>
  )
}

function EarningsRow({
  label,
  amount,
  bold,
}: {
  label: string
  amount: number | null | undefined
  bold?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 ${bold ? 'border-t font-semibold' : ''}`}
    >
      <Caption className={bold ? 'font-semibold' : ''}>{label}</Caption>
      <BodySmall className={bold ? 'font-semibold' : ''}>
        {formatCurrency(amount ?? 0, 'RSD')}
      </BodySmall>
    </div>
  )
}

export function PayrollDetailSheet({
  open,
  onOpenChange,
  payroll,
}: PayrollDetailSheetProps) {
  const { t } = useTranslation('payroll')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false)
  const [selectedAdvance, setSelectedAdvance] = useState<DriverAdvance | null>(
    null
  )

  const confirmMutation = useConfirmPayroll()
  const markPaidMutation = useMarkPayrollPaid()
  const recalculateMutation = useRecalculatePayroll()
  const adjustMutation = useAdjustPayroll()
  const downloadPayslip = usePayslipDownload()

  const adjustForm = useForm<PayrollAdjustmentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(payrollAdjustmentSchema) as any,
    defaultValues: {
      otherBonusRsd: null,
      otherBonusDescription: null,
      otherDeductionRsd: null,
      otherDeductionDescription: null,
      taxRsd: null,
      socialContributionsRsd: null,
      notes: null,
    },
  })

  if (!payroll) return null

  const driverName =
    `${payroll.driverFirstName ?? ''} ${payroll.driverLastName ?? ''}`.trim()
  const statusConfig =
    PAYROLL_STATUS_CONFIG[
      payroll.status as keyof typeof PAYROLL_STATUS_CONFIG
    ] ?? PAYROLL_STATUS_CONFIG.DRAFT
  const isDraft = payroll.status === 'DRAFT'
  const isConfirmed = payroll.status === 'CONFIRMED'

  // Month range for advances
  const [year, month] = payroll.monthYear.split('-')
  const advFrom = `${year}-${month}-01`
  const lastDay = new Date(Number(year), Number(month), 0).getDate()
  const advTo = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

  const handleConfirm = async () => {
    await confirmMutation.mutateAsync(Number(payroll.id))
    setConfirmOpen(false)
  }

  const handleMarkPaid = async () => {
    await markPaidMutation.mutateAsync(Number(payroll.id))
  }

  const handleRecalculate = async () => {
    await recalculateMutation.mutateAsync(Number(payroll.id))
  }

  const handleDownload = async () => {
    await downloadPayslip(Number(payroll.id))
  }

  const openAdjust = () => {
    adjustForm.reset({
      otherBonusRsd: payroll.otherBonusRsd ?? null,
      otherDeductionRsd: payroll.otherDeductionRsd ?? null,
      otherBonusDescription: null,
      otherDeductionDescription: null,
      taxRsd: payroll.taxRsd ?? null,
      socialContributionsRsd: payroll.socialContributionsRsd ?? null,
      notes: payroll.notes,
    })
    setAdjustOpen(true)
  }

  const onAdjustSubmit = async (data: PayrollAdjustmentFormData) => {
    await adjustMutation.mutateAsync({
      id: Number(payroll.id),
      data: {
        otherBonusRsd: data.otherBonusRsd ?? undefined,
        otherBonusDescription: data.otherBonusDescription ?? undefined,
        otherDeductionRsd: data.otherDeductionRsd ?? undefined,
        otherDeductionDescription: data.otherDeductionDescription ?? undefined,
        taxRsd: data.taxRsd ?? undefined,
        socialContributionsRsd: data.socialContributionsRsd ?? undefined,
        notes: data.notes ?? undefined,
      },
    })
    setAdjustOpen(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader
            actions={
              <div className="flex items-center gap-1.5">
                {isDraft && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={openAdjust}
                    >
                      <Pencil className="mr-1 size-3.5" />
                      {t('actions.adjust')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRecalculate}
                      disabled={recalculateMutation.isPending}
                    >
                      <RefreshCw className="mr-1 size-3.5" />
                      {t('actions.recalculate')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setConfirmOpen(true)}
                    >
                      <CheckCircle2 className="mr-1 size-3.5" />
                      {t('actions.confirm')}
                    </Button>
                  </>
                )}
                {isConfirmed && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleMarkPaid}
                    disabled={markPaidMutation.isPending}
                  >
                    <Wallet className="mr-1 size-3.5" />
                    {t('actions.markPaid')}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="mr-1 size-3.5" />
                  {t('actions.downloadPdf')}
                </Button>
              </div>
            }
          >
            <div className="flex items-center gap-2">
              <SheetTitle>
                {driverName} &mdash; {payroll.monthYear}
              </SheetTitle>
              <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
            </div>
          </SheetHeader>

          <div className="space-y-6 p-4">
            {/* Section 1: Route stats */}
            <SectionDivider title={t('detail.routeStats')} />
            <div className="grid grid-cols-4 gap-3">
              <MetricCard
                icon={Route}
                label={t('detail.totalRoutes')}
                value={payroll.totalRoutes ?? 0}
              />
              <MetricCard
                icon={MapPin}
                label={t('detail.totalKm')}
                value={(payroll.totalKm ?? 0).toLocaleString('sr-RS')}
              />
              <MetricCard
                icon={Clock}
                label={t('detail.drivingHours')}
                value={payroll.totalDrivingHours ?? 0}
              />
              <MetricCard
                icon={CalendarDays}
                label={t('detail.daysOnRoad')}
                value={payroll.daysOnRoad ?? 0}
              />
            </div>

            {/* Section 2: Earnings breakdown */}
            <SectionDivider title={t('detail.earnings')} />
            <div className="space-y-0">
              <EarningsRow
                label={t('detail.baseSalary')}
                amount={payroll.baseSalaryRsd}
              />
              <EarningsRow
                label={t('detail.perDiemDomestic')}
                amount={payroll.perDiemDomesticRsd}
              />
              <EarningsRow
                label={t('detail.perDiemInternational')}
                amount={payroll.perDiemInternationalRsd}
              />
              <EarningsRow
                label={t('detail.overtimeAmount')}
                amount={payroll.overtimeAmountRsd}
              />
              <EarningsRow
                label={t('detail.kmBonus')}
                amount={payroll.kmBonusRsd}
              />
              <EarningsRow
                label={t('detail.routeBonus')}
                amount={payroll.routeBonusRsd}
              />
              <EarningsRow
                label={t('detail.otherBonus')}
                amount={payroll.otherBonusRsd}
              />
              <EarningsRow
                label={t('detail.grossTotal')}
                amount={payroll.grossTotalRsd}
                bold
              />
            </div>

            {/* Section 3: Deductions */}
            <SectionDivider title={t('detail.deductions')} />
            <div className="space-y-0">
              <EarningsRow label={t('detail.tax')} amount={payroll.taxRsd} />
              <EarningsRow
                label={t('detail.socialContributions')}
                amount={payroll.socialContributionsRsd}
              />
              <EarningsRow
                label={t('detail.advances')}
                amount={payroll.advanceDeductionRsd}
              />
              <EarningsRow
                label={t('detail.otherDeduction')}
                amount={payroll.otherDeductionRsd}
              />
              <EarningsRow
                label={t('detail.totalDeductions')}
                amount={payroll.totalDeductionsRsd}
                bold
              />
            </div>

            {/* Section 4: Net salary */}
            <div className="rounded-lg border-2 border-green-500/30 bg-green-50 p-4 text-center dark:bg-green-950/20">
              <Caption className="text-muted-foreground">
                {t('detail.netSalary')}
              </Caption>
              <H4 className="text-green-700 dark:text-green-400">
                {formatCurrency(payroll.netSalaryRsd, 'RSD')}
              </H4>
            </div>

            {/* Section 5: Advances */}
            <SectionDivider title={t('detail.advances')} />
            <AdvanceList
              driverId={Number(payroll.driverId)}
              from={advFrom}
              to={advTo}
              onAddClick={() => {
                setSelectedAdvance(null)
                setAdvanceDialogOpen(true)
              }}
              onAdvanceClick={(adv) => {
                setSelectedAdvance(adv)
                setAdvanceDialogOpen(true)
              }}
            />

            {/* Section 6: Notes */}
            {payroll.notes && (
              <>
                <SectionDivider title={t('detail.notes')} />
                <div className="bg-muted rounded-md p-3">
                  <Caption>{payroll.notes}</Caption>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        title={t('confirm.confirmTitle')}
        description={t('confirm.confirmDescription')}
        variant="default"
        confirmLabel={t('actions.confirm')}
        loading={confirmMutation.isPending}
      />

      {/* Adjustment dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <Form form={adjustForm} onSubmit={onAdjustSubmit}>
            <DialogHeader>
              <DialogTitle>{t('adjustment.title')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={adjustForm.control}
                  name="otherBonusRsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('adjustment.otherBonus')}</FormLabel>
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
                  control={adjustForm.control}
                  name="otherBonusDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('adjustment.otherBonusDescription')}
                      </FormLabel>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={adjustForm.control}
                  name="otherDeductionRsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('adjustment.otherDeduction')}</FormLabel>
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
                  control={adjustForm.control}
                  name="otherDeductionDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('adjustment.otherDeductionDescription')}
                      </FormLabel>
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={adjustForm.control}
                  name="taxRsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('adjustment.tax')}</FormLabel>
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
                  control={adjustForm.control}
                  name="socialContributionsRsd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('adjustment.socialContributions')}
                      </FormLabel>
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
                control={adjustForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('adjustment.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        maxLength={1000}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdjustOpen(false)}
              >
                {t('common:actions.cancel')}
              </Button>
              <Button type="submit" disabled={adjustMutation.isPending}>
                {adjustMutation.isPending
                  ? t('common:app.loading')
                  : t('actions.save')}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Advance dialog */}
      <AdvanceDialog
        open={advanceDialogOpen}
        onOpenChange={setAdvanceDialogOpen}
        driverId={Number(payroll.driverId)}
        advance={selectedAdvance}
      />
    </>
  )
}
