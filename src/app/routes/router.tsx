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

const NotificationsPage = lazy(() =>
  import('@/features/notifications/pages/notifications-page').then((m) => ({
    default: m.NotificationsPage,
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

export const router = createBrowserRouter([
  // Public routes (no auth required)
  {
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
  // Protected routes (auth required)
  {
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
        path: '/notifications',
        element: (
          <LazyPage>
            <NotificationsPage />
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
