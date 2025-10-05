import { useState, useCallback } from 'react'

interface AlertOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  onConfirm?: () => void
}

interface ConfirmOptions {
  title: string
  message: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  type?: 'warning' | 'error' | 'info'
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string | React.ReactNode
    confirmText: string
    cancelText: string
    showCancel: boolean
    onConfirm?: () => void
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    showCancel: false
  })

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      isOpen: true,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancelar',
      showCancel: options.showCancel || false,
      onConfirm: options.onConfirm
    })
  }, [])

  const showSuccess = useCallback((title: string, message: string | React.ReactNode) => {
    showAlert({
      type: 'success',
      title,
      message
    })
  }, [showAlert])

  const showError = useCallback((title: string, message: string | React.ReactNode) => {
    showAlert({
      type: 'error',
      title,
      message
    })
  }, [showAlert])

  const showWarning = useCallback((title: string, message: string | React.ReactNode) => {
    showAlert({
      type: 'warning',
      title,
      message
    })
  }, [showAlert])

  const showInfo = useCallback((title: string, message: string | React.ReactNode) => {
    showAlert({
      type: 'info',
      title,
      message
    })
  }, [showAlert])

  const showConfirm = useCallback((options: ConfirmOptions) => {
    showAlert({
      type: options.type || 'warning',
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      showCancel: true,
      onConfirm: options.onConfirm
    })
  }, [showAlert])

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    hideAlert
  }
}