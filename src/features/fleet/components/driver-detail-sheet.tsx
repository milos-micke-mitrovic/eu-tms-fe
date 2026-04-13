import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { differenceInDays } from 'date-fns'
import { FileText, Plus, Pencil } from 'lucide-react'
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
import { formatDate } from '@/shared/utils'
import { useDriver } from '../api/use-drivers'
import type { DriverStatus } from '../types'
import { DocumentUploadDialog } from './document-upload-dialog'

const statusConfig: Record<
  DriverStatus,
  {
    variant?: 'default' | 'secondary' | 'outline'
    color?: 'success' | 'warning' | 'muted'
  }
> = {
  ACTIVE: { color: 'success' },
  ON_LEAVE: { color: 'warning' },
  INACTIVE: { variant: 'outline' },
}

type DocItem = {
  id: string
  documentType: string
  expirationDate?: string | null
}

type DriverDetailSheetProps = {
  driverId: string | null
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
              {t(`documents.driverTypes.${doc.documentType}`)}
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

export function DriverDetailSheet({
  driverId,
  open,
  onClose,
  onEdit,
}: DriverDetailSheetProps) {
  const { t } = useTranslation('fleet')
  const { data } = useDriver(driverId)
  const driver = data?.driver
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
            <SheetTitle>
              {driver ? `${driver.firstName} ${driver.lastName}` : '...'}
            </SheetTitle>
          </SheetHeader>
          {driver && (
            <Tabs defaultValue="info" className="p-4">
              <TabsList>
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="documents">
                  {t('documents.title')} ({driver.documents?.length ?? 0})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="mt-4 space-y-1">
                <InfoRow
                  label={t('drivers.firstName')}
                  value={`${driver.firstName} ${driver.lastName}`}
                />
                <InfoRow label={t('drivers.jmbg')} value={driver.jmbg} />
                <InfoRow label={t('drivers.phone')} value={driver.phone} />
                <InfoRow label={t('drivers.email')} value={driver.email} />
                <InfoRow
                  label={t('drivers.birthDate')}
                  value={driver.birthDate ? formatDate(driver.birthDate) : null}
                />
                <Separator className="my-2" />
                <InfoRow
                  label={t('drivers.licenseNumber')}
                  value={driver.licenseNumber}
                />
                <InfoRow
                  label={t('drivers.categories')}
                  value={driver.licenseCategories}
                />
                <InfoRow
                  label={t('drivers.adr')}
                  value={
                    driver.adrCertificate ? t('common:yes') : t('common:no')
                  }
                />
                <InfoRow
                  label={t('drivers.adrExpiry')}
                  value={driver.adrExpiry ? formatDate(driver.adrExpiry) : null}
                />
                <InfoRow
                  label={t('drivers.healthCheckExpiry')}
                  value={
                    driver.healthCheckExpiry
                      ? formatDate(driver.healthCheckExpiry)
                      : null
                  }
                />
                <InfoRow
                  label={t('drivers.employment')}
                  value={
                    driver.employmentDate
                      ? formatDate(driver.employmentDate)
                      : null
                  }
                />
                <Separator className="my-2" />
                <InfoRow
                  label={t('drivers.status')}
                  value={
                    <Badge
                      variant={
                        statusConfig[driver.status as DriverStatus]?.variant
                      }
                      color={statusConfig[driver.status as DriverStatus]?.color}
                    >
                      {t(`drivers.statuses.${driver.status}`)}
                    </Badge>
                  }
                />
                <InfoRow
                  label={t('drivers.vehicle')}
                  value={driver.vehicleRegNumber}
                />
              </TabsContent>
              <TabsContent value="documents" className="mt-4 space-y-4">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setUploadOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    {t('documents.upload')}
                  </Button>
                </div>
                <DocumentList documents={driver.documents ?? []} t={t} />
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {driverId && (
        <DocumentUploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          entityType="drivers"
          entityId={driverId}
        />
      )}
    </>
  )
}
