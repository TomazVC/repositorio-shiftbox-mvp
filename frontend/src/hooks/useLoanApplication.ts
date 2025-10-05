import { useState, useEffect, useCallback } from 'react'
import { LoanApplication, ApprovalDetails } from '../types/wallet'
import { apiAdapter } from '../services/apiAdapter'
import { useToast } from './useToast'

export const useLoanApplication = (applicationId: number) => {
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const loadApplication = useCallback(async () => {
    if (!applicationId) return

    setIsLoading(true)
    setError(null)
    
    try {
      const app = await apiAdapter.getLoanApplicationById(applicationId)
      setApplication(app)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar solicitação'
      setError(errorMessage)
      addToast({
        type: 'error',
        message: `Erro: ${errorMessage}`
      })
    } finally {
      setIsLoading(false)
    }
  }, [applicationId, addToast])

  const updateApplication = async (status: 'approved' | 'rejected', approvalDetails?: ApprovalDetails) => {
    if (!application) return null

    try {
      let updatedApp: LoanApplication

      if (status === 'approved' && approvalDetails) {
        updatedApp = await apiAdapter.approveLoan(application.id, {
          approved_amount: approvalDetails.approved_amount,
          final_interest_rate: approvalDetails.final_interest_rate,
          comments: approvalDetails.comments,
          conditions: approvalDetails.conditions
        })
        
        addToast({
          type: 'success',
          message: `Empréstimo Aprovado: Solicitação #${application.id} aprovada com sucesso`
        })
      } else {
        updatedApp = await apiAdapter.rejectLoan(application.id, {
          comments: approvalDetails?.comments || 'Rejeitado pelo sistema'
        })
        
        addToast({
          type: 'info',
          message: `Empréstimo Rejeitado: Solicitação #${application.id} foi rejeitada`
        })
      }

      setApplication(updatedApp)
      return updatedApp
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar solicitação'
      setError(errorMessage)
      addToast({
        type: 'error',
        message: `Erro: ${errorMessage}`
      })
      throw err
    }
  }

  const performRiskAnalysis = async () => {
    if (!application) return

    try {
      // const riskData = await loanService.performRiskAnalysis(application.id)
      // Funcionalidade de análise de risco removida temporariamente
      console.warn('Risk analysis not implemented yet')
    } catch (err: any) {
      console.warn('Risk analysis failed:', err)
      // Não exibir erro pois é funcionalidade opcional
    }
  }

  useEffect(() => {
    loadApplication()
  }, [loadApplication])

  return {
    application,
    isLoading,
    error,
    loadApplication,
    updateApplication,
    performRiskAnalysis
  }
}

export const useLoanApplications = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const loadApplications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const apps = await apiAdapter.getAllLoanApplications()
      setApplications(apps)
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar solicitações'
      setError(errorMessage)
      addToast({
        type: 'error',
        message: `Erro: ${errorMessage}`
      })
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  const createApplication = async (_data: {
    user_id: number
    amount: number
    duration_months: number
    purpose: string
    monthly_income?: number
    company_name?: string
  }) => {
    try {
      // const newApp = await loanService.createApplication(_data)
      // Funcionalidade de criação removida temporariamente
      throw new Error('Criação de aplicação não implementada')
      
      // setApplications(prev => [newApp, ...prev])
      
      // addToast({
      //   type: 'success',
      //   message: `Solicitação Criada: Nova solicitação #${newApp.id} criada com sucesso`
      // })
      
      // return newApp
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar solicitação'
      addToast({
        type: 'error',
        message: `Erro: ${errorMessage}`
      })
      throw err
    }
  }

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  return {
    applications,
    isLoading,
    error,
    loadApplications,
    createApplication
  }
}