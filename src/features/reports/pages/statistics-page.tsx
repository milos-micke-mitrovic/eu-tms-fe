import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components'
import { usePageTitle } from '@/shared/hooks'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
// Existing components
import { ProfitabilityTable } from '../components/profitability-table'
import { PartnerProfitabilityChart } from '../components/partner-profitability-chart'
import { CollectionStatsCards } from '../components/collection-stats-cards'
// New advanced stats components
import { MonthlyPnlChart } from '../components/monthly-pnl-chart'
import { TopRoutesTable } from '../components/top-routes-table'
import { FuelConsumptionTrendChart } from '../components/fuel-consumption-trend-chart'
import { DriverFuelComparisonChart } from '../components/driver-fuel-comparison-chart'
import { VehicleUtilizationChart } from '../components/vehicle-utilization-chart'
import { CostPerKmChart } from '../components/cost-per-km-chart'
import { DriverProductivityTable } from '../components/driver-productivity-table'
import { AgingAnalysisChart } from '../components/aging-analysis-chart'
import { TopDebtorsTable } from '../components/top-debtors-table'
import { RouteCountByPartnerChart } from '../components/route-count-by-partner-chart'

export function StatisticsPage() {
  const { t } = useTranslation('reports')
  usePageTitle(t('statistics.title'))

  const [from, setFrom] = useState('2026-01-01')
  const [to, setTo] = useState('2026-04-11')

  const handleFromChange = (date: Date | string | undefined) => {
    if (typeof date === 'string') setFrom(date)
  }

  const handleToChange = (date: Date | string | undefined) => {
    if (typeof date === 'string') setTo(date)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('statistics.title')} />

      <div className="flex items-end gap-4">
        <DatePicker
          label={t('statistics.dateFrom')}
          value={from}
          onChange={handleFromChange}
          returnFormat="iso"
          clearable={false}
        />
        <DatePicker
          label={t('statistics.dateTo')}
          value={to}
          onChange={handleToChange}
          returnFormat="iso"
          clearable={false}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('stats.overview')}</TabsTrigger>
          <TabsTrigger value="fuel">{t('stats.fuel')}</TabsTrigger>
          <TabsTrigger value="fleet">{t('stats.fleet')}</TabsTrigger>
          <TabsTrigger value="finances">{t('stats.finances')}</TabsTrigger>
          <TabsTrigger value="clients">{t('stats.clients')}</TabsTrigger>
        </TabsList>

        {/* PREGLED */}
        <TabsContent value="overview">
          <div className="flex flex-col gap-6">
            <MonthlyPnlChart from={from} to={to} />
            <TopRoutesTable from={from} to={to} />
          </div>
        </TabsContent>

        {/* GORIVO */}
        <TabsContent value="fuel">
          <div className="flex flex-col gap-6">
            <FuelConsumptionTrendChart from={from} to={to} />
            <DriverFuelComparisonChart from={from} to={to} />
          </div>
        </TabsContent>

        {/* VOZNI PARK */}
        <TabsContent value="fleet">
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <VehicleUtilizationChart from={from} to={to} />
              <CostPerKmChart from={from} to={to} />
            </div>
            <DriverProductivityTable from={from} to={to} />
          </div>
        </TabsContent>

        {/* FINANSIJE */}
        <TabsContent value="finances">
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AgingAnalysisChart />
              <TopDebtorsTable />
            </div>
            <CollectionStatsCards from={from} to={to} />
          </div>
        </TabsContent>

        {/* KLIJENTI */}
        <TabsContent value="clients">
          <div className="flex flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <RouteCountByPartnerChart from={from} to={to} />
              <PartnerProfitabilityChart from={from} to={to} />
            </div>
            <ProfitabilityTable from={from} to={to} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
