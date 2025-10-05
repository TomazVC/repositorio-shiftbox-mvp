import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]} ${className}`} />
  )
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  loading = false, 
  children, 
  disabled,
  className = '',
  ...props 
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center px-4 py-2 
        bg-primary-600 text-white rounded-lg font-medium
        hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  )
}

interface ErrorMessageProps {
  error: string | null
  className?: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, className = '' }) => {
  if (!error) return null

  return (
    <div className={`
      bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg
      flex items-center space-x-2
      ${className}
    `}>
      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span className="text-sm">{error}</span>
    </div>
  )
}

interface SuccessMessageProps {
  message: string | null
  className?: string
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, className = '' }) => {
  if (!message) return null

  return (
    <div className={`
      bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg
      flex items-center space-x-2
      ${className}
    `}>
      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="text-sm">{message}</span>
    </div>
  )
}

interface LoadingStateProps {
  loading: boolean
  error: string | null
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  error,
  children,
  loadingComponent,
  errorComponent
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        {loadingComponent || (
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        {errorComponent || <ErrorMessage error={error} />}
      </div>
    )
  }

  return <>{children}</>
}