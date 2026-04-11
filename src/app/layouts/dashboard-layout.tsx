import { Outlet, Navigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/shared/ui'
import { AppSidebar } from './app-sidebar'
import { RouteGuard } from '@/app/routes/route-guard'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { LanguageSwitcher } from '@/shared/components/language-switcher'
import { ThemeToggle } from '@/shared/components/theme-toggle'
import { useAuth, isSuperAdmin } from '@/features/auth'

export function DashboardLayout() {
  const { user } = useAuth()

  // SUPER_ADMIN should not access dashboard routes — redirect to /tenants
  if (isSuperAdmin(user)) {
    return <Navigate to="/tenants" replace />
  }

  return (
    <RouteGuard requireAuth={true}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <LanguageSwitcher />
              <NotificationBell />
            </div>
          </header>
          <div className="min-h-0 min-w-0 flex-1 overflow-auto p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RouteGuard>
  )
}
