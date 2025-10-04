import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const styles = {
    success: { bg: 'var(--color-green)', text: 'white' },
    error: { bg: 'var(--color-red)', text: 'white' },
    info: { bg: 'var(--color-blue)', text: 'white' },
    warning: { bg: 'var(--color-yellow)', text: 'white' },
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div 
        className="px-6 py-4 flex items-center gap-3 min-w-[300px]"
        style={{
          backgroundColor: styles[type].bg,
          color: styles[type].text,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <span className="text-2xl">{icons[type]}</span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-xl font-bold transition-opacity hover:opacity-80"
          style={{ color: styles[type].text }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

