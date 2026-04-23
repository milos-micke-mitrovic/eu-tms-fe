import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Upload, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-time/date-picker'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { Caption } from '@/shared/ui/typography'
import { useFileUpload } from '@/shared/hooks'
import { getApiErrorMessage } from '@/shared/utils'
import { HttpError } from '@/shared/api/http-client'
import { useUploadDocument } from '../api/use-document-upload'
import type { VehicleDocumentType, DriverDocumentType } from '../types'
import { documentUploadSchema, type DocumentUploadFormData } from '../schemas'

type DocumentUploadDialogProps = {
  open: boolean
  onClose: () => void
  entityType: 'vehicles' | 'drivers'
  entityId: string
}

const VEHICLE_DOC_TYPES: VehicleDocumentType[] = [
  'REGISTRATION',
  'INSURANCE',
  'TECHNICAL_INSPECTION',
  'ATP_CERTIFICATE',
  'ADR_CERTIFICATE',
  'OTHER',
]
const DRIVER_DOC_TYPES: DriverDocumentType[] = [
  'DRIVERS_LICENSE',
  'MEDICAL_CERTIFICATE',
  'PASSPORT',
  'ID_CARD',
  'ADR_CERTIFICATE',
  'OTHER',
]

export function DocumentUploadDialog({
  open,
  onClose,
  entityType,
  entityId,
}: DocumentUploadDialogProps) {
  const { t } = useTranslation('fleet')
  const uploadMutation = useUploadDocument()
  const {
    uploadFile,
    isUploading,
    tempResult,
    error: uploadError,
    cleanup,
    reset,
  } = useFileUpload()

  const docTypes =
    entityType === 'vehicles' ? VEHICLE_DOC_TYPES : DRIVER_DOC_TYPES
  const labelKey =
    entityType === 'vehicles'
      ? 'documents.vehicleTypes'
      : 'documents.driverTypes'

  const docTypeOptions = docTypes.map((dt) => ({
    value: dt,
    label: t(`${labelKey}.${dt}`),
  }))

  const form = useForm<DocumentUploadFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(documentUploadSchema) as any,
    defaultValues: { documentType: '', expirationDate: '', notes: '' },
  })

  const documentType = useWatch({ control: form.control, name: 'documentType' })

  // Cleanup temp file if dialog closes without submit
  useEffect(() => {
    if (!open && tempResult) {
      cleanup()
    }
  }, [open, tempResult, cleanup])

  const handleFileChange = async (file: File | null) => {
    if (!file) return
    try {
      await uploadFile(file)
    } catch (err: unknown) {
      // Map specific error codes to user-friendly messages
      if (err instanceof HttpError && err.data) {
        const errorData = err.data as { errorCode?: string }
        const errorCode = errorData.errorCode
        if (errorCode) {
          const translatedMessage = t(`common:apiErrors.${errorCode}`, {
            defaultValue: '',
          })
          if (translatedMessage) {
            toast.error(translatedMessage)
            return
          }
        }
      }
      toast.error(getApiErrorMessage(err, t('common:errors.uploadFailed')))
    }
  }

  const handleClose = () => {
    if (tempResult) {
      cleanup()
    } else {
      reset()
    }
    form.reset()
    onClose()
  }

  const onSubmit = async (data: DocumentUploadFormData) => {
    if (!tempResult) return
    await uploadMutation.mutateAsync({
      entityType,
      entityId,
      payload: {
        documentType: data.documentType,
        tempFileName: tempResult.tempFileName,
        originalFileName: tempResult.originalFileName,
        expirationDate: data.expirationDate || undefined,
        notes: data.notes || undefined,
      },
    })
    form.reset()
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('documents.upload')}</DialogTitle>
        </DialogHeader>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          {/* File input — Phase 1: upload to temp */}
          <div>
            {tempResult ? (
              <div className="flex items-center gap-3 rounded-md border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/30">
                <CheckCircle className="size-5 shrink-0 text-green-800 dark:text-green-300" />
                <div className="w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {tempResult.originalFileName}
                  </p>
                  <Caption className="text-muted-foreground">
                    {(tempResult.fileSize / 1024).toFixed(0)} KB
                  </Caption>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => cleanup()}
                >
                  {t('common:fileUpload.clickToReplace')}
                </Button>
              </div>
            ) : (
              <label className="hover:border-primary border-foreground/20 bg-muted/50 hover:bg-muted flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 transition-colors">
                {isUploading ? (
                  <Loader2 className="text-muted-foreground size-8 animate-spin" />
                ) : (
                  <Upload className="text-foreground/70 size-8" />
                )}
                <Caption className="text-foreground/70 font-medium">
                  {isUploading
                    ? t('common:fileUpload.uploading')
                    : t('common:fileUpload.clickToUpload_one')}
                </Caption>
                <Caption className="text-muted-foreground text-xs">
                  {t('documents.allowedFormats', {
                    defaultValue: 'PDF, DOC, DOCX, JPG, PNG, XLSX (max 10 MB)',
                  })}
                </Caption>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  disabled={isUploading}
                  onChange={(e) =>
                    handleFileChange(e.target.files?.[0] ?? null)
                  }
                />
              </label>
            )}
            {uploadError && (
              <Caption className="text-destructive mt-1">{uploadError}</Caption>
            )}
          </div>

          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('documents.type')}</FormLabel>
                <Select
                  options={docTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('documents.expiry')}</FormLabel>
                <DatePicker
                  value={field.value ?? undefined}
                  onChange={(d) => field.onChange(d ?? '')}
                  returnFormat="iso"
                  clearable
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('common:actions.notes')}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common:actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                uploadMutation.isPending || !tempResult || !documentType
              }
            >
              {uploadMutation.isPending
                ? t('common:app.loading')
                : t('documents.upload')}
            </Button>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
