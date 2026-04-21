import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, Bell } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { DataTable } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { formatCurrency, formatDate } from '@/shared/utils'
import { RecordPaymentDialog } from './record-payment-dialog'
import { SendReminderDialog } from './send-reminder-dialog'
import { PaymentHistoryList } from './payment-history-list'

type OverdueInvoice = {
  id: string
  invoiceNumber: string
  partner: { name: string } | null
  dueDate: string
  total: number
  amountPaid: number | null
  amountRemaining: number | null
  currency: string
  paymentStatus: string
}

type InvoicesQueryResult = {
  invoices: {
    content: OverdueInvoice[]
    totalElements: number
    totalPages: number
  }
}

const GET_OVERDUE_INVOICES = gql`
  query GetOverdueInvoices(
    $status: String
    $page: Int
    $size: Int
    $sortBy: String
    $sortDir: String
  ) {
    invoices(
      status: $status
      page: $page
      size: $size
      sortBy: $sortBy
      sortDir: $sortDir
    ) {
      content {
        id
        invoiceNumber
        partner {
          name
        }
        dueDate
        total
        amountPaid
        amountRemaining
        currency
        paymentStatus
      }
      totalElements
      totalPages
    }
  }
`

export function OverdueInvoicesTable() {
  const { t } = useTranslation('collections')

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const { data, loading } = useQuery<InvoicesQueryResult>(
    GET_OVERDUE_INVOICES,
    {
      variables: {
        status: 'UNPAID',
        page,
        size: pageSize,
        sortBy: 'dueDate',
        sortDir: 'asc',
      },
    }
  )

  const invoices = data?.invoices?.content ?? []
  const totalElements = data?.invoices?.totalElements ?? 0
  const totalPages = data?.invoices?.totalPages ?? 0

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<OverdueInvoice | null>(
    null
  )
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(
    null
  )

  const columns = useMemo<ColumnDef<OverdueInvoice>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: t('invoices.number'),
      },
      {
        id: 'partnerName',
        header: t('invoices.partner'),
        cell: ({ row }) => row.original.partner?.name ?? '-',
      },
      {
        accessorKey: 'dueDate',
        header: t('invoices.dueDate'),
        cell: ({ row }) => formatDate(row.original.dueDate),
      },
      {
        accessorKey: 'total',
        header: t('invoices.totalAmount'),
        cell: ({ row }) =>
          formatCurrency(row.original.total, row.original.currency),
      },
      {
        accessorKey: 'amountPaid',
        header: t('invoices.amountPaid'),
        cell: ({ row }) =>
          formatCurrency(row.original.amountPaid ?? 0, row.original.currency),
      },
      {
        accessorKey: 'amountRemaining',
        header: t('invoices.amountRemaining'),
        cell: ({ row }) => (
          <span className="text-destructive font-medium">
            {formatCurrency(
              row.original.amountRemaining ?? 0,
              row.original.currency
            )}
          </span>
        ),
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Status',
        cell: ({ row }) => {
          const s = row.original.paymentStatus
          const color =
            s === 'PAID'
              ? 'success'
              : s === 'PARTIALLY_PAID'
                ? 'warning'
                : 'destructive'
          return <Badge color={color}>{s}</Badge>
        },
      },
      {
        id: 'actions',
        header: t('invoices.actions'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              title={t('actions.recordPayment')}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedInvoice(row.original)
                setPaymentDialogOpen(true)
              }}
            >
              <CreditCard className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              title={t('actions.sendReminder')}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedInvoice(row.original)
                setReminderDialogOpen(true)
              }}
            >
              <Bell className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [t]
  )

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        manualPagination
        pageCount={totalPages}
        totalCount={totalElements}
        pageSize={pageSize}
        pageIndex={page}
        onPaginationChange={(p) => {
          setPage(p.pageIndex)
          setPageSize(p.pageSize)
        }}
        emptyText={t('invoices.empty')}
        onRowClick={(row) => {
          setExpandedPaymentId(expandedPaymentId === row.id ? null : row.id)
        }}
      />

      {expandedPaymentId && (
        <PaymentHistoryList
          invoiceId={expandedPaymentId}
          onClose={() => setExpandedPaymentId(null)}
        />
      )}

      {selectedInvoice && (
        <>
          <RecordPaymentDialog
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            invoiceId={Number(selectedInvoice.id)}
            invoiceNumber={selectedInvoice.invoiceNumber}
            totalAmount={selectedInvoice.total}
            amountPaid={selectedInvoice.amountPaid ?? 0}
            currency={selectedInvoice.currency}
          />
          <SendReminderDialog
            open={reminderDialogOpen}
            onOpenChange={setReminderDialogOpen}
            invoiceId={Number(selectedInvoice.id)}
            invoiceNumber={selectedInvoice.invoiceNumber}
            partnerName={selectedInvoice.partner?.name ?? ''}
            amountDue={selectedInvoice.amountRemaining ?? 0}
          />
        </>
      )}
    </div>
  )
}
