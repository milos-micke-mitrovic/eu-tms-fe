import { useTranslation } from 'react-i18next'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { Caption } from '@/shared/ui/typography'
import { useDashboard } from '../api/use-dashboard'
import { KpiCards } from '../components/kpi-cards'
import { ExpiringAlerts } from '../components/expiring-alerts'

// PARTIAL: BE Sprint 5 — UI ready, Dashboard GraphQL query skipped until BE implements it
// Currently shows placeholder zeros. Remove `skip: true` in use-dashboard.ts when BE is ready.

export function DashboardPage() {
  const { t } = useTranslation('dashboard')
  usePageTitle(t('title'))

  const { data } = useDashboard()
  const dashboard = data?.dashboard ?? null

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />
      <Caption className="text-muted-foreground">
        {!dashboard ? 'Dashboard podaci ce biti dostupni kada BE implementira Sprint 5.' : ''}
      </Caption>
      <KpiCards data={dashboard} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpiringAlerts documents={dashboard?.expiringDocuments ?? []} />
      </div>
    </div>
  )
}
