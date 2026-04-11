import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Shield,
  Receipt,
} from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn, formatCurrency } from '@/shared/utils'
import type { DashboardData } from '../api/use-dashboard'

type AlertsPanelProps = {
  permits: DashboardData['expiringPermits'] | undefined
  documents: DashboardData['expiringDocuments'] | undefined
  invoices: DashboardData['overdueInvoices'] | undefined
  loading?: boolean
}

export function AlertsPanel({
  permits,
  documents,
  invoices,
  loading,
}: AlertsPanelProps) {
  const { t } = useTranslation('dashboard')

  if (loading) {
    return (
      <div className="rounded-lg border p-4">
        <Skeleton className="mb-3 h-5 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  const hasPermits = permits && permits.length > 0
  const hasDocs = documents && documents.length > 0
  const hasInvoices = invoices && invoices.length > 0
  const allEmpty = !hasPermits && !hasDocs && !hasInvoices

  if (allEmpty) {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex flex-col items-center gap-2 py-12">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
          </div>
          <BodySmall className="font-medium">{t('allGood')}</BodySmall>
          <Caption>{t('noAlerts')}</Caption>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {hasPermits && (
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="text-muted-foreground size-4" />
            <BodySmall className="font-medium">
              {t('expiringPermits')}
            </BodySmall>
          </div>
          <div className="space-y-2">
            {permits.slice(0, 5).map((permit) => (
              <Link
                key={permit.id}
                to={{ pathname: '/permits' }}
                state={{ highlightId: permit.id }}
                className="hover:bg-accent flex items-center justify-between rounded border p-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      permit.permitType === 'CEMT' ? 'default' : 'secondary'
                    }
                  >
                    {permit.permitType}
                  </Badge>
                  <div>
                    <BodySmall>{permit.permitNumber}</BodySmall>
                    <Caption>{permit.countryName}</Caption>
                  </div>
                </div>
                <Caption
                  className={cn(
                    'whitespace-nowrap',
                    permit.daysUntilExpiry <= 7
                      ? 'text-destructive'
                      : 'text-amber-500'
                  )}
                >
                  {t('expiresIn', { days: permit.daysUntilExpiry })}
                </Caption>
              </Link>
            ))}
          </div>
        </div>
      )}

      {hasDocs && (
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="text-muted-foreground size-4" />
            <BodySmall className="font-medium">{t('expiringDocs')}</BodySmall>
          </div>
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <Link
                key={`${doc.entityType}-${doc.entityId}`}
                to={doc.entityType === 'VEHICLE' ? '/vehicles' : '/drivers'}
                state={{ highlightName: doc.entityName }}
                className="hover:bg-accent flex items-center justify-between rounded border p-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={cn(
                      'size-4',
                      doc.daysUntilExpiry <= 7
                        ? 'text-destructive'
                        : 'text-amber-500'
                    )}
                  />
                  <div>
                    <BodySmall>{doc.entityName}</BodySmall>
                    <Caption>{doc.documentType}</Caption>
                  </div>
                </div>
                <Caption
                  className={cn(
                    'whitespace-nowrap',
                    doc.daysUntilExpiry <= 7
                      ? 'text-destructive'
                      : 'text-amber-500'
                  )}
                >
                  {t('expiresIn', { days: doc.daysUntilExpiry })}
                </Caption>
              </Link>
            ))}
          </div>
        </div>
      )}

      {hasInvoices && (
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="text-muted-foreground size-4" />
            <BodySmall className="font-medium">
              {t('overdueInvoices')}
            </BodySmall>
          </div>
          <div className="space-y-2">
            {invoices.slice(0, 5).map((invoice) => (
              <Link
                key={invoice.id}
                to={{ pathname: '/invoices' }}
                state={{ highlightId: invoice.id }}
                className="hover:bg-accent flex items-center justify-between rounded border p-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div>
                    <BodySmall>{invoice.invoiceNumber}</BodySmall>
                    <Caption>{invoice.partnerName}</Caption>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BodySmall className="font-medium whitespace-nowrap">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </BodySmall>
                  <Caption className="text-destructive whitespace-nowrap">
                    {t('overdueDays', { days: invoice.daysOverdue })}
                  </Caption>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
