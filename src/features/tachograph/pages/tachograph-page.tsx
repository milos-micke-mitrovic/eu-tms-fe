import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { format, startOfWeek, addWeeks, subWeeks, subMonths } from 'date-fns'
import { Plus, ChevronLeft, ChevronRight, Upload, FileDown } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { DataTable } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { Caption, H4 } from '@/shared/ui/typography'
import { formatDate } from '@/shared/utils'
import { useDrivers } from '@/features/fleet/api/use-drivers'
import { useTachographDriverStatuses, useTachographPdfDownload } from '../api'
import { DriverStatusBadge } from '../components/driver-status-badge'
import { WeeklySummaryCard } from '../components/weekly-summary-card'
import { TachographEntrySheet } from '../components/tachograph-entry-sheet'
import { DddUploadDialog } from '../components/ddd-upload-dialog'
import { ComplianceGauge } from '../components/compliance-gauge'
import { TopViolatorsTable } from '../components/top-violators-table'
import { MonthlyDrivingChart } from '../components/monthly-driving-chart'
import { AvgDailyDrivingChart } from '../components/avg-daily-driving-chart'
import type { TachographDriverStatus, TachographEntry } from '../types'

function minutesToH(m: number) {
  return `${Math.floor(m / 60)}h`
}

