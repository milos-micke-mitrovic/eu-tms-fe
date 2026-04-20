import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, CheckCircle2, AlertTriangle, FileUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/overlay/dialog'
import { Button } from '@/shared/ui/button'
import { Select } from '@/shared/ui/select'
import { Badge } from '@/shared/ui/badge'
import { Spinner } from '@/shared/ui/spinner'
import { BodySmall, Caption, H4 } from '@/shared/ui/typography'
import { formatDate } from '@/shared/utils'
import { toast } from 'sonner'
import { useDrivers } from '@/features/fleet/api/use-drivers'
import { usePreviewDdd, useImportDdd } from '../api'
import { ACTIVITY_COLORS } from '../constants'
import type { DddParseResult, DddImportResult } from '../types'

type DddUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDriverId?: number
}

function minutesToHM(m: number) {
  return `${Math.floor(m / 60)}h ${m % 60}min`
}

export function DddUploadDialog({
  open,
  onOpenChange,
  defaultDriverId,
}: DddUploadDialogProps) {
  const { t } = useTranslation('tachograph')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<DddParseResult | null>(null)
  const [importResult, setImportResult] = useState<DddImportResult | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(
    defaultDriverId ?? null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewMutation = usePreviewDdd()
  const importMutation = useImportDdd()
  const { data: driversData } = useDrivers({ status: 'ACTIVE', size: 100 })

  const driverOptions = (driversData?.drivers?.content ?? []).map((d) => ({
    value: String(d.id),
    label: `${d.firstName} ${d.lastName}`,
  }))

  const reset = () => {
    setStep(1)
    setFile(null)
    setPreview(null)
    setImportResult(null)
    setSelectedDriverId(defaultDriverId ?? null)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(reset, 300)
  }

  const ACCEPTED_EXTENSIONS = ['.ddd', '.tgd', '.esm']

  const handleFileSelect = (selectedFile: File) => {
    const ext = selectedFile.name
      .substring(selectedFile.name.lastIndexOf('.'))
      .toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      toast.error(t('ddd.acceptedFormats'))
      return
    }
    setFile(selectedFile)
  }

  const handlePreview = async () => {
    if (!file) return
    const result = await previewMutation.mutateAsync(file)
    setPreview(result)
    setStep(2)
  }

  const handleImport = async () => {
    if (!file || !selectedDriverId) return
    const result = await importMutation.mutateAsync({
      driverId: selectedDriverId,
      file,
    })
    setImportResult(result)
    setStep(3)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('ddd.dialogTitle')}</DialogTitle>
        </DialogHeader>

        {/* Step 1 — Upload File */}
        {step === 1 && (
          <div className="space-y-4">
            <BodySmall className="font-medium">{t('ddd.step1Title')}</BodySmall>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-muted-foreground/30 hover:border-primary flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors"
            >
              <Upload className="text-muted-foreground size-8" />
              <BodySmall className="text-muted-foreground text-center">
                {t('ddd.dropzone')}
              </BodySmall>
              <Caption className="text-muted-foreground">
                {t('ddd.acceptedFormats')}
              </Caption>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ddd,.tgd,.esm"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileSelect(f)
              }}
            />
            {file && (
              <div className="flex items-center gap-2 rounded border p-2">
                <FileUp className="text-muted-foreground size-4" />
                <BodySmall>{file.name}</BodySmall>
                <Caption className="text-muted-foreground">
                  ({(file.size / 1024).toFixed(1)} KB)
                </Caption>
              </div>
            )}
            {previewMutation.isError && (
              <BodySmall className="text-destructive">
                {t('ddd.parseError')}
              </BodySmall>
            )}
            <DialogFooter>
              <Button
                onClick={handlePreview}
                disabled={!file || previewMutation.isPending}
              >
                {previewMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    {t('ddd.reading')}
                  </>
                ) : (
                  t('ddd.import')
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2 — Preview Results */}
        {step === 2 && preview && (
          <div className="space-y-4">
            <BodySmall className="font-medium">{t('ddd.step2Title')}</BodySmall>

            {/* Card info */}
            {preview.cardNumber && (
              <div className="grid grid-cols-3 gap-3 rounded border p-3">
                <div>
                  <Caption className="text-muted-foreground">
                    {t('ddd.cardInfo')}
                  </Caption>
                  <BodySmall>
                    {preview.cardNumber}
                    {preview.cardHolderName && ` — ${preview.cardHolderName}`}
                  </BodySmall>
                </div>
                <div>
                  <Caption className="text-muted-foreground">
                    {t('ddd.period')}
                  </Caption>
                  <BodySmall>
                    {formatDate(preview.oldestDate)} —{' '}
                    {formatDate(preview.newestDate)}
                  </BodySmall>
                </div>
                <div>
                  <Caption className="text-muted-foreground">
                    {t('ddd.totalDays')}
                  </Caption>
                  <BodySmall>{preview.totalDays}</BodySmall>
                </div>
              </div>
            )}

            {/* Driver select */}
            <div>
              <Caption className="text-muted-foreground mb-1">
                {t('ddd.selectDriver')}
              </Caption>
              <Select
                options={driverOptions}
                value={selectedDriverId ? String(selectedDriverId) : undefined}
                onChange={(v) => setSelectedDriverId(Number(v))}
                searchable
                placeholder={t('entry.selectDriver')}
              />
              {preview.cardHolderName && (
                <Caption className="text-muted-foreground mt-1">
                  {t('ddd.cardHolder')}: {preview.cardHolderName}
                </Caption>
              )}
            </div>

            {/* Preview table */}
            <div className="max-h-[300px] overflow-auto rounded border">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">{t('entry.date')}</th>
                    <th className="p-2 text-right">{t('entry.driving')}</th>
                    <th className="p-2 text-right">{t('entry.rest')}</th>
                    <th className="p-2 text-right">{t('entry.otherWork')}</th>
                    <th className="p-2 text-right">
                      {t('entry.availability')}
                    </th>
                    <th className="p-2 text-right">km</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...preview.dailySummaries]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((day) => {
                      const km =
                        day.startOdometerKm != null && day.endOdometerKm != null
                          ? day.endOdometerKm - day.startOdometerKm
                          : null
                      const isComplete = day.totalMinutes >= 1400
                      return (
                        <tr key={day.date} className="border-t">
                          <td className="p-2">{formatDate(day.date)}</td>
                          <td className="p-2 text-right">
                            {minutesToHM(day.drivingMinutes)}
                          </td>
                          <td className="p-2 text-right">
                            {minutesToHM(day.restMinutes)}
                          </td>
                          <td className="p-2 text-right">
                            {minutesToHM(day.otherWorkMinutes)}
                          </td>
                          <td className="p-2 text-right">
                            {minutesToHM(day.availabilityMinutes)}
                          </td>
                          <td className="p-2 text-right">
                            {km != null ? `${km}` : '—'}
                          </td>
                          <td className="p-2 text-center">
                            <Badge
                              color={isComplete ? 'success' : 'warning'}
                              className="text-[10px]"
                            >
                              {isComplete ? 'OK' : 'Nepotpun'}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            {(() => {
              const complete = preview.dailySummaries.filter(
                (d) => d.totalMinutes >= 1400
              ).length
              const incomplete = preview.totalDays - complete
              return (
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">
                    {complete} {t('ddd.daysToImport')}
                  </span>
                  <span className="text-muted-foreground">
                    {incomplete} {t('ddd.daysSkippedPreview')}
                  </span>
                </div>
              )
            })()}

            {/* Activity bar */}
            {(() => {
              const totals = preview.dailySummaries.reduce(
                (acc, d) => ({
                  driving: acc.driving + d.drivingMinutes,
                  rest: acc.rest + d.restMinutes,
                  other: acc.other + d.otherWorkMinutes,
                  avail: acc.avail + d.availabilityMinutes,
                }),
                { driving: 0, rest: 0, other: 0, avail: 0 }
              )
              const total =
                totals.driving + totals.rest + totals.other + totals.avail
              if (total === 0) return null
              const pct = (v: number) => `${(v / total) * 100}%`
              return (
                <div className="flex h-2 w-full overflow-hidden rounded-full">
                  <div
                    style={{
                      width: pct(totals.driving),
                      backgroundColor: ACTIVITY_COLORS.driving,
                    }}
                  />
                  <div
                    style={{
                      width: pct(totals.rest),
                      backgroundColor: ACTIVITY_COLORS.rest,
                    }}
                  />
                  <div
                    style={{
                      width: pct(totals.other),
                      backgroundColor: ACTIVITY_COLORS.otherWork,
                    }}
                  />
                  <div
                    style={{
                      width: pct(totals.avail),
                      backgroundColor: ACTIVITY_COLORS.availability,
                    }}
                  />
                </div>
              )
            })()}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>
                {t('ddd.back')}
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedDriverId || importMutation.isPending}
              >
                {importMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    {t('ddd.importing')}
                  </>
                ) : (
                  t('ddd.import')
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3 — Import Results */}
        {step === 3 && importResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {importResult.daysImported > 0 ? (
                <CheckCircle2 className="size-8 text-green-500" />
              ) : (
                <AlertTriangle className="text-destructive size-8" />
              )}
              <BodySmall className="font-medium">
                {t('ddd.step3Title')}
              </BodySmall>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <Caption className="text-muted-foreground">
                  {t('ddd.imported')}
                </Caption>
                <H4 className="text-green-600">{importResult.daysImported}</H4>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <Caption className="text-muted-foreground">
                  {t('ddd.skipped')}
                </Caption>
                <H4 className="text-muted-foreground">
                  {importResult.daysSkipped}
                </H4>
                <Caption className="text-muted-foreground text-xs">
                  {t('ddd.skippedReason')}
                </Caption>
              </div>
              {importResult.daysWithErrors > 0 && (
                <div className="rounded-lg border p-3 text-center">
                  <Caption className="text-muted-foreground">
                    {t('ddd.errors')}
                  </Caption>
                  <H4 className="text-destructive">
                    {importResult.daysWithErrors}
                  </H4>
                </div>
              )}
            </div>

            {/* Warnings */}
            {importResult.warnings.length > 0 && (
              <div className="max-h-40 space-y-1 overflow-auto">
                {importResult.warnings.map((w, i) => (
                  <div
                    key={i}
                    className="bg-warning/10 flex items-start gap-2 rounded p-2 text-sm"
                  >
                    <AlertTriangle className="text-warning mt-0.5 size-3.5 shrink-0" />
                    <span>
                      {w.date && (
                        <span className="font-medium">
                          {formatDate(w.date)}:{' '}
                        </span>
                      )}
                      {w.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Violations count */}
            {(() => {
              const totalViolations = importResult.importedEntries.reduce(
                (sum, e) => sum + (e.violations?.length ?? 0),
                0
              )
              if (totalViolations === 0) return null
              return (
                <BodySmall className="text-destructive">
                  {t('ddd.violationsDetected')}: {totalViolations}
                </BodySmall>
              )
            })()}

            <DialogFooter>
              <Button onClick={handleClose}>{t('ddd.close')}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
