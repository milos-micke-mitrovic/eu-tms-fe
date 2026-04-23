import { useTranslation } from 'react-i18next'
import { formatCurrency, formatDate } from '@/shared/utils'
import { cn } from '@/shared/utils'
import { useTopDebtors } from '../api/use-advanced-stats'
import { Skeleton } from '@/shared/ui/skeleton'

export function TopDebtorsTable() {
  const { t } = useTranslation('reports')
  const { data, loading } = useTopDebtors(10)

  const debtors = data?.topDebtors ?? []

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 text-sm font-semibold">{t('stats.topDebtors')}</h3>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : debtors.length === 0 ? (
        <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
          {t('stats.topDebtors')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                  {t('stats.client')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.totalDebt')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.invoiceCount')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-left font-medium">
                  {t('stats.oldestDue')}
                </th>
                <th className="text-muted-foreground px-3 py-2 text-right font-medium">
                  {t('stats.avgOverdue')}
                </th>
              </tr>
            </thead>
            <tbody>
              {debtors.map((debtor) => (
                <tr key={debtor.partnerId} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">
                    {debtor.partnerName}
                  </td>
                  <td className="text-destructive px-3 py-2 text-right font-medium">
                    {formatCurrency(debtor.totalDebt, 'RSD')}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {debtor.invoiceCount}
                  </td>
                  <td className="px-3 py-2">
                    {formatDate(debtor.oldestDueDate)}
                  </td>
                  <td
                    className={cn(
                      'px-3 py-2 text-right',
                      debtor.avgDaysOverdue > 30 &&
                        'text-destructive font-medium'
                    )}
                  >
                    {debtor.avgDaysOverdue} {t('stats.days')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
