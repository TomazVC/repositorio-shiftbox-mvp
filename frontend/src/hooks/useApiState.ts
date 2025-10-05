import { useState, useCallback } from 'react'

export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  success: boolean
}

export function useApiState<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  })

  const setLoading = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }))
  }, [])

  const setSuccess = useCallback((data: T) => {
    setState({ data, loading: false, error: null, success: true })
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, loading: false, error, success: false }))
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, success: false })
  }, [])

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    try {
      setLoading()
      const result = await apiCall()
      setSuccess(result)
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado'
      setError(errorMessage)
      throw error
    }
  }, [setLoading, setSuccess, setError])

  return {
    ...state,
    setLoading,
    setSuccess,
    setError,
    reset,
    execute
  }
}

export default useApiState