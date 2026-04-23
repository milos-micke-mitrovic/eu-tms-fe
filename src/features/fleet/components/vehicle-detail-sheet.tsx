import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { differenceInDays } from 'date-fns'
import { FileText, Plus, Pencil, Download } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatDate, downloadDocument } from '@/shared/utils'
import { useVehicle } from '../api/use-vehicles'
import { DocumentUploadDialog } from './document-upload-dialog'

type DocItem = {
  id: string
  documentType: string
  expirationDate?: string | null
}

type VehicleDetailSheetProps = {
  vehicleId: string | null
  open: boolean
  onClose: () => void
  onEdit?: () => void
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5">
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall>{value ?? '—'}</BodySmall>
    </div>
  )
}

function DocumentExpiryBadge({
  expirationDate,
}: {
  expirationDate: string | null | undefined
}) {
  if (!expirationDate) return null
  const days = differenceInDays(new Date(expirationDate), new Date())
  if (days < 0) return <Badge variant="destructive">{days}d</Badge>
  if (days <= 7) return <Badge variant="destructive">{days}d</Badge>
  if (days <= 30) return <Badge variant="secondary">{days}d</Badge>
  return null
}

function DocumentList({
  documents,
  t,
}: {
  documents: DocItem[]
  t: (key: string) => string
}) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <div className="bg-muted rounded-full p-3">
          <FileText className="text-muted-foreground size-6" />
        </div>
        <BodySmall className="font-medium">
          {t('documents.noDocuments')}
        </BodySmall>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between rounded-md border p-3"
        >
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={t('common:aria.downloadFile')}
              onClick={() => downloadDocument('VEHICLE', Number(doc.id))}
            >
              <Download className="size-4" />
            </Button>
            <DocumentExpiryBadge expirationDate={doc.expirationDate} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function VehicleDetailSheet({
  vehicleId,
  open,
  onClose,
  onEdit,
}: VehicleDetailSheetProps) {
  const { t } = useTranslation('fleet')
  const { data } = useVehicle(vehicleId)
  const vehicle = data?.vehicle
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <>
      <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader
            actions={
              onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose()
                    onEdit()
                  }}
                >
                  <Pencil className="mr-1 size-3.5" />
                  {t('common:actions.edit')}
                </Button>
              )
            }
          >
            <SheetTitle>{vehicle?.regNumber ?? '...'}</SheetTitle>
          </SheetHeader>
          {vehicle && (
            <Tabs defaultValue="info" className="p-4">
              <TabsList>
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="documents">
                  {t('documents.title')} ({vehicle.documents?.length ?? 0})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="mt-4 space-y-1">
                <InfoRow
                  label={t('vehicles.regNumber')}
                  value={vehicle.regNumber}
                />
                <InfoRow label={t('vehicles.make')} value={vehicle.make} />
                <InfoRow label={t('vehicles.model')} value={vehicle.model} />
                <InfoRow label={t('vehicles.year')} value={vehicle.year} />
                <InfoRow label={t('vehicles.vin')} value={vehicle.vin} />
                <Separator className="my-2" />
                <InfoRow
                  label={t('vehicles.type')}
                  value={t(`vehicles.vehicleTypes.${vehicle.vehicleType}`)}
                />
                <InfoRow
                  label={t('vehicles.fuelType')}
                  value={t(`vehicles.fuelTypes.${vehicle.fuelType}`)}
                />
                <InfoRow
                  label={t('vehicles.ownership')}
                  value={t(`vehicles.ownershipTypes.${vehicle.ownership}`)}
                />
                <InfoRow
                  label={t('vehicles.status')}
                  value={t(`vehicles.statuses.${vehicle.status}`)}
                />
                <Separator className="my-2" />
                <InfoRow
                  label={t('vehicles.capacity')}
                  value={vehicle.cargoCapacityKg}
                />
                <InfoRow
                  label={t('vehicles.volume')}
                  value={vehicle.cargoVolumeM3}
                />
                <InfoRow
                  label={t('vehicles.consumption')}
                  value={vehicle.avgConsumptionL100km}
                />
                <InfoRow
                  label={t('vehicles.odometer')}
                  value={vehicle.odometerKm}
                />
                <InfoRow
                  label={t('vehicles.driver')}
                  value={vehicle.currentDriverName}
                />
              </TabsContent>
              <TabsContent value="documents" className="mt-4 space-y-4">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setUploadOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    {t('documents.upload')}
                  </Button>
                </div>
                <DocumentList documents={vehicle.documents ?? []} t={t} />
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {vehicleId && (
        <DocumentUploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          entityType="vehicles"
          entityId={vehicleId}
        />
      )}
    </>
  )
}
