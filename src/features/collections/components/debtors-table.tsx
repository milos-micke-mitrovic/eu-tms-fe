import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, Inbox } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { formatCurrency, formatDate } from '@/shared/utils'
import { useDebtorsSummary } from '../api'
import type { PartnerDebtSummary } from '../types'
import { ReminderHistoryList } from './reminder-history-list'

export function DebtorsTable() {
  const { t } = useTranslation('collections')
  const { data, loading } = useDebtorsSummary(10)

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null
  )

  const debtors = (data?.debtorsSummary ?? []) as PartnerDebtSummary[]

  const columns = useMemo<ColumnDef<PartnerDebtSummary>[]>(
    () => [
      {
        accessorKey: 'partnerName',
        header: t('debtors.partner'),
      },
      {
        accessorKey: 'totalInvoices',
        header: t('debtors.totalInvoices'),
      },
      {
        accessorKey: 'overdueInvoices',
        header: t('debtors.overdueInvoices'),
        cell: ({ row }) => {
          const val = row.original.overdueInvoices
          return val > 0 ? (
            <Badge color="destructive">{val}</Badge>
          ) : (
            <span>{val}</span>
          )
        },
      },
      {
        accessorKey: 'totalDebt',
        header: t('debtors.totalDebt'),
        cell: ({ row }) => formatCurrency(row.original.totalDebt, 'RSD'),
      },
      {
        accessorKey: 'overdueDebt',
        header: t('debtors.overdueDebt'),
        cell: ({ row }) => (
          <span className="text-destructive font-medium">
            {formatCurrency(row.original.overdueDebt, 'RSD')}
          </span>
        ),
      },
      {
        accessorKey: 'avgDaysOverdue',
        header: t('debtors.avgDaysOverdue'),
        cell: ({ row }) =>
          row.original.avgDaysOverdue != null
            ? `${row.original.avgDaysOverdue} ${t('aging.days')}`
            : '-',
      },
      {
        accessorKey: 'oldestDueDate',
        header: t('debtors.oldestDue'),
        cell: ({ row }) =>
          row.original.oldestDueDate
            ? formatDate(row.original.oldestDueDate)
            : '-',
      },
      {
        accessorKey: 'remindersSent',
        header: t('debtors.remindersSent'),
        cell: ({ row }) => {
          const p = row.original
          return (
            <div className="flex items-center gap-2">
              <span>{p.remindersSent}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedPartnerId(
                    selectedPartnerId === p.partnerId ? null : p.partnerId
                  )
                }}
                aria-label={t('reminder.history')}
              >
                <Bell className="size-3.5" />
              </Button>
            </div>
          )
        },
      },
    ],
    [t, selectedPartnerId]
  )

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={debtors}
        loading={loading}
        pagination={false}
        emptyText={t('debtors.empty')}
        emptyAction={
          <div className="flex flex-col items-center gap-2">
            <Inbox className="text-muted-foreground size-6" />
          </div>
        }
      />
      {selectedPartnerId && (
        <ReminderHistoryList
          partnerId={selectedPartnerId}
          onClose={() => setSelectedPartnerId(null)}
        />
      )}
    </div>
  )
}
