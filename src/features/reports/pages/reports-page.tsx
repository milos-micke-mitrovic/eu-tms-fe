import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, FileDown } from 'lucide-react'
import { PageHeader } from '@/shared/components'
import { usePageTitle } from '@/shared/hooks'
import { Button } from '@/shared/ui/button'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { Select } from '@/shared/ui/select'
import { useDownloadReport } from '../api/use-reports'
import type { ProfitabilityGroupBy } from '../types'

const currentYear = new Date().getFullYear()
const defaultFrom = `${currentYear}-01-01`
const defaultTo = new Date().toISOString().split('T')[0]

export function ReportsPage() {
  const { t } = useTranslation('reports')
  usePageTitle(t('title'))

  const { download, loading } = useDownloadReport()

  // Expense report state
  const [expenseFrom, setExpenseFrom] = useState<string>(defaultFrom)
  const [expenseTo, setExpenseTo] = useState<string>(defaultTo)

  // Profitability report state
  const [profitFrom, setProfitFrom] = useState<string>(defaultFrom)
  const [profitTo, setProfitTo] = useState<string>(defaultTo)
  const [groupBy, setGroupBy] = useState<ProfitabilityGroupBy>('route')

  // Fleet cost report state
  const [fleetFrom, setFleetFrom] = useState<string>(defaultFrom)
  const [fleetTo, setFleetTo] = useState<string>(defaultTo)

  const groupByOptions = [
    { value: 'route', label: t('profitabilityReport.byRoute') },
    { value: 'vehicle', label: t('profitabilityReport.byVehicle') },
    { value: 'partner', label: t('profitabilityReport.byPartner') },
  ]

  const handleExpenseDownload = (format: 'pdf' | 'xlsx') => {
    const ext = format
    download(
      `/reports/expenses?format=${format}&from=${expenseFrom}&to=${expenseTo}`,
      `expense-report.${ext}`,
      `expense-${format}`
    )
  }

  const handleProfitDownload = () => {
    download(
      `/reports/profitability?format=pdf&from=${profitFrom}&to=${profitTo}&groupBy=${groupBy}`,
      'profitability-report.pdf',
      'profitability'
    )
  }

  const handleFleetDownload = () => {
    download(
      `/reports/fleet-costs?format=xlsx&from=${fleetFrom}&to=${fleetTo}`,
      'fleet-costs.xlsx',
      'fleet'
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expense Report Card */}
        <div className="rounded-lg border p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {t('expenseReport.title')}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('expenseReport.description')}
            </p>
          </div>

          <div className="space-y-3">
            <DatePicker
              label={t('dateFrom')}
              value={expenseFrom}
              onChange={(d) => setExpenseFrom(d as string)}
              returnFormat="iso"
            />
            <DatePicker
              label={t('dateTo')}
              value={expenseTo}
              onChange={(d) => setExpenseTo(d as string)}
              returnFormat="iso"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => handleExpenseDownload('pdf')}
              disabled={loading !== null}
              className="flex-1"
            >
              {loading === 'expense-pdf' ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 size-4" />
              )}
              {loading === 'expense-pdf' ? t('generating') : t('downloadPdf')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExpenseDownload('xlsx')}
              disabled={loading !== null}
              className="flex-1"
            >
              {loading === 'expense-xlsx' ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 size-4" />
              )}
              {loading === 'expense-xlsx'
                ? t('generating')
                : t('downloadExcel')}
            </Button>
          </div>
        </div>

        {/* Profitability Report Card */}
        <div className="rounded-lg border p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {t('profitabilityReport.title')}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('profitabilityReport.description')}
            </p>
          </div>

          <div className="space-y-3">
            <DatePicker
              label={t('dateFrom')}
              value={profitFrom}
              onChange={(d) => setProfitFrom(d as string)}
              returnFormat="iso"
            />
            <DatePicker
              label={t('dateTo')}
              value={profitTo}
              onChange={(d) => setProfitTo(d as string)}
              returnFormat="iso"
            />
            <Select
              label={t('profitabilityReport.groupBy')}
              options={groupByOptions}
              value={groupBy}
              onChange={(v) => setGroupBy(v as ProfitabilityGroupBy)}
            />
          </div>

          <div className="mt-4">
            <Button
              onClick={handleProfitDownload}
              disabled={loading !== null}
              className="w-full"
            >
              {loading === 'profitability' ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 size-4" />
              )}
              {loading === 'profitability' ? t('generating') : t('downloadPdf')}
            </Button>
          </div>
        </div>

        {/* Fleet Cost Report Card */}
        <div className="rounded-lg border p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {t('fleetCostReport.title')}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('fleetCostReport.description')}
            </p>
          </div>

          <div className="space-y-3">
            <DatePicker
              label={t('dateFrom')}
              value={fleetFrom}
              onChange={(d) => setFleetFrom(d as string)}
              returnFormat="iso"
            />
            <DatePicker
              label={t('dateTo')}
              value={fleetTo}
              onChange={(d) => setFleetTo(d as string)}
              returnFormat="iso"
            />
          </div>

          <div className="mt-4">
            <Button
              onClick={handleFleetDownload}
              disabled={loading !== null}
              className="w-full"
            >
              {loading === 'fleet' ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 size-4" />
              )}
              {loading === 'fleet' ? t('generating') : t('downloadExcel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
