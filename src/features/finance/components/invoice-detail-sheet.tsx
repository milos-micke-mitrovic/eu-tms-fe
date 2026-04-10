import { useTranslation } from 'react-i18next'
import { FileText, FileCode, Pencil } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Select } from '@/shared/ui/select'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Badge } from '@/shared/ui/badge'
import { BodySmall, Caption, H4 } from '@/shared/ui/typography'
import { TableSkeleton } from '@/shared/components'
import { formatDate, formatCurrency } from '@/shared/utils'
import { downloadFile } from '@/shared/utils/download-file'
import { useInvoice } from '../api/use-invoices'
import { useUpdateInvoiceStatus } from '../api/use-invoice-mutations'
import { InvoiceStatusBadge } from './invoice-status-badge'
import type { InvoiceStatus } from '../types'

type InvoiceDetailSheetProps = {
  open: boolean
  onClose: () => void
  invoiceId: string | null
  onEdit: () => void
}

const VALID_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['PAID', 'OVERDUE', 'CANCELLED'],
  PAID: ['CANCELLED'],
  OVERDUE: ['PAID', 'CANCELLED'],
  CANCELLED: [],
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-1.5">
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall>{value ?? '---'}</BodySmall>
    </div>
  )
}

export function InvoiceDetailSheet({
  open,
  onClose,
  invoiceId,
  onEdit,
}: InvoiceDetailSheetProps) {
  const { t } = useTranslation('finance')
  const { data, loading } = useInvoice(invoiceId)
  const invoice = data?.invoice
  const statusMutation = useUpdateInvoiceStatus()

  const status = invoice?.paymentStatus as InvoiceStatus | undefined
  const nextStatuses = status ? (VALID_TRANSITIONS[status] ?? []) : []

  const handleStatusChange = (newStatus: string) => {
    if (invoice) statusMutation.mutate({ id: invoice.id, status: newStatus })
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        {loading ? (
          <div className="p-4">
            <TableSkeleton columns={2} rows={6} />
          </div>
        ) : invoice ? (
          <>
            <SheetHeader className="flex-row items-center gap-3">
              <SheetTitle className="font-mono">
                {invoice.invoiceNumber}
              </SheetTitle>
              <InvoiceStatusBadge
                status={invoice.paymentStatus as InvoiceStatus}
              />
              {nextStatuses.length > 0 && (
                <Select
                  options={nextStatuses.map((s) => ({
                    value: s,
                    label: t(`invoices.statuses.${s}`),
                  }))}
                  placeholder={t('invoices.status')}
                  onChange={handleStatusChange}
                  className="ml-auto w-40"
                />
              )}
            </SheetHeader>

            <div className="mt-4 space-y-6 px-4">
              {/* Partner info */}
              <div>
                <BodySmall className="mb-2 font-medium">
                  {t('invoices.partner')}
                </BodySmall>
                <div className="space-y-1">
                  <InfoRow label="Naziv" value={invoice.partner?.name} />
                </div>
              </div>

              {/* Dates */}
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Caption className="text-muted-foreground">
                      {t('invoices.issueDate')}
                    </Caption>
                    <BodySmall>{formatDate(invoice.invoiceDate)}</BodySmall>
                  </div>
                  <div>
                    <Caption className="text-muted-foreground">
                      {t('invoices.dueDate')}
                    </Caption>
                    <BodySmall>{formatDate(invoice.dueDate)}</BodySmall>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items table */}
              <div>
                <BodySmall className="mb-2 font-medium">
                  {t('invoices.items')}
                </BodySmall>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium">Opis</th>
                        <th className="py-2 text-right font-medium">
                          Kolicina
                        </th>
                        <th className="py-2 text-right font-medium">JM</th>
                        <th className="py-2 text-right font-medium">Cena</th>
                        <th className="py-2 text-right font-medium">Iznos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-2">{item.description}</td>
                          <td className="py-2 text-right">{item.quantity}</td>
                          <td className="py-2 text-right">
                            <Badge variant="outline" className="text-xs">
                              {item.unit ?? 'kom'}
                            </Badge>
                          </td>
                          <td className="py-2 text-right">
                            {formatCurrency(item.unitPrice, invoice.currency)}
                          </td>
                          <td className="py-2 text-right font-medium">
                            {formatCurrency(item.total, invoice.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between">
                  <Caption className="text-muted-foreground">Osnovica</Caption>
                  <BodySmall>
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </BodySmall>
                </div>
                <div className="flex justify-between">
                  <Caption className="text-muted-foreground">
                    PDV ({invoice.vatRate}%)
                  </Caption>
                  <BodySmall>
                    {formatCurrency(invoice.vatAmount, invoice.currency)}
                  </BodySmall>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <BodySmall className="font-medium">UKUPNO</BodySmall>
                  <H4>{formatCurrency(invoice.total, invoice.currency)}</H4>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div>
                  <Caption className="text-muted-foreground">
                    {t('invoices.notes')}
                  </Caption>
                  <BodySmall>{invoice.notes}</BodySmall>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadFile(
                      `/invoices/${invoice.id}/pdf`,
                      `Faktura-${invoice.invoiceNumber}.pdf`
                    )
                  }
                >
                  <FileText className="mr-2 size-4" />
                  Preuzmi PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadFile(
                      `/invoices/${invoice.id}/xml`,
                      `Faktura-${invoice.invoiceNumber}.xml`
                    )
                  }
                >
                  <FileCode className="mr-2 size-4" />
                  Preuzmi XML
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose()
                    onEdit()
                  }}
                >
                  <Pencil className="mr-2 size-4" />
                  Izmeni
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
