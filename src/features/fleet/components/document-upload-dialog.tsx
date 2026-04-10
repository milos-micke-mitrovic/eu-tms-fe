import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Caption } from '@/shared/ui/typography'
import { useUploadDocument } from '../api/use-document-upload'
import type { VehicleDocumentType, DriverDocumentType } from '../types'
import { documentUploadSchema, type DocumentUploadFormData } from '../schemas'

type DocumentUploadDialogProps = {
  open: boolean
  onClose: () => void
  entityType: 'vehicles' | 'drivers'
  entityId: number
}

const VEHICLE_DOC_TYPES: VehicleDocumentType[] = ['REGISTRATION', 'INSURANCE', 'TECHNICAL_INSPECTION', 'ATP_CERTIFICATE', 'ADR_CERTIFICATE', 'OTHER']
const DRIVER_DOC_TYPES: DriverDocumentType[] = ['DRIVERS_LICENSE', 'MEDICAL_CERTIFICATE', 'PASSPORT', 'ID_CARD', 'ADR_CERTIFICATE', 'OTHER']

export function DocumentUploadDialog({ open, onClose, entityType, entityId }: DocumentUploadDialogProps) {
  const { t } = useTranslation('fleet')
  const uploadMutation = useUploadDocument()
  const [file, setFile] = useState<File | null>(null)

  const docTypes = entityType === 'vehicles' ? VEHICLE_DOC_TYPES : DRIVER_DOC_TYPES
  const labelKey = entityType === 'vehicles' ? 'documents.vehicleTypes' : 'documents.driverTypes'

  const docTypeOptions = docTypes.map((dt) => ({ value: dt, label: t(`${labelKey}.${dt}`) }))

  const form = useForm<DocumentUploadFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(documentUploadSchema) as any,
    defaultValues: { documentType: '', expirationDate: '', notes: '' },
  })

  const onSubmit = async (data: DocumentUploadFormData) => {
    if (!file) return
    await uploadMutation.mutateAsync({
      entityType,
      entityId,
      file,
      metadata: {
        documentType: data.documentType,
        expirationDate: data.expirationDate || undefined,
        notes: data.notes || undefined,
      },
    })
    form.reset()
    setFile(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('documents.upload')}</DialogTitle>
        </DialogHeader>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          {/* File input */}
          <div>
            <Caption className="mb-1 font-medium">Fajl</Caption>
            <label className="border-input hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-4 transition-colors">
              <Upload className="text-muted-foreground size-5" />
              <Caption className="text-muted-foreground">
                {file ? file.name : t('common:fileUpload.clickToUpload_one')}
              </Caption>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <FormField control={form.control} name="documentType" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('documents.type')}</FormLabel>
              <Select options={docTypeOptions} value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="expirationDate" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('documents.expiry')}</FormLabel>
              <DatePicker value={field.value ?? undefined} onChange={(d) => field.onChange(d ?? '')} returnFormat="iso" clearable />
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('common:actions.notes')}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>{t('common:actions.cancel')}</Button>
            <Button type="submit" disabled={uploadMutation.isPending || !file}>
              {uploadMutation.isPending ? t('common:app.loading') : t('documents.upload')}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
