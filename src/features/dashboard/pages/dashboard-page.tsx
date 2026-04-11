import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { BodySmall } from '@/shared/ui/typography'
import { useDashboard } from '../api/use-dashboard'
import { KpiCards } from '../components/kpi-cards'
import { ExpensePieChart } from '../components/expense-pie-chart'
import { ExpenseTrendChart } from '../components/expense-trend-chart'
import { AlertsPanel } from '../components/alerts-panel'
import { RecentRoutesTable } from '../components/recent-routes-table'
import { FleetSummary } from '../components/fleet-summary'

export function DashboardPage() {
  const { t } = useTranslation('dashboard')
  usePageTitle(t('title'))

  const { data, loading, error, refetch } = useDashboard()
  const dashboard = data?.dashboard ?? null

  if (error && !data) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('title')} />
        <div className="flex flex-col items-center gap-4 py-12">
          <BodySmall className="text-destructive">{error.message}</BodySmall>
          <button
            onClick={() => refetch()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            <RefreshCw className="size-4" />
            {t('common:actions.retry', { defaultValue: 'Pokušaj ponovo' })}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      {/* Row 1: KPI Cards */}
      <KpiCards data={dashboard} />

      {/* Row 2: Expense Pie Chart + Alerts Panel */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpensePieChart data={dashboard?.expensesByCategory} />
        <AlertsPanel
          permits={dashboard?.expiringPermits}
          documents={dashboard?.expiringDocuments}
          invoices={dashboard?.overdueInvoices}
          loading={loading && !dashboard}
        />
      </div>

      {/* Row 3: Expense Trend (2/3) + Fleet Summary (1/3) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpenseTrendChart data={dashboard?.expenseTrendMonthly} />
        </div>
        <FleetSummary data={dashboard?.fleetSummary} />
      </div>

      {/* Row 4: Recent Routes */}
      <RecentRoutesTable data={dashboard?.recentRoutes} />
    </div>
  )
}
