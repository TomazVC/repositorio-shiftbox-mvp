import { useState, useCallback } from 'react'

interface UseRetryOptions {
  maxRetries?: number
  retryDelay?: number
  onError?: (error: Error) => void
}

interface RetryState {
  isLoading: boolean
  error: Error | null
  retryCount: number
  canRetry: boolean
}

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options: UseRetryOptions = {}
) {
  const { 
    maxRetries = 3, 
    retryDelay = 1000,
    onError 
  } = options

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    canRetry: true
  })

  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (isRetry = false) => {
    if (!isRetry) {
      setState(prev => ({ ...prev, retryCount: 0 }))
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }))

    try {
      const result = await asyncFunction()
      setData(result)
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: null,
        canRetry: true 
      }))
      return result
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
        retryCount: isRetry ? prev.retryCount + 1 : 1,
        canRetry: (isRetry ? prev.retryCount + 1 : 1) < maxRetries
      }))

      onError?.(errorObj)
      throw errorObj
    }
  }, [asyncFunction, maxRetries, onError])

  const retry = useCallback(async () => {
    if (!state.canRetry) return

    // Delay antes do retry
    if (retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }

    return execute(true)
  }, [execute, state.canRetry, retryDelay])

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      retryCount: 0,
      canRetry: true
    })
    setData(null)
  }, [])

  return {
    data,
    execute,
    retry,
    reset,
    ...state
  }
}

// Hook para operações com loading e error states simples
export function useAsyncOperation<T>() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await operation()
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    data,
    isLoading,
    error,
    execute,
    reset
  }
}