import { Component, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui'
import { H2, Body } from '@/shared/ui/typography'

type ErrorFallbackProps = {
  error: Error | null
  onRetry: () => void
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const { t } = useTranslation('common')

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="bg-destructive/10 mb-4 rounded-full p-4">
        <AlertTriangle className="text-destructive h-8 w-8" />
      </div>
      <H2 className="mb-2">{t('errorBoundary.title')}</H2>
      <Body color="muted" className="mb-6 max-w-md">
        {t('errorBoundary.message')}
      </Body>
      <Button onClick={onRetry} prefixIcon={<RefreshCw className="h-4 w-4" />}>
        {t('errorBoundary.retry')}
      </Button>
      {import.meta.env.DEV && error && (
        <pre className="bg-muted mt-6 max-w-full overflow-auto rounded-lg p-4 text-left text-xs">
          {error.message}
          {'\n'}
          {error.stack}
        </pre>
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

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
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
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
      )
    }

    return this.props.children
  }
}
