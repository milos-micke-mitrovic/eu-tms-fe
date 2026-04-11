import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/components'
import { H4 } from '@/shared/ui/typography'
import { useAuth, useLogout } from '@/features/auth'

export function TenantLayout() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const logoutMutation = useLogout()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // Logout even if BE call fails
    }
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <Logo size="lg" />
          <H4>EU TMS Platform</H4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          {t('auth:logout')}
        </Button>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
