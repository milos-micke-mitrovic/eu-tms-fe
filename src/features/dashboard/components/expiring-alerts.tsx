import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { formatDate } from '@/shared/utils'
import type { DashboardData } from '../api/use-dashboard'

type ExpiringAlertsProps = {
  documents: DashboardData['expiringDocuments']
}

export function ExpiringAlerts({ documents }: ExpiringAlertsProps) {
  const { t } = useTranslation('dashboard')

  if (!documents || documents.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <BodySmall className="mb-3 font-medium">{t('expiringDocs')}</BodySmall>
        <Caption className="text-muted-foreground">{t('common:table.noData')}</Caption>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-4">
      <BodySmall className="mb-3 font-medium">{t('expiringDocs')}</BodySmall>
      <div className="space-y-2">
        {documents.map((doc, i) => (
          <div key={i} className="flex items-center justify-between rounded border p-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`size-4 ${doc.daysUntilExpiry <= 7 ? 'text-destructive' : 'text-yellow-500'}`} />
              <div>
                <BodySmall>{doc.entityName}</BodySmall>
                <Caption className="text-muted-foreground">{doc.documentType}</Caption>
              </div>
            </div>
            <Badge variant={doc.daysUntilExpiry <= 7 ? 'destructive' : 'secondary'}>
              {doc.daysUntilExpiry}d — {formatDate(doc.expirationDate)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
