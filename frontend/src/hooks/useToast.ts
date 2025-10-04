import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback((message: string, options?: Partial<Toast>) => {
    return addToast({ ...options, message, type: 'success' })
  }, [addToast])

  const error = useCallback((message: string, options?: Partial<Toast>) => {
    return addToast({ ...options, message, type: 'error', duration: options?.duration ?? 8000 })
  }, [addToast])

  const warning = useCallback((message: string, options?: Partial<Toast>) => {
    return addToast({ ...options, message, type: 'warning' })
  }, [addToast])

  const info = useCallback((message: string, options?: Partial<Toast>) => {
    return addToast({ ...options, message, type: 'info' })
  }, [addToast])

  // Loading toast that can be updated
  const loading = useCallback((message: string) => {
    const id = addToast({ 
      message, 
      type: 'info', 
      duration: 0 // Don't auto-remove loading toasts
    })

    return {
      id,
      update: (newMessage: string) => {
        setToasts(prev => prev.map(toast => 
          toast.id === id ? { ...toast, message: newMessage } : toast
        ))
      },
      success: (successMessage: string) => {
        removeToast(id)
        success(successMessage)
      },
      error: (errorMessage: string) => {
        removeToast(id)
        error(errorMessage)
      },
      remove: () => removeToast(id)
    }
  }, [addToast, removeToast, success, error])

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
    loading
  }
}

