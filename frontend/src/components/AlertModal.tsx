import { ReactNode } from 'react'
import Button from './Button'
import Icon from './Icon'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string | ReactNode
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

const AlertModal = ({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  showCancel = false
}: AlertModalProps) => {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          icon: 'check-circle',
          borderColor: 'border-green-200',
          gradient: 'from-green-50 to-emerald-50'
        }
      case 'error':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          icon: 'x-circle',
          borderColor: 'border-red-200',
          gradient: 'from-red-50 to-rose-50'
        }
      case 'warning':
        return {
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          icon: 'warning',
          borderColor: 'border-amber-200',
          gradient: 'from-amber-50 to-orange-50'
        }
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          icon: 'info',
          borderColor: 'border-blue-200',
          gradient: 'from-blue-50 to-indigo-50'
        }
    }
  }

  const typeStyles = getTypeStyles()

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div
          className={`bg-gradient-to-br ${typeStyles.gradient} rounded-2xl shadow-2xl border ${typeStyles.borderColor} max-w-md w-full transform transition-all duration-300 scale-100`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header com ícone */}
          <div className="p-6 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${typeStyles.iconBg} rounded-full mb-4`}>
              <Icon name={typeStyles.icon as any} className={`w-8 h-8 ${typeStyles.iconColor}`} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {title}
            </h3>
            
            <div className="text-gray-700 leading-relaxed">
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6">
            <div className={`flex gap-3 ${showCancel ? 'justify-between' : 'justify-center'}`}>
              {showCancel && (
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-semibold border-2 border-gray-300 hover:border-gray-400"
                >
                  {cancelText}
                </Button>
              )}
              <Button
                onClick={handleConfirm}
                className={`${showCancel ? 'flex-1' : 'w-full'} py-3 rounded-xl font-semibold ${
                  type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' :
                  type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700' :
                  type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' :
                  'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                } text-white shadow-lg`}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertModal