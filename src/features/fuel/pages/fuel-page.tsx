import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Fuel } from 'lucide-react'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader, EmptyState, CardSkeleton } from '@/shared/components'
import { Button } from '@/shared/ui/button'
import { useFuelTanks } from '../api/use-fuel'
import { FuelTankCard } from '../components/fuel-tank-card'
import { FuelTankForm } from '../components/fuel-tank-form'
import { FuelTransactionForm } from '../components/fuel-transaction-form'
import type { FuelTank } from '../types'

export function FuelPage() {
  const { t } = useTranslation('fuel')
  usePageTitle(t('title'))

  const { data, loading } = useFuelTanks()
  const tanks = data?.fuelTanks ?? []

  const [tankFormOpen, setTankFormOpen] = useState(false)
  const [transactionOpen, setTransactionOpen] = useState(false)
  const [selectedTankId, setSelectedTankId] = useState<number>(0)
  const [transactionType, setTransactionType] = useState<'REFILL' | 'DISPENSE'>('DISPENSE')

  const handleRefill = (tank: FuelTank) => {
    setSelectedTankId(tank.id)
    setTransactionType('REFILL')
    setTransactionOpen(true)
  }

  const handleDispense = (tank: FuelTank) => {
    setSelectedTankId(tank.id)
    setTransactionType('DISPENSE')
    setTransactionOpen(true)
  }

  const showEmpty = !loading && tanks.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        action={
          <Button onClick={() => setTankFormOpen(true)}>
            <Plus className="mr-2 size-4" />{t('addTank')}
          </Button>
        }
      />
      {loading ? (
        <CardSkeleton count={3} />
      ) : showEmpty ? (
        <EmptyState
          icon={Fuel}
          title={t('common:table.noData')}
          description={t("common:actions.addFirst")}
          action={<Button size="sm" onClick={() => setTankFormOpen(true)}><Plus className="mr-2 size-4" />{t('addTank')}</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tanks.map((tank) => (
            <FuelTankCard key={tank.id} tank={tank} onRefill={handleRefill} onDispense={handleDispense} />
          ))}
        </div>
      )}

      <FuelTankForm open={tankFormOpen} onClose={() => setTankFormOpen(false)} />
      {selectedTankId > 0 && (
        <FuelTransactionForm
          open={transactionOpen}
          onClose={() => setTransactionOpen(false)}
          tankId={selectedTankId}
          transactionType={transactionType}
        />
      )}
    </div>
  )
}
