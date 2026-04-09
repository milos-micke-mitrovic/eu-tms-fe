import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Download, Loader2, FileText, Upload, X } from 'lucide-react'
import type { FieldArrayWithId, FieldValues, Control } from 'react-hook-form'
import { toast } from 'sonner'
import { Button, Select, DatePicker, Caption } from '@/shared/ui'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form'
import { FormSection } from './form-section'
import { downloadDocument, type DocumentType } from '@/shared/api/documents'

/** Shortens filename to maxLength chars, preserving extension */
function shortenFileName(fileName: string, maxLength = 20): string {
  if (fileName.length <= maxLength) return fileName
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return fileName.slice(0, maxLength - 3) + '...'
  }
  const ext = fileName.slice(lastDotIndex)
  const nameWithoutExt = fileName.slice(0, lastDotIndex)
  const availableLength = maxLength - ext.length - 3 // 3 for "..."
  if (availableLength <= 0) {
    return fileName.slice(0, maxLength - 3) + '...'
  }
  return nameWithoutExt.slice(0, availableLength) + '...' + ext
}

export type DocumentFormValue = {
  id?: number
  type: string
  tempFileName?: string
  originalFileName?: string
  expirationDate?: string
  isNew?: boolean
}

type DocumentsSectionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  fields: FieldArrayWithId<FieldValues, 'documents', 'id'>[]
  /** Function to get current document value at index */
  getDocument: (index: number) => DocumentFormValue | undefined
  documentTypeOptions: { value: string; label: string }[]
  onFileUpload: (index: number, file: File) => Promise<void>
  onRemove: (index: number) => void
  onAdd: () => void
  onFileClear: (index: number) => void
  isUploading?: boolean
  /** Translation namespace for labels (defaults to 'admin') */
  namespace?: string
  /** Entity type for document download (required to enable download) */
  entityType?: DocumentType
}

export function DocumentsSection({
  control,
  fields,
  getDocument,
  documentTypeOptions,
  onFileUpload,
  onRemove,
  onAdd,
  onFileClear,
  isUploading,
  namespace = 'admin',
  entityType,
}: DocumentsSectionProps) {
  const { t } = useTranslation(namespace)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const bottomRef = useRef<HTMLButtonElement>(null)

  const handleAdd = () => {
    onAdd()
    // Scroll to the add button after a short delay to allow DOM update
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }

  const handleDownload = async (documentId: number) => {
    if (!entityType) return
    setDownloadingId(documentId)
    try {
      await downloadDocument(entityType, documentId)
    } catch {
      toast.error(t('documents.downloadError', 'Download failed'))
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <FormSection title={t('documents.title')}>
      <div className="space-y-3">
        {fields.map((field, index) => {
          const doc = getDocument(index)
          return (
            <div
              key={field.id}
              className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:flex-wrap"
            >
              <FormField
                control={control}
                name={`documents.${index}.type`}
                rules={{ required: t('validation.required') }}
                render={({ field: typeField }) => (
                  <FormItem className="md:flex-1 md:min-w-[180px]">
                    <FormLabel required>{t('documents.type')}</FormLabel>
                    <Select
                      options={documentTypeOptions}
                      value={typeField.value as string}
                      onChange={typeField.onChange}
                      placeholder={t('documents.selectType')}
                      creatable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`documents.${index}.expirationDate`}
                render={({ field: expField }) => (
                  <FormItem className="md:flex-1 md:min-w-[180px]">
                    <FormLabel>{t('documents.expirationDate')}</FormLabel>
                    <DatePicker
                      value={expField.value as string}
                      onChange={expField.onChange}
                      placeholder={t('documents.selectDate')}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end gap-2 w-full order-last">
                <FormItem className="flex-1">
                  <FormLabel>{t('documents.file')}</FormLabel>
                  {doc?.originalFileName ? (
                    <div className="flex h-9 items-center gap-2 rounded-md border bg-muted/50 px-3">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <Caption className="flex-1 truncate" title={doc.originalFileName}>
                        {shortenFileName(doc.originalFileName)}
                      </Caption>
                      {doc.id && entityType && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => handleDownload(doc.id!)}
                          disabled={downloadingId === doc.id}
                          title={t('documents.download')}
                        >
                          {downloadingId === doc.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => onFileClear(index)}
                        title={t('documents.removeFile')}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                      <Upload className="h-4 w-4" />
                      <span>{t('documents.uploadPdf')}</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            onFileUpload(index, file)
                            e.target.value = ''
                          }
                        }}
                        disabled={isUploading}
                      />
                      {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </label>
                  )}
                </FormItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mb-0.5 h-9 w-9 shrink-0"
                  onClick={() => onRemove(index)}
                  title={t('documents.removeRow')}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          )
        })}
        <Button
          ref={bottomRef}
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
        >
          <Plus className="mr-1 h-4 w-4" />
          {t('documents.addDocument')}
        </Button>
      </div>
    </FormSection>
  )
}
