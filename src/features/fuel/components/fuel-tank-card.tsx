import { useTranslation } from 'react-i18next'
import { Fuel } from 'lucide-react'
import { BodySmall, Caption } from '@/shared/ui/typography'
import type { FuelTank } from '../types'

type FuelTankCardProps = {
  tank: FuelTank
}

export function FuelTankCard({ tank }: FuelTankCardProps) {
  const { t } = useTranslation('fuel')
  const percentage = Math.round((tank.currentLevelLiters / tank.capacityLiters) * 100)
  const isLow = percentage < 20

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-2 ${isLow ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          <Fuel className={`size-5 ${isLow ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div>
          <BodySmall className="font-medium">{tank.name}</BodySmall>
          <Caption className="text-muted-foreground">{tank.fuelType}</Caption>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between">
          <Caption className="text-muted-foreground">{t('currentLevel')}</Caption>
          <Caption className="font-medium">{tank.currentLevelLiters} / {tank.capacityLiters} L</Caption>
        </div>
        <div className="bg-muted h-3 overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-all ${isLow ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <Caption className={`mt-1 ${isLow ? 'text-destructive' : 'text-muted-foreground'}`}>
          {percentage}%
        </Caption>
      </div>
    </div>
  )
}
