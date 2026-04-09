import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Fuel } from 'lucide-react'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader, EmptyState, CardSkeleton } from '@/shared/components'
import { Button } from '@/shared/ui/button'
import { useFuelTanks } from '../api/use-fuel'
import { FuelTankCard } from '../components/fuel-tank-card'
import { FuelTransactionForm } from '../components/fuel-transaction-form'

// PARTIAL: BE Sprint 3 — page ready, REST endpoints not yet in BE

export function FuelPage() {
  const { t } = useTranslation('fuel')
  usePageTitle(t('title'))

  const { data: tanks, isLoading, isError } = useFuelTanks()
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)

  const showEmpty = (!isLoading && (!tanks || tanks.length === 0)) || isError

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        action={
          <Button onClick={() => setTransactionFormOpen(true)}>
            <Plus className="mr-2 size-4" />{t('addTransaction')}
          </Button>
        }
      />
      {isLoading && !isError ? (
        <CardSkeleton count={3} />
      ) : showEmpty ? (
        <EmptyState icon={Fuel} title={t('common:table.noData')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tanks!.map((tank) => (
            <FuelTankCard key={tank.id} tank={tank} />
          ))}
        </div>
      )}
      <FuelTransactionForm
        open={transactionFormOpen}
        onClose={() => setTransactionFormOpen(false)}
        tanks={tanks ?? []}
      />
    </div>
  )
}
