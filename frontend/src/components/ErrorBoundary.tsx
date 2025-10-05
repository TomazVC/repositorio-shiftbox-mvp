import { Component, ErrorInfo, ReactNode } from 'react'
import Button from './Button'
import Icon from './Icon'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-h1 font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Ops! Algo deu errado
            </h2>
            <p className="text-body mb-6" style={{ color: 'var(--text-secondary)' }}>
              Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
            </p>
            
            {this.props.showDetails && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-caption font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Detalhes do erro
                </summary>
                <pre className="bg-red-50 p-3 rounded text-xs overflow-auto text-red-800">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Recarregar Página
              </Button>
              <Button variant="primary" onClick={this.handleRetry}>
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Componente para erros específicos de API
export function ApiErrorFallback({ 
  error, 
  onRetry,
  showDetails = false
}: { 
  error: Error, 
  onRetry: () => void,
  showDetails?: boolean
}) {
  return (
    <div className="card text-center py-8">
      <div className="flex justify-center mb-4">
        <Icon name="alert-triangle" size={48} color="var(--color-red)" />
      </div>
      <h3 className="text-h2 font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        Erro ao carregar dados
      </h3>
      <p className="text-body mb-4" style={{ color: 'var(--text-secondary)' }}>
        Não foi possível conectar com o servidor. Verifique sua conexão e tente novamente.
      </p>
      
      {showDetails && (
        <p className="text-caption mb-4 font-mono bg-red-50 p-2 rounded text-red-700">
          {error.message}
        </p>
      )}

      <Button variant="primary" onClick={onRetry}>
        Tentar Novamente
      </Button>
    </div>
  )
}

// Hook para usar em componentes funcionais
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: any) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    // Aqui você pode integrar com serviços de monitoramento como Sentry
    // Sentry.captureException(error, { extra: errorInfo })
  }

  return handleError
}