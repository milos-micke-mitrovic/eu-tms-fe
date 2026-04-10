import { useTranslation } from 'react-i18next'
import { Fuel } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { cn } from '@/shared/utils'
import type { FuelTank } from '../types'

type FuelTankCardProps = {
  tank: FuelTank
  onRefill: (tank: FuelTank) => void
  onDispense: (tank: FuelTank) => void
}

export function FuelTankCard({ tank, onRefill, onDispense }: FuelTankCardProps) {
  const { t } = useTranslation('fuel')
  const pct = tank.percentFull ?? Math.round((tank.currentLevelLiters / tank.capacityLiters) * 100)
  const isLow = pct < 20
  const isMid = pct >= 20 && pct < 50

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className={cn('rounded-full p-2', isLow ? 'bg-destructive/10' : isMid ? 'bg-yellow-100 dark:bg-yellow-950/20' : 'bg-primary/10')}>
          <Fuel className={cn('size-5', isLow ? 'text-destructive' : isMid ? 'text-yellow-600' : 'text-primary')} />
        </div>
        <div className="flex-1">
          <BodySmall className="font-medium">{tank.name}</BodySmall>
          <Badge variant="outline" className="text-xs">{t(`fleet:vehicles.fuelTypes.${tank.fuelType}`, { defaultValue: tank.fuelType })}</Badge>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between">
          <Caption className="text-muted-foreground">{t('currentLevel')}</Caption>
          <Caption className="font-medium">{Number(tank.currentLevelLiters).toLocaleString('sr-RS')} / {Number(tank.capacityLiters).toLocaleString('sr-RS')} L</Caption>
        </div>
        <div className="bg-muted h-3 overflow-hidden rounded-full">
          <div className={cn('h-full rounded-full transition-all', isLow ? 'bg-destructive' : isMid ? 'bg-yellow-500' : 'bg-primary')} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <Caption className={cn('mt-1', isLow ? 'text-destructive' : 'text-muted-foreground')}>{pct}%</Caption>
      </div>
      {tank.location && <Caption className="text-muted-foreground mt-2">{tank.location}</Caption>}
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => onRefill(tank)}>{t('refill')}</Button>
        <Button size="sm" className="flex-1" onClick={() => onDispense(tank)}>{t('dispense')}</Button>
      </div>
    </div>
  )
}
