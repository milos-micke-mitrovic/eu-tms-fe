import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { RouteGuard } from './route-guard'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { NotFoundPage } from './not-found-page'
import { ErrorBoundary } from './error-boundary'
import { Spinner } from '@/shared/ui'
import { useAuth, getDefaultRoute } from '@/features/auth'

// Lazy load feature pages
const LoginPage = lazy(() =>
  import('@/features/auth/pages/login-page').then((m) => ({
    default: m.LoginPage,
  }))
)

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/dashboard-page').then((m) => ({
    default: m.DashboardPage,
  }))
)

const VehiclesPage = lazy(() =>
  import('@/features/fleet/pages/vehicles-page').then((m) => ({
    default: m.VehiclesPage,
  }))
)

const DriversPage = lazy(() =>
  import('@/features/fleet/pages/drivers-page').then((m) => ({
    default: m.DriversPage,
  }))
)

const TrailersPage = lazy(() =>
  import('@/features/fleet/pages/trailers-page').then((m) => ({
    default: m.TrailersPage,
  }))
)

const PartnersPage = lazy(() =>
  import('@/features/partners/pages/partners-page').then((m) => ({
    default: m.PartnersPage,
  }))
)

const RoutesPage = lazy(() =>
  import('@/features/spedition/pages/routes-page').then((m) => ({
    default: m.RoutesPage,
  }))
)

const ExpensesPage = lazy(() =>
  import('@/features/spedition/pages/expenses-page').then((m) => ({
    default: m.ExpensesPage,
  }))
)

const FuelPage = lazy(() =>
  import('@/features/fuel/pages/fuel-page').then((m) => ({
    default: m.FuelPage,
  }))
)

// Notifications page removed — bell popover in header is sufficient

const ExchangeRatesPage = lazy(() =>
  import('@/features/finance/pages/exchange-rates-page').then((m) => ({
    default: m.ExchangeRatesPage,
  }))
)

const InvoicesPage = lazy(() =>
  import('@/features/finance/pages/invoices-page').then((m) => ({
    default: m.InvoicesPage,
  }))
)

const PermitsPage = lazy(() =>
  import('@/features/permits/pages/permits-page').then((m) => ({
    default: m.PermitsPage,
  }))
)

const ReportsPage = lazy(() =>
  import('@/features/reports/pages/reports-page').then((m) => ({
    default: m.ReportsPage,
  }))
)

const StatisticsPage = lazy(() =>
  import('@/features/reports/pages/statistics-page').then((m) => ({
    default: m.StatisticsPage,
  }))
)

const TenantsPage = lazy(() =>
  import('@/features/tenants/pages/tenants-page').then((m) => ({
    default: m.TenantsPage,
  }))
)

const TenantLayout = lazy(() =>
  import('@/features/tenants/layouts/tenant-layout').then((m) => ({
    default: m.TenantLayout,
  }))
)

// Redirects to the user's default route based on role
function DefaultRedirect() {
  const { user } = useAuth()
  return <Navigate to={getDefaultRoute(user)} replace />
}

// Loading fallback for lazy-loaded pages
function PageLoadingFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

// Wrapper for lazy-loaded pages with error boundary and suspense
function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>
    </ErrorBoundary>
  )
}

function RouterErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="text-primary mb-6 text-[80px] leading-none font-bold opacity-20">
        !
      </div>
      <p className="mb-2 text-xl font-semibold">Došlo je do greške</p>
      <p className="text-muted-foreground mb-6 text-sm">
        Došlo je do neočekivane greške. Pokušajte ponovo.
      </p>
      <button
        onClick={() => (window.location.href = '/')}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
      >
        Početna strana
      </button>
    </div>
  )
}

export const router = createBrowserRouter([
  // Public routes (no auth required)
  {
    errorElement: <RouterErrorFallback />,
    element: (
      <RouteGuard requireAuth={false}>
        <Outlet />
      </RouteGuard>
    ),
    children: [
      {
        path: '/login',
        element: (
          <LazyPage>
            <LoginPage />
          </LazyPage>
        ),
      },
    ],
  },
  // SUPER_ADMIN routes (tenant management, no sidebar)
  {
    errorElement: <RouterErrorFallback />,
    element: (
      <RouteGuard requireAuth={true} allowedRoles={['SUPER_ADMIN']}>
        <Suspense fallback={<PageLoadingFallback />}>
          <TenantLayout />
        </Suspense>
      </RouteGuard>
    ),
    children: [
      {
        path: '/tenants',
        element: (
          <LazyPage>
            <TenantsPage />
          </LazyPage>
        ),
      },
    ],
  },
  // Protected routes (auth required)
  {
    errorElement: <RouterErrorFallback />,
    element: <DashboardLayout />,
    children: [
      {
        path: '/',
        element: <DefaultRedirect />,
      },
      {
        path: '/dashboard',
        element: (
          <LazyPage>
            <DashboardPage />
          </LazyPage>
        ),
      },
      {
        path: '/routes',
        element: (
          <LazyPage>
            <RoutesPage />
          </LazyPage>
        ),
      },
      {
        path: '/expenses',
        element: (
          <LazyPage>
            <ExpensesPage />
          </LazyPage>
        ),
      },
      {
        path: '/vehicles',
        element: (
          <LazyPage>
            <VehiclesPage />
          </LazyPage>
        ),
      },
      {
        path: '/drivers',
        element: (
          <LazyPage>
            <DriversPage />
          </LazyPage>
        ),
      },
      {
        path: '/trailers',
        element: (
          <LazyPage>
            <TrailersPage />
          </LazyPage>
        ),
      },
      {
        path: '/partners',
        element: (
          <LazyPage>
            <PartnersPage />
          </LazyPage>
        ),
      },
      {
        path: '/fuel',
        element: (
          <LazyPage>
            <FuelPage />
          </LazyPage>
        ),
      },
      {
        path: '/exchange-rates',
        element: (
          <LazyPage>
            <ExchangeRatesPage />
          </LazyPage>
        ),
      },
      {
        path: '/invoices',
        element: (
          <LazyPage>
            <InvoicesPage />
          </LazyPage>
        ),
      },
      {
        path: '/permits',
        element: (
          <LazyPage>
            <PermitsPage />
          </LazyPage>
        ),
      },
      {
        path: '/reports',
        element: (
          <LazyPage>
            <ReportsPage />
          </LazyPage>
        ),
      },
      {
        path: '/statistics',
        element: (
          <LazyPage>
            <StatisticsPage />
          </LazyPage>
        ),
      },
    ],
  },
  // 404 catch-all
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
