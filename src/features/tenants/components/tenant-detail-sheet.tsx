import { useTranslation } from 'react-i18next'
import { Pencil, Building2, UserCog } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/overlay/sheet'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { SectionDivider } from '@/shared/components'
import { formatDate } from '@/shared/utils'
import { useTenantCompanies, useTenantUsers } from '../api/use-tenants'
import type { Tenant } from '../types'

type TenantDetailSheetProps = {
  tenant: Tenant | null
  open: boolean
  onClose: () => void
  onEdit: () => void
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Caption className="text-muted-foreground">{label}</Caption>
      <BodySmall>{value ?? '—'}</BodySmall>
    </div>
  )
}

export function TenantDetailSheet({
  tenant,
  open,
  onClose,
  onEdit,
}: TenantDetailSheetProps) {
  const { t } = useTranslation('tenants')
  const { data: companies = [] } = useTenantCompanies(tenant?.id ?? 0)
  const { data: users = [] } = useTenantUsers(tenant?.id ?? 0)

  if (!tenant) return null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader
          actions={
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-1 size-3.5" />
              {t('common:actions.edit')}
            </Button>
          }
        >
          <div className="flex items-center gap-2">
            <SheetTitle>{tenant.name}</SheetTitle>
            <Badge
              color={tenant.active ? 'success' : undefined}
              variant={tenant.active ? undefined : 'outline'}
            >
              {tenant.active ? t('status.active') : t('status.inactive')}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-4 overflow-y-auto p-4">
          {/* Tenant Info */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label={t('sheet.name')} value={tenant.name} />
            <InfoRow
              label={t('columns.code')}
              value={
                <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
                  {tenant.subdomain}
                </code>
              }
            />
            <InfoRow
              label={t('columns.createdAt')}
              value={formatDate(tenant.createdAt)}
            />
          </div>

          {/* Companies */}
          <SectionDivider title={t('companies.title')} />
          {companies.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="bg-muted rounded-full p-3">
                <Building2 className="text-muted-foreground size-5" />
              </div>
              <Caption className="text-muted-foreground">
                {t('companies.empty')}
              </Caption>
            </div>
          ) : (
            <div className="space-y-2">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <BodySmall className="font-medium">{company.name}</BodySmall>
                  <Badge color="success">{t('status.active')}</Badge>
                </div>
              ))}
            </div>
          )}

          {/* Admins */}
          <SectionDivider title={t('admins.title')} />
          {users.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="bg-muted rounded-full p-3">
                <UserCog className="text-muted-foreground size-5" />
              </div>
              <Caption className="text-muted-foreground">
                {t('admins.empty')}
              </Caption>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <BodySmall className="font-medium">
                      {admin.firstName} {admin.lastName}
                    </BodySmall>
                    <Caption className="text-muted-foreground">
                      {admin.email}
                      {admin.companyName && ` — ${admin.companyName}`}
                    </Caption>
                  </div>
                  <Badge
                    color={admin.active ? 'success' : undefined}
                    variant={admin.active ? undefined : 'outline'}
                  >
                    {admin.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
