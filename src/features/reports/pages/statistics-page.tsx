import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/components'
import { usePageTitle } from '@/shared/hooks'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { ProfitabilityTable } from '../components/profitability-table'
import { VehicleProfitabilityChart } from '../components/vehicle-profitability-chart'
import { PartnerProfitabilityChart } from '../components/partner-profitability-chart'
import { CollectionStatsCards } from '../components/collection-stats-cards'

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

      <Tabs defaultValue="profitability">
        <TabsList>
          <TabsTrigger value="profitability">
            {t('statistics.profitability')}
          </TabsTrigger>
          <TabsTrigger value="collection">
            {t('statistics.collection')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profitability">
          <div className="flex flex-col gap-6">
            <ProfitabilityTable from={from} to={to} />

            <div className="grid gap-6 lg:grid-cols-2">
              <VehicleProfitabilityChart from={from} to={to} />
              <PartnerProfitabilityChart from={from} to={to} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collection">
          <CollectionStatsCards from={from} to={to} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
