import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/ui'
import { Body, Caption } from '@/shared/ui/typography'

export function NotFoundPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="text-primary mb-6 text-[120px] leading-none font-bold tracking-tighter opacity-20">
          404
        </div>
        <Body className="mb-2 text-xl font-semibold">{t('notFound.message')}</Body>
        <Caption className="text-muted-foreground mb-8 max-w-sm">
          {t('errorBoundary.message')}
        </Caption>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 size-4" />
            {t('actions.back')}
          </Button>
          <Button onClick={() => navigate('/')}>
            <Home className="mr-2 size-4" />
            {t('notFound.goHome')}
          </Button>
        </div>
      </div>
    </div>
  )
}
