import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as Collapsible from '@radix-ui/react-collapsible'
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
  FileText,
  Coins,
  BarChart3,
  PieChart,
  ShieldCheck,
  ChevronRight,
  UserCog,
  type LucideIcon,
} from 'lucide-react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/shared/ui/overlay/popover'
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

type NavItem = {
  key: string
  path: string
  icon: LucideIcon
  roles?: string[]
}
type NavGroup = {
  label: string
  icon: LucideIcon
  items: NavItem[]
  roles?: string[]
}

const navStructure: (NavItem | NavGroup)[] = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  {
    label: 'groups.spedition',
    icon: ClipboardList,
    items: [
      { key: 'routes', path: '/routes', icon: ClipboardList },
      { key: 'partners', path: '/partners', icon: Handshake },
      { key: 'permits', path: '/permits', icon: ShieldCheck },
    ],
  },
  {
    label: 'groups.fleet',
    icon: Truck,
    items: [
      { key: 'vehicles', path: '/vehicles', icon: Truck },
      { key: 'drivers', path: '/drivers', icon: Users },
      { key: 'trailers', path: '/trailers', icon: Container },
      { key: 'fuel', path: '/fuel', icon: Fuel },
    ],
  },
  {
    label: 'groups.finance',
    icon: Coins,
    items: [
      { key: 'invoices', path: '/invoices', icon: FileText },
      { key: 'expenses', path: '/expenses', icon: Receipt },
      { key: 'exchangeRates', path: '/exchange-rates', icon: Coins },
    ],
  },
  {
    label: 'groups.analytics',
    icon: BarChart3,
    items: [
      { key: 'reports', path: '/reports', icon: BarChart3 },
      { key: 'statistics', path: '/statistics', icon: PieChart },
    ],
  },
]

const bottomNavItems: NavItem[] = [
  { key: 'users', path: '/users', icon: UserCog, roles: ['ADMIN'] },
]

function isGroup(item: NavItem | NavGroup): item is NavGroup {
  return 'items' in item
}

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

  const renderItem = ({ key, path, icon: Icon }: NavItem) => (
    <SidebarMenuItem key={key}>
      <SidebarMenuButton
        asChild
        isActive={
          pathname === path ||
          (path !== '/dashboard' && pathname.startsWith(path))
        }
        tooltip={t(`sidebar.${key}`)}
      >
        <NavLink to={path}>
          <Icon className="size-4" />
          <BodySmall as="span">{t(`sidebar.${key}`)}</BodySmall>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  const hasAccess = (entry: NavItem | NavGroup) =>
    !entry.roles || entry.roles.includes(user?.role ?? '')

  const isGroupActive = (group: NavGroup) =>
    group.items.some(
      (item) => pathname === item.path || pathname.startsWith(item.path)
    )

  return (
    <Sidebar>
      <SidebarHeader
        className={`h-14 justify-center border-b ${isCollapsed ? 'px-1' : 'px-4'}`}
      >
        <div
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}
        >
          <Logo size={isCollapsed ? 'md' : 'lg'} className="shrink-0" />
          {!isCollapsed && <H4>{t('common:app.name')}</H4>}
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        {navStructure.filter(hasAccess).map((entry) => {
          if (isGroup(entry)) {
            const active = isGroupActive(entry)

            // Collapsed: group icon with popover showing child items
            if (isCollapsed) {
              return (
                <SidebarGroup key={entry.label} className="py-0.5">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <SidebarMenuButton
                              tooltip={t(entry.label)}
                              isActive={active}
                            >
                              <entry.icon className="size-4" />
                            </SidebarMenuButton>
                          </PopoverTrigger>
                          <PopoverContent
                            side="right"
                            align="start"
                            sideOffset={8}
                            className="w-48 p-1"
                          >
                            <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                              {t(entry.label)}
                            </p>
                            {entry.items.map((item) => (
                              <NavLink
                                key={item.key}
                                to={item.path}
                                className={({ isActive }) =>
                                  `flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors ${
                                    isActive
                                      ? 'bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-primary border-l-[3px] pl-[5px] font-medium'
                                      : 'hover:bg-accent/50'
                                  }`
                                }
                              >
                                <item.icon className="size-4" />
                                {t(`sidebar.${item.key}`)}
                              </NavLink>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )
            }

            // Expanded: collapsible group with trigger
            return (
              <Collapsible.Root key={entry.label} defaultOpen={active}>
                <SidebarGroup className="py-0.5">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Collapsible.Trigger asChild>
                        <SidebarMenuButton
                          tooltip={t(entry.label)}
                          className="font-semibold [&[data-state=open]>svg.chevron]:rotate-90"
                        >
                          <entry.icon className="size-4" />
                          <BodySmall as="span" className="font-semibold">
                            {t(entry.label)}
                          </BodySmall>
                          <ChevronRight className="chevron text-muted-foreground ml-auto size-3.5 transition-transform duration-200" />
                        </SidebarMenuButton>
                      </Collapsible.Trigger>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <Collapsible.Content>
                    <SidebarGroupContent className="pl-4">
                      <SidebarMenu>{entry.items.map(renderItem)}</SidebarMenu>
                    </SidebarGroupContent>
                  </Collapsible.Content>
                </SidebarGroup>
              </Collapsible.Root>
            )
          }
          return (
            <SidebarGroup key={entry.key} className="py-0.5">
              <SidebarGroupContent>
                <SidebarMenu>{renderItem(entry)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
        {/* Bottom nav items — pushed to end */}
        {bottomNavItems.filter(hasAccess).length > 0 && (
          <SidebarGroup className="mt-auto py-0.5">
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomNavItems.filter(hasAccess).map(renderItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-primary/20 border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={user ? getUserDisplayName(user) : undefined}
              className={`hover:bg-sidebar-accent ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {user ? getUserInitials(user) : '?'}
              </div>
              {!isCollapsed && (
                <div className="flex flex-1 flex-col overflow-hidden">
                  <Label truncate>{user ? getUserDisplayName(user) : ''}</Label>
                  <Caption truncate className="text-muted-foreground">
                    {user?.email}
                  </Caption>
                </div>
              )}
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
