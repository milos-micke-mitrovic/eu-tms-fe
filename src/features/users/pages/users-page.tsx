import { useTranslation } from 'react-i18next'
import { UserCog } from 'lucide-react'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { BodySmall } from '@/shared/ui/typography'

export function UsersPage() {
  const { t } = useTranslation('users')
  usePageTitle(t('title'))

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} />
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="bg-muted rounded-full p-4">
          <UserCog className="text-muted-foreground size-8" />
        </div>
        <BodySmall className="text-muted-foreground">
          {t('comingSoon')}
        </BodySmall>
      </div>
    </div>
  )
}
