import { useTranslation } from 'react-i18next'
import { differenceInDays } from 'date-fns'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatDate } from '@/shared/utils'
import { useVehicle } from '../api/use-vehicles'
import type { VehicleDocument } from '../types'

type VehicleDetailSheetProps = {
  vehicleId: number | null
  open: boolean
  onClose: () => void
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between py-1.5">
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall>{value ?? '—'}</BodySmall>
    </div>
  )
}

function DocumentExpiryBadge({ expirationDate }: { expirationDate: string | null }) {
  if (!expirationDate) return null
  const days = differenceInDays(new Date(expirationDate), new Date())
  if (days < 0) return <Badge variant="destructive">Isteklo</Badge>
  if (days <= 7) return <Badge variant="destructive">{days}d</Badge>
  if (days <= 30) return <Badge variant="secondary">{days}d</Badge>
  return null
}

function DocumentList({ documents, t }: { documents: VehicleDocument[]; t: (key: string) => string }) {
  if (documents.length === 0) {
    return <BodySmall className="text-muted-foreground py-4 text-center">{t('documents.noDocuments')}</BodySmall>
  }
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <BodySmall className="font-medium">
              {t(`documents.vehicleTypes.${doc.documentType}`)}
            </BodySmall>
            {doc.expirationDate && (
              <Caption className="text-muted-foreground">
                {t('documents.expiry')}: {formatDate(doc.expirationDate)}
              </Caption>
            )}
          </div>
          <DocumentExpiryBadge expirationDate={doc.expirationDate} />
        </div>
      ))}
    </div>
  )
}

export function VehicleDetailSheet({ vehicleId, open, onClose }: VehicleDetailSheetProps) {
  const { t } = useTranslation('fleet')
  const { data } = useVehicle(vehicleId)
  const vehicle = data?.vehicle

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{vehicle?.regNumber ?? '...'}</SheetTitle>
        </SheetHeader>
        {vehicle && (
          <Tabs defaultValue="info" className="p-4">
            <TabsList>
              <TabsTrigger value="info">{t('common:actions.edit')}</TabsTrigger>
              <TabsTrigger value="documents">{t('documents.title')}</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="mt-4 space-y-1">
              <InfoRow label={t('vehicles.regNumber')} value={vehicle.regNumber} />
              <InfoRow label={t('vehicles.make')} value={vehicle.make} />
              <InfoRow label={t('vehicles.model')} value={vehicle.model} />
              <InfoRow label={t('vehicles.year')} value={vehicle.year} />
              <InfoRow label={t('vehicles.vin')} value={vehicle.vin} />
              <Separator className="my-2" />
              <InfoRow label={t('vehicles.type')} value={t(`vehicles.vehicleTypes.${vehicle.vehicleType}`)} />
              <InfoRow label={t('vehicles.fuelType')} value={t(`vehicles.fuelTypes.${vehicle.fuelType}`)} />
              <InfoRow label={t('vehicles.ownership')} value={t(`vehicles.ownershipTypes.${vehicle.ownership}`)} />
              <InfoRow label={t('vehicles.status')} value={t(`vehicles.statuses.${vehicle.status}`)} />
              <Separator className="my-2" />
              <InfoRow label={t('vehicles.capacity')} value={vehicle.cargoCapacityKg} />
              <InfoRow label={t('vehicles.volume')} value={vehicle.cargoVolumeM3} />
              <InfoRow label={t('vehicles.consumption')} value={vehicle.avgConsumptionL100km} />
              <InfoRow label={t('vehicles.odometer')} value={vehicle.odometerKm} />
              <InfoRow label={t('vehicles.driver')} value={vehicle.currentDriverName} />
            </TabsContent>
            <TabsContent value="documents" className="mt-4">
              <DocumentList documents={vehicle.documents ?? []} t={t} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  )
}
