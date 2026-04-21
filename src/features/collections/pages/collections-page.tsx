import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { useAuth } from '@/features/auth'
import { CollectionsDashboardCards } from '../components/collections-dashboard-cards'
import { AgingChart } from '../components/aging-chart'
import { DebtorsTable } from '../components/debtors-table'
import { OverdueInvoicesTable } from '../components/overdue-invoices-table'
import { CollectionRulesSettings } from '../components/collection-rules-settings'

export function CollectionsPage() {
  const { t } = useTranslation('collections')
  usePageTitle(t('title'))

  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
          <TabsTrigger value="overdue">{t('tabs.overdue')}</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings">{t('tabs.settings')}</TabsTrigger>
          )}
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          <CollectionsDashboardCards />
          <AgingChart />
          <DebtorsTable />
        </TabsContent>

        {/* Tab 2: Overdue invoices */}
        <TabsContent value="overdue" className="space-y-6">
          <OverdueInvoicesTable />
        </TabsContent>

        {/* Tab 3: Settings (ADMIN only) */}
        {isAdmin && (
          <TabsContent value="settings" className="space-y-6">
            <CollectionRulesSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