export function TachographPage() {
  const { t } = useTranslation('tachograph')
  usePageTitle(t('title'))

  const [activeTab, setActiveTab] = useState('drivers')
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dddDialogOpen, setDddDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TachographEntry | null>(null)
  const [defaultDriverId, setDefaultDriverId] = useState<number | undefined>()
  const [defaultDate, setDefaultDate] = useState<string | undefined>()

  // Tab 1 — Driver Overview
  const { data: statusData, loading: statusLoading } =
    useTachographDriverStatuses()
  const drivers = statusData?.tachographDriverStatuses ?? []

  const warningCount = drivers.filter((d) => d.status === 'WARNING').length
  const violationCount = drivers.filter((d) => d.status === 'VIOLATION').length

  // Tab 2 — Weekly View
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null)
  const [weekDate, setWeekDate] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const weekStartStr = format(weekDate, 'yyyy-MM-dd')
  const weekEndStr = format(addWeeks(weekDate, 1), 'yyyy-MM-dd')

  // Tab 3 — Dashboard
  const [dashFrom, setDashFrom] = useState(() =>
    format(subMonths(new Date(), 3), 'yyyy-MM-dd')
  )
  const [dashTo, setDashTo] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  const { data: driversData } = useDrivers({ status: 'ACTIVE', size: 100 })
  const driverOptions = (driversData?.drivers?.content ?? []).map((d) => ({
    value: String(d.id),
    label: `${d.firstName} ${d.lastName}`,
  }))

  const downloadPdf = useTachographPdfDownload()

  const handleNewEntry = () => {
    setEditingEntry(null)
    setDefaultDriverId(undefined)
    setDefaultDate(undefined)
    setSheetOpen(true)
  }

  const handleRowClick = useCallback((driver: TachographDriverStatus) => {
    setSelectedDriverId(Number(driver.driverId))
    setActiveTab('weekly')
  }, [])

  const handleEntryClick = useCallback((entry: TachographEntry) => {
    setEditingEntry(entry)
    setDefaultDriverId(undefined)
    setDefaultDate(undefined)
    setSheetOpen(true)
  }, [])

  const handleAddEntry = useCallback(
    (date: string) => {
      setEditingEntry(null)
      setDefaultDriverId(selectedDriverId ?? undefined)
      setDefaultDate(date)
      setSheetOpen(true)
    },
    [selectedDriverId]
  )

  const handleAddToday = () => {
    if (!selectedDriverId) return
    setEditingEntry(null)
    setDefaultDriverId(selectedDriverId)
    setDefaultDate(format(new Date(), 'yyyy-MM-dd'))
    setSheetOpen(true)
  }

  const columns = useMemo<ColumnDef<TachographDriverStatus, unknown>[]>(
    () => [
      {
        accessorKey: 'driverFirstName',
        header: t('columns.driver'),
        cell: ({ row }) =>
          `${row.original.driverFirstName} ${row.original.driverLastName}`,
      },
      {
        accessorKey: 'status',
        header: t('columns.status'),
        cell: ({ row }) => (
          <DriverStatusBadge
            status={row.original.status as 'OK' | 'WARNING' | 'VIOLATION'}
          />
        ),
      },
      {
        accessorKey: 'currentWeekDrivingPercent',
        header: t('columns.weeklyDriving'),
        cell: ({ row }) => {
          const d = row.original
          const pct = d.currentWeekDrivingPercent
          const color = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#10B981'
          return (
            <div className="flex items-center gap-2">
              <div className="bg-muted h-2 w-20 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <Caption>{minutesToH(d.currentWeekDrivingMinutes)} / 56h</Caption>
            </div>
          )
        },
      },
      {
        accessorKey: 'fortnightDrivingMinutes',
        header: t('columns.fortnightDriving'),
        cell: ({ row }) => (
          <Caption>
            {minutesToH(row.original.fortnightDrivingMinutes)} / 90h
          </Caption>
        ),
      },
      {
        accessorKey: 'openViolationCount',
        header: t('columns.violationCount'),
        cell: ({ row }) => {
          const count = row.original.openViolationCount
          return count > 0 ? (
            <span className="text-destructive font-medium">{count}</span>
          ) : (
            <span className="text-muted-foreground">0</span>
          )
        },
      },
      {
        accessorKey: 'lastEntryDate',
        header: t('columns.lastEntry'),
        cell: ({ row }) => {
          const date = row.original.lastEntryDate
          if (!date) return '—'
          const days = Math.floor(
            (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
          )
          return (
            <span className={days > 3 ? 'text-amber-500' : ''}>
              {formatDate(date)}
            </span>
          )
        },
      },
    ],
    [t]
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('title')}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDddDialogOpen(true)}>
              <Upload className="mr-2 size-4" />
              {t('ddd.uploadButton')}
            </Button>
            <Button onClick={handleNewEntry}>
              <Plus className="mr-2 size-4" />
              {t('entry.addTitle')}
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="drivers">{t('tabs.driverOverview')}</TabsTrigger>
          <TabsTrigger value="weekly">{t('tabs.weeklyView')}</TabsTrigger>
          <TabsTrigger value="dashboard">{t('tabs.dashboard')}</TabsTrigger>
        </TabsList>

        {/* TAB 1 — Driver Overview */}
        <TabsContent value="drivers">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <Caption className="text-muted-foreground">
                  {t('summary.totalDrivers')}
                </Caption>
                <H4>{drivers.length}</H4>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <Caption className="text-muted-foreground">
                  {t('summary.warnings')}
                </Caption>
                <H4 className="text-amber-500">{warningCount}</H4>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <Caption className="text-muted-foreground">
                  {t('summary.violations')}
                </Caption>
                <H4 className="text-destructive">{violationCount}</H4>
              </div>
            </div>
            <DataTable
              columns={columns}
              data={drivers}
              isLoading={statusLoading}
              pagination={false}
              onRowClick={handleRowClick}
              emptyText={t('title')}
            />
          </div>
        </TabsContent>

        {/* TAB 2 — Weekly View */}
        <TabsContent value="weekly">
          <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-64">
                <Caption className="text-muted-foreground mb-1">
                  {t('entry.driver')}
                </Caption>
                <Select
                  options={driverOptions}
                  value={
                    selectedDriverId ? String(selectedDriverId) : undefined
                  }
                  onChange={(v) => setSelectedDriverId(Number(v))}
                  placeholder={t('entry.selectDriver')}
                  searchable
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  onClick={() => setWeekDate(subWeeks(weekDate, 1))}
                  aria-label={t('common:aria.previousWeek')}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <DatePicker
                  value={format(weekDate, 'yyyy-MM-dd')}
                  onChange={(date) => {
                    if (typeof date === 'string' && date) {
                      setWeekDate(
                        startOfWeek(new Date(date), { weekStartsOn: 1 })
                      )
                    }
                  }}
                  returnFormat="iso"
                  clearable={false}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  onClick={() => setWeekDate(addWeeks(weekDate, 1))}
                  aria-label={t('common:aria.nextWeek')}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              {selectedDriverId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadPdf(selectedDriverId, weekStartStr, weekEndStr)
                  }
                >
                  <FileDown className="mr-2 size-4" />
                  {t('report.downloadPdf')}
                </Button>
              )}
            </div>
            {selectedDriverId ? (
              <>
                <WeeklySummaryCard
                  driverId={selectedDriverId}
                  weekStart={weekStartStr}
                  onEntryClick={handleEntryClick}
                  onAddEntry={handleAddEntry}
                />
                <Button variant="outline" onClick={handleAddToday}>
                  <Plus className="mr-2 size-4" />
                  {t('entry.addToday')}
                </Button>
              </>
            ) : (
              <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border text-sm">
                {t('weekly.noDriverSelected')}
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3 — Dashboard */}
        <TabsContent value="dashboard">
          <div className="space-y-6">
            <div className="flex items-end gap-4">
              <div>
                <Caption className="text-muted-foreground mb-1">
                  {t('dashboard.dateRange')}
                </Caption>
                <div className="flex gap-2">
                  <DatePicker
                    value={dashFrom}
                    onChange={(d) => {
                      if (typeof d === 'string') setDashFrom(d)
                    }}
                    returnFormat="iso"
                    clearable={false}
                  />
                  <DatePicker
                    value={dashTo}
                    onChange={(d) => {
                      if (typeof d === 'string') setDashTo(d)
                    }}
                    returnFormat="iso"
                    clearable={false}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <ComplianceGauge from={dashFrom} to={dashTo} />
              <div className="lg:col-span-2">
                <TopViolatorsTable from={dashFrom} to={dashTo} />
              </div>
            </div>
            <MonthlyDrivingChart from={dashFrom} to={dashTo} />
            <AvgDailyDrivingChart from={dashFrom} to={dashTo} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Entry Sheet */}
      <TachographEntrySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        entry={editingEntry}
        defaultDriverId={defaultDriverId}
        defaultDate={defaultDate}
      />

      {/* DDD Upload Dialog */}
      <DddUploadDialog open={dddDialogOpen} onOpenChange={setDddDialogOpen} />
    </div>
  )
}
