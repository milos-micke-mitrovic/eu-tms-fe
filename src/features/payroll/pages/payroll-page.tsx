import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, addMonths, subMonths } from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Inbox,
  Plus,
  Settings,
} from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { DataTable } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Select } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Skeleton } from '@/shared/ui/skeleton'
import { Caption, BodySmall, H4 } from '@/shared/ui/typography'
import { formatCurrency } from '@/shared/utils'
import { useDrivers } from '@/features/fleet/api/use-drivers'
import {
  usePayrollsByMonth,
  usePayrollSummary,
  useGenerateAllPayrolls,
  useGeneratePayroll,
  useSalaryConfigs,
} from '../api'
import { PAYROLL_STATUS_CONFIG } from '../constants'
import { PayrollDetailSheet } from '../components/payroll-detail-sheet'
import { SalaryConfigSheet } from '../components/salary-config-sheet'
import { AdvanceList } from '../components/advance-list'
import { AdvanceDialog } from '../components/advance-dialog'
import type { Payroll, DriverSalaryConfig, DriverAdvance } from '../types'

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const

export function PayrollPage() {
  const { t } = useTranslation('payroll')
  usePageTitle(t('title'))

  const [activeTab, setActiveTab] = useState('monthly')

  // ── Tab 1: Monthly payroll ──
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const monthYear = format(currentMonth, 'yyyy-MM')

  const { data: payrollsData, loading: payrollsLoading } =
    usePayrollsByMonth(monthYear)
  const { data: summaryData, loading: summaryLoading } =
    usePayrollSummary(monthYear)
  const generateAll = useGenerateAllPayrolls()
  const generateOne = useGeneratePayroll()

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [generateDriverId, setGenerateDriverId] = useState<string>('')

  const payrolls = (payrollsData?.payrollsByMonth ?? []) as Payroll[]
  const summary = summaryData?.payrollSummary ?? null

  const monthName = t(`month.${MONTH_KEYS[currentMonth.getMonth()]}`)
  const yearStr = currentMonth.getFullYear()

  // ── Tab 2: Configuration ──
  const { data: driversData } = useDrivers({ status: 'ACTIVE', size: 100 })
  const allDrivers = driversData?.drivers?.content ?? []
  const driverOptions = allDrivers.map((d) => ({
    value: String(d.id),
    label: `${d.firstName} ${d.lastName}`,
  }))

  const [configSheetOpen, setConfigSheetOpen] = useState(false)
  const [configDriverId, setConfigDriverId] = useState<number>(0)
  const [editingConfig, setEditingConfig] = useState<DriverSalaryConfig | null>(
    null
  )

  // Config list: load config for selected driver (or first driver)
  const [configListDriverId, setConfigListDriverId] = useState<number | null>(
    null
  )
  const activeConfigDriverId =
    configListDriverId ?? (allDrivers[0] ? Number(allDrivers[0].id) : null)
  const { data: configsData } = useSalaryConfigs(activeConfigDriverId)

  // Advances section (config tab)
  const [advDriverId, setAdvDriverId] = useState<string>('')
  const [advFrom, setAdvFrom] = useState(() =>
    format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  )
  const [advTo, setAdvTo] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [advDialogOpen, setAdvDialogOpen] = useState(false)
  const [selectedAdvance, setSelectedAdvance] = useState<DriverAdvance | null>(
    null
  )

  // ── Payroll table columns ──
  const columns = useMemo<ColumnDef<Payroll>[]>(
    () => [
      {
        accessorKey: 'driver',
        header: t('table.driver'),
        cell: ({ row }) => {
          const p = row.original
          return `${p.driverFirstName ?? ''} ${p.driverLastName ?? ''}`.trim()
        },
      },
      {
        accessorKey: 'baseSalaryRsd',
        header: t('table.base'),
        cell: ({ row }) => formatCurrency(row.original.baseSalaryRsd, 'RSD'),
      },
      {
        accessorKey: 'perDiemTotalRsd',
        header: t('table.perDiem'),
        cell: ({ row }) => formatCurrency(row.original.perDiemTotalRsd, 'RSD'),
      },
      {
        accessorKey: 'overtimeAmountRsd',
        header: t('table.overtime'),
        cell: ({ row }) =>
          formatCurrency(row.original.overtimeAmountRsd ?? 0, 'RSD'),
      },
      {
        accessorKey: 'grossTotalRsd',
        header: t('table.gross'),
        cell: ({ row }) => formatCurrency(row.original.grossTotalRsd, 'RSD'),
      },
      {
        accessorKey: 'totalDeductionsRsd',
        header: t('table.deductions'),
        cell: ({ row }) =>
          formatCurrency(row.original.totalDeductionsRsd, 'RSD'),
      },
      {
        accessorKey: 'netSalaryRsd',
        header: t('table.net'),
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.netSalaryRsd, 'RSD')}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const cfg =
            PAYROLL_STATUS_CONFIG[
              row.original.status as keyof typeof PAYROLL_STATUS_CONFIG
            ] ?? PAYROLL_STATUS_CONFIG.DRAFT
          return <Badge color={cfg.color}>{cfg.label}</Badge>
        },
      },
      {
        accessorKey: 'totalRoutes',
        header: t('table.routes'),
        cell: ({ row }) => row.original.totalRoutes ?? 0,
      },
      {
        accessorKey: 'totalKm',
        header: t('table.km'),
        cell: ({ row }) => (row.original.totalKm ?? 0).toLocaleString('sr-RS'),
      },
    ],
    [t]
  )

  const handleRowClick = (payroll: Payroll) => {
    setSelectedPayroll(payroll)
    setDetailOpen(true)
  }

  const handleGenerateAll = () => {
    generateAll.mutate(monthYear)
  }

  const handleGenerateForDriver = () => {
    if (!generateDriverId) return
    generateOne.mutate({
      driverId: Number(generateDriverId),
      month: monthYear,
    })
  }

  const openConfigSheet = (
    driverId: number,
    config?: DriverSalaryConfig | null
  ) => {
    setConfigDriverId(driverId)
    setEditingConfig(config ?? null)
    setConfigSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="monthly">{t('tabs.monthly')}</TabsTrigger>
          <TabsTrigger value="config">{t('tabs.config')}</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Monthly payroll ── */}
        <TabsContent value="monthly" className="space-y-6">
          {/* Month picker */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
              aria-label={t('common:aria.previousMonth')}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <H4 className="min-w-[180px] text-center capitalize">
              {monthName} {yearStr}
            </H4>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
              aria-label={t('common:aria.nextMonth')}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Summary cards */}
          {summaryLoading ? (
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : summary ? (
            <div className="grid grid-cols-5 gap-4">
              <SummaryCard
                label={t('summary.drivers')}
                value={String(summary.driverCount)}
                icon={<Users className="text-muted-foreground size-4" />}
              />
              <SummaryCard
                label={t('summary.gross')}
                value={formatCurrency(summary.totalGrossRsd, 'RSD')}
              />
              <SummaryCard
                label={t('summary.net')}
                value={formatCurrency(summary.totalNetRsd, 'RSD')}
              />
              <SummaryCard
                label={t('summary.perDiem')}
                value={formatCurrency(summary.totalPerDiemRsd, 'RSD')}
              />
              <div className="flex flex-col gap-1 rounded-md border p-3">
                <Caption className="text-muted-foreground">Status</Caption>
                <div className="flex gap-2">
                  <Badge color="muted">
                    {t('summary.draft')}: {summary.payrollsDraft}
                  </Badge>
                  <Badge color="info">
                    {t('summary.confirmed')}: {summary.payrollsConfirmed}
                  </Badge>
                  <Badge color="success">
                    {t('summary.paid')}: {summary.payrollsPaid}
                  </Badge>
                </div>
              </div>
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerateAll}
              disabled={generateAll.isPending}
            >
              {t('actions.generateAll')}
            </Button>
            <div className="flex items-center gap-2">
              <Select
                options={driverOptions}
                value={generateDriverId}
                onChange={setGenerateDriverId}
                placeholder={t('selectDriver')}
                searchable
                className="w-[220px]"
              />
              <Button
                variant="outline"
                onClick={handleGenerateForDriver}
                disabled={!generateDriverId || generateOne.isPending}
              >
                {t('actions.generateForDriver')}
              </Button>
            </div>
          </div>

          {/* Payroll table */}
          <DataTable
            columns={columns}
            data={payrolls}
            loading={payrollsLoading}
            onRowClick={handleRowClick}
            emptyText={t('empty.payrolls')}
            emptyAction={
              <Button variant="outline" size="sm" onClick={handleGenerateAll}>
                {t('empty.payrollsAction')}
              </Button>
            }
          />
        </TabsContent>

        {/* ── TAB 2: Configuration ── */}
        <TabsContent value="config" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Driver salary configs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <BodySmall className="font-semibold">
                  {t('config.driverConfigs')}
                </BodySmall>
              </div>
              <div className="space-y-2">
                {allDrivers.map((driver) => {
                  const dId = Number(driver.id)
                  const isSelected = dId === activeConfigDriverId
                  return (
                    <button
                      key={driver.id}
                      type="button"
                      onClick={() => setConfigListDriverId(dId)}
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <BodySmall>
                        {driver.firstName} {driver.lastName}
                      </BodySmall>
                      <Caption className="text-muted-foreground">
                        {isSelected && configsData && configsData.length > 0
                          ? formatCurrency(configsData[0].baseSalaryRsd, 'RSD')
                          : ''}
                      </Caption>
                    </button>
                  )
                })}
              </div>

              {/* Show selected driver config details */}
              {activeConfigDriverId && (
                <div className="space-y-2 rounded-md border p-3">
                  {configsData && configsData.length > 0 ? (
                    configsData.map((cfg) => (
                      <button
                        key={cfg.id}
                        type="button"
                        onClick={() => openConfigSheet(cfg.driverId, cfg)}
                        className="hover:bg-accent flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors"
                      >
                        <div>
                          <BodySmall className="font-medium">
                            {formatCurrency(cfg.baseSalaryRsd, 'RSD')}
                          </BodySmall>
                          <Caption className="text-muted-foreground">
                            {cfg.validFrom}
                            {cfg.validTo ? ` - ${cfg.validTo}` : ''}
                          </Caption>
                        </div>
                        <Settings className="text-muted-foreground size-4" />
                      </button>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <Caption className="text-muted-foreground">
                        {t('config.notConfigured')}
                      </Caption>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => openConfigSheet(activeConfigDriverId, null)}
                  >
                    <Plus className="mr-1 size-3.5" />
                    {t('actions.addConfig')}
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Advances */}
            <div className="space-y-4">
              <BodySmall className="font-semibold">
                {t('advance.title')}
              </BodySmall>
              <div className="flex items-center gap-2">
                <Select
                  options={driverOptions}
                  value={advDriverId}
                  onChange={setAdvDriverId}
                  placeholder={t('advance.selectDriver')}
                  searchable
                  className="flex-1"
                />
                <DatePicker
                  value={advFrom}
                  onChange={(d) => setAdvFrom((d as string) ?? advFrom)}
                  returnFormat="iso"
                />
                <DatePicker
                  value={advTo}
                  onChange={(d) => setAdvTo((d as string) ?? advTo)}
                  returnFormat="iso"
                />
              </div>
              {advDriverId ? (
                <AdvanceList
                  driverId={Number(advDriverId)}
                  from={advFrom}
                  to={advTo}
                  onAddClick={() => {
                    setSelectedAdvance(null)
                    setAdvDialogOpen(true)
                  }}
                  onAdvanceClick={(adv) => {
                    setSelectedAdvance(adv)
                    setAdvDialogOpen(true)
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-12">
                  <Inbox className="text-muted-foreground size-8" />
                  <Caption className="text-muted-foreground">
                    {t('advance.selectDriver')}
                  </Caption>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail sheet */}
      <PayrollDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        payroll={selectedPayroll}
      />

      {/* Config sheet */}
      <SalaryConfigSheet
        open={configSheetOpen}
        onOpenChange={setConfigSheetOpen}
        driverId={configDriverId}
        config={editingConfig}
      />

      {/* Advance dialog (config tab) */}
      {advDriverId && (
        <AdvanceDialog
          open={advDialogOpen}
          onOpenChange={setAdvDialogOpen}
          driverId={Number(advDriverId)}
          advance={selectedAdvance}
        />
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border p-3">
      <div className="flex items-center gap-2">
        {icon}
        <Caption className="text-muted-foreground">{label}</Caption>
      </div>
      <BodySmall className="font-semibold">{value}</BodySmall>
    </div>
  )
}
