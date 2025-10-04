import { useEffect } from 'react'
import { Toast as ToastType } from '../hooks/useToast'
import Button from './Button'
import { StatusIcon } from './Icon'
import Icon from './Icon'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

export default function Toast({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, toast.duration)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onRemove])

  const getToastStyles = () => {
    const baseStyles = "flex items-start justify-between p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm"
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-l-green-500 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-l-red-500 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-l-yellow-500 text-yellow-800`
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border-l-blue-500 text-blue-800`
    }
  }

  const getIcon = () => {
    return <StatusIcon type={toast.type} size={18} />
  }

  return (
    <div className={`${getToastStyles()} animate-slideIn`}>
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium leading-5">
            {toast.message}
          </p>
          {toast.action && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={toast.action.onClick}
                className="text-xs"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Fechar notificação"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  )
}

// Container para renderizar todos os toasts
interface ToastContainerProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

