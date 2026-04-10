import { Component, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/shared/ui'
import { Body, Caption } from '@/shared/ui/typography'

type ErrorFallbackProps = {
  error: Error | null
  onRetry: () => void
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="bg-destructive/10 mb-6 rounded-2xl p-5">
        <AlertTriangle className="text-destructive size-10" />
      </div>
      <Body className="mb-2 text-xl font-semibold">{t('errorBoundary.title')}</Body>
      <Caption className="text-muted-foreground mb-8 max-w-md">
        {t('errorBoundary.message')}
      </Caption>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => { window.location.href = '/' }}>
          <Home className="mr-2 size-4" />
          {t('notFound.goHome')}
        </Button>
        <Button onClick={onRetry}>
          <RefreshCw className="mr-2 size-4" />
          {t('errorBoundary.retry')}
        </Button>
      </div>
      {import.meta.env.DEV && error && (
        <details className="mt-8 w-full max-w-lg text-left">
          <summary className="text-muted-foreground mb-2 text-xs">
            Stack trace (dev only)
          </summary>
          <pre className="bg-muted overflow-auto rounded-lg p-4 text-xs">
            {error.message}
            {'\n'}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  )
}

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
      )
    }
    return this.props.children
  }
}
