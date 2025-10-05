import { useState, useEffect, useCallback } from 'react'
import { investmentService, FrontendInvestment } from '../services/investmentService'
import { useToast } from './useToast'

export const useInvestments = () => {
  const [investments, setInvestments] = useState<FrontendInvestment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState({
    totalInvested: 0,
    totalActive: 0,
    totalReturns: 0,
    activeInvestments: 0,
    completedInvestments: 0,
    averageReturn: 0
  })
  const { success, error: errorToast } = useToast()

  const loadInvestments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const investmentsData = await investmentService.getAllInvestments()
      setInvestments(investmentsData)
      
      // Carregar métricas
      const metricsData = await investmentService.getInvestmentMetrics()
      setMetrics(metricsData)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar investimentos'
      setError(errorMessage)
      errorToast(`Erro: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [errorToast])

  const createInvestment = async (investmentData: {
    user_id: number
    amount: number
    duration_months?: number
    interest_rate?: number
  }) => {
    // Validar dados antes de enviar
    const validation = investmentService.validateInvestmentData(investmentData)
    if (!validation.isValid) {
      errorToast(`Dados inválidos: ${validation.errors.join(', ')}`)
      throw new Error(validation.errors.join(', '))
    }

    try {
      const newInvestment = await investmentService.createInvestment(investmentData)
      setInvestments(prev => [newInvestment, ...prev])
      
      // Recarregar métricas
      const metricsData = await investmentService.getInvestmentMetrics()
      setMetrics(metricsData)
      
      success(`Investimento de ${formatCurrency(newInvestment.valor)} criado com sucesso`)
      return newInvestment
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar investimento'
      errorToast(`Erro: ${errorMessage}`)
      throw err
    }
  }

  const updateInvestment = async (id: number, updateData: {
    status?: 'active' | 'completed' | 'cancelled'
    interest_rate?: number
    notes?: string
  }) => {
    try {
      const updatedInvestment = await investmentService.updateInvestment(id, updateData)
      setInvestments(prev => prev.map(investment => 
        investment.id === id ? updatedInvestment : investment
      ))
      
      // Recarregar métricas
      const metricsData = await investmentService.getInvestmentMetrics()
      setMetrics(metricsData)
      
      success(`Investimento #${id} atualizado com sucesso`)
      return updatedInvestment
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar investimento'
      errorToast(`Erro: ${errorMessage}`)
      throw err
    }
  }

  const redeemInvestment = async (id: number) => {
    try {
      const updatedInvestment = await investmentService.redeemInvestment(id)
      setInvestments(prev => prev.map(investment => 
        investment.id === id ? updatedInvestment : investment
      ))
      
      // Recarregar métricas
      const metricsData = await investmentService.getInvestmentMetrics()
      setMetrics(metricsData)
      
      success(`Investimento #${id} resgatado com sucesso`)
      return updatedInvestment
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao resgatar investimento'
      errorToast(`Erro: ${errorMessage}`)
      throw err
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  useEffect(() => {
    loadInvestments()
  }, [loadInvestments])

  return {
    investments,
    metrics,
    isLoading,
    error,
    loadInvestments,
    createInvestment,
    updateInvestment,
    redeemInvestment,
    formatCurrency
  }
}

export const useInvestmentsByUser = (userId: number) => {
  const [investments, setInvestments] = useState<FrontendInvestment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: errorToast } = useToast()

  const loadUserInvestments = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)
    
    try {
      const investmentsData = await investmentService.getInvestmentsByUser(userId)
      setInvestments(investmentsData)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar investimentos do usuário'
      setError(errorMessage)
      errorToast(`Erro: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [userId, errorToast])

  const createInvestment = async (investmentData: {
    amount: number
    duration_months?: number
    interest_rate?: number
  }) => {
    const fullData = { ...investmentData, user_id: userId }
    
    // Validar dados antes de enviar
    const validation = investmentService.validateInvestmentData(fullData)
    if (!validation.isValid) {
      errorToast(`Dados inválidos: ${validation.errors.join(', ')}`)
      throw new Error(validation.errors.join(', '))
    }

    try {
      const newInvestment = await investmentService.createInvestment(fullData)
      setInvestments(prev => [newInvestment, ...prev])
      
      success(`Investimento de ${formatCurrency(newInvestment.valor)} criado com sucesso`)
      return newInvestment
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar investimento'
      errorToast(`Erro: ${errorMessage}`)
      throw err
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  useEffect(() => {
    loadUserInvestments()
  }, [loadUserInvestments])

  return {
    investments,
    isLoading,
    error,
    loadUserInvestments,
    createInvestment,
    formatCurrency
  }
}