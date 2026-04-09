import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home } from 'lucide-react'
import { Button } from '@/shared/ui'
import { H1, Body } from '@/shared/ui/typography'

export function NotFoundPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <H1 className="mb-2">404</H1>
      <Body color="muted" className="mb-6">
        {t('notFound.message')}
      </Body>
      <Button prefixIcon={<Home />} onClick={() => navigate('/')}>
        {t('notFound.goHome')}
      </Button>
    </div>
  )
}
