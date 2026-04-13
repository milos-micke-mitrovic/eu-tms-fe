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
import { Badge } from '@/shared/ui/badge'
import { BodySmall, Caption, H4 } from '@/shared/ui/typography'
import { TableSkeleton, SectionDivider } from '@/shared/components'
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
  UNPAID: ['PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED'],
  PARTIAL: ['PAID', 'OVERDUE', 'CANCELLED'],
  PAID: ['CANCELLED'],
  OVERDUE: ['PARTIAL', 'PAID', 'CANCELLED'],
  CANCELLED: [],
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall>{value ?? '—'}</BodySmall>
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
            <SheetHeader
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose()
                    onEdit()
                  }}
                >
                  <Pencil className="mr-1 size-3.5" />
                  {t('common:actions.edit')}
                </Button>
              }
            >
              <div className="flex items-center gap-2">
                <SheetTitle className="font-mono">
                  {invoice.invoiceNumber}
                </SheetTitle>
                <InvoiceStatusBadge
                  status={invoice.paymentStatus as InvoiceStatus}
                />
              </div>
            </SheetHeader>

            <div className="mt-4 space-y-4 px-4">
              {/* Status change */}
              {nextStatuses.length > 0 && (
                <div>
                  <Caption className="text-muted-foreground mb-1">
                    {t('invoices.status')}
                  </Caption>
                  <Select
                    options={nextStatuses.map((s) => ({
                      value: s,
                      label: t(`invoices.statuses.${s}`),
                    }))}
                    placeholder={t('invoices.status')}
                    onChange={handleStatusChange}
                    className="w-48"
                  />
                </div>
              )}

              {/* Partner & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  label={t('invoices.partner')}
                  value={invoice.partner?.name}
                />
                <InfoRow
                  label={t('invoices.issueDate')}
                  value={formatDate(invoice.invoiceDate)}
                />
                <InfoRow
                  label={t('invoices.dueDate')}
                  value={formatDate(invoice.dueDate)}
                />
                <InfoRow
                  label={t('invoices.currency')}
                  value={invoice.currency}
                />
              </div>

              {/* Items */}
              <SectionDivider title={t('invoices.items')} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">
                        {t('invoices.itemDescription')}
                      </th>
                      <th className="py-2 text-right font-medium">
                        {t('invoices.quantity')}
                      </th>
                      <th className="py-2 text-right font-medium">
                        {t('invoices.unit')}
                      </th>
                      <th className="py-2 text-right font-medium">
                        {t('invoices.unitPrice')}
                      </th>
                      <th className="py-2 text-right font-medium">
                        {t('invoices.amount')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-2">{item.description}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">
                          <Badge variant="outline" className="text-xs">
                            {item.unit ?? t('invoices.unitDefault')}
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

              {/* Totals */}
              <SectionDivider title={t('invoices.totals')} />
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  label={t('invoices.subtotal')}
                  value={formatCurrency(invoice.subtotal, invoice.currency)}
                />
                <InfoRow
                  label={`${t('invoices.vat')} (${invoice.vatRate}%)`}
                  value={formatCurrency(invoice.vatAmount, invoice.currency)}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <BodySmall className="font-medium">
                  {t('invoices.total')}
                </BodySmall>
                <H4>{formatCurrency(invoice.total, invoice.currency)}</H4>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <>
                  <SectionDivider title={t('invoices.notes')} />
                  <BodySmall>{invoice.notes}</BodySmall>
                </>
              )}

              {/* Downloads */}
              <SectionDivider
                title={t('invoices.downloads', { defaultValue: 'Preuzimanje' })}
              />
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
                  {t('invoices.downloadPdf')}
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
                  {t('invoices.downloadXml')}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
