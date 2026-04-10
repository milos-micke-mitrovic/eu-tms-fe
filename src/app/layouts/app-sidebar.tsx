import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Receipt,
  Truck,
  Users,
  Container,
  Handshake,
  Fuel,
  Bell,
} from 'lucide-react'
import { Logo } from '@/shared/components'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/shared/ui/sidebar'
import { H4, Label, Caption, BodySmall } from '@/shared/ui/typography'
import {
  useAuth,
  useLogout,
  getUserDisplayName,
  getUserInitials,
} from '@/features/auth'

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'routes', path: '/routes', icon: ClipboardList },
  { key: 'expenses', path: '/expenses', icon: Receipt },
  { key: 'vehicles', path: '/vehicles', icon: Truck },
  { key: 'drivers', path: '/drivers', icon: Users },
  { key: 'trailers', path: '/trailers', icon: Container },
  { key: 'partners', path: '/partners', icon: Handshake },
  { key: 'fuel', path: '/fuel', icon: Fuel },
  { key: 'notifications', path: '/notifications', icon: Bell },
] as const

export function AppSidebar() {
  const { t } = useTranslation('navigation')
  const { state } = useSidebar()
  const { user, logout } = useAuth()
  const logoutMutation = useLogout()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isCollapsed = state === 'collapsed'

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // Continue with local logout even if API call fails
    }
    logout()
    navigate('/login')
  }

  return (
    <Sidebar>
      <SidebarHeader className={`h-14 justify-center border-b ${isCollapsed ? 'px-1' : 'px-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
          <Logo size={isCollapsed ? 'md' : 'lg'} className="shrink-0" />
          {!isCollapsed && <H4>{t('common:app.name')}</H4>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ key, path, icon: Icon }) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === path || (path !== '/dashboard' && pathname.startsWith(path))}
                    tooltip={t(`sidebar.${key}`)}
                  >
                    <NavLink to={path}>
                      <Icon className="size-4" />
                      <BodySmall as="span">{t(`sidebar.${key}`)}</BodySmall>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={`border-t ${isCollapsed ? 'p-1' : 'p-2'}`}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={user ? getUserDisplayName(user) : undefined}
              className={`hover:bg-sidebar-accent ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                {user ? getUserInitials(user) : '?'}
              </div>
              <div className="flex flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <Label truncate>{user ? getUserDisplayName(user) : ''}</Label>
                <Caption truncate>{user?.email}</Caption>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={t('auth:logout')}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
              <BodySmall as="span">{t('auth:logout')}</BodySmall>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
