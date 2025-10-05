import api, { handleAPIError } from './api'
import { LoanApplication } from '../types/wallet'

export interface BackendLoan {
  id: number
  user_id: number
  amount: number
  interest_rate: number
  duration_months: number
  purpose: string
  status: string
  monthly_income?: number
  company_name?: string
  created_at: string
  updated_at: string
  approved_amount?: number
  final_interest_rate?: number
  approved_at?: string
  comments?: string
  conditions?: string[]
  user?: {
    id: number
    email: string
    cpf?: string
    name?: string
  }
}

export const loanService = {
  /**
   * Buscar todas as aplicações de empréstimo
   */
  async getAllApplications(): Promise<LoanApplication[]> {
    try {
      const response = await api.get('/loans')
      return response.data.map(this.transformBackendLoan)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Buscar aplicação específica por ID
   */
  async getApplicationById(id: number): Promise<LoanApplication> {
    try {
      const response = await api.get(`/loans/${id}`)
      return this.transformBackendLoan(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Criar nova aplicação de empréstimo
   */
  async createApplication(applicationData: {
    user_id: number
    amount: number
    duration_months: number
    purpose: string
    monthly_income?: number
    company_name?: string
  }): Promise<LoanApplication> {
    try {
      const response = await api.post('/loans', applicationData)
      return this.transformBackendLoan(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Aprovar empréstimo
   */
  async approveLoan(id: number, approvalData: {
    approved_amount: number
    final_interest_rate: number
    comments: string
    conditions?: string[]
  }): Promise<LoanApplication> {
    try {
      const response = await api.put(`/loans/${id}/approve`, approvalData)
      return this.transformBackendLoan(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Rejeitar empréstimo
   */
  async rejectLoan(id: number, rejectionData: {
    comments: string
  }): Promise<LoanApplication> {
    try {
      const response = await api.put(`/loans/${id}/reject`, rejectionData)
      return this.transformBackendLoan(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Realizar análise de risco (se disponível)
   */
  async performRiskAnalysis(applicationId: number) {
    try {
      const response = await api.post(`/loans/${applicationId}/risk-analysis`)
      return response.data
    } catch (error) {
      // Se não existir o endpoint, retorna null sem erro
      console.warn('Risk analysis endpoint not available:', error)
      return null
    }
  },

  /**
   * Transformar dados do backend para formato esperado pelo frontend
   */
  transformBackendLoan(backendLoan: BackendLoan): LoanApplication {
    return {
      id: backendLoan.id,
      user_id: backendLoan.user_id,
      requested_amount: backendLoan.amount,
      duration_months: backendLoan.duration_months,
      purpose: this.mapPurpose(backendLoan.purpose),
      application_date: backendLoan.created_at,
      status: this.mapStatus(backendLoan.status),
      proposed_interest_rate: backendLoan.interest_rate,
      applicant_info: {
        document: backendLoan.user?.cpf || '***.***.***-**',
        monthly_income: backendLoan.monthly_income || 5000,
        company_name: backendLoan.company_name || 'Empresa não informada'
      },
      // Análise de risco mockada por enquanto - pode ser implementada depois
      risk_analysis: {
        score: 0.7, // Score médio
        risk_level: this.calculateRiskLevel(backendLoan),
        factors: {
          income_verification: 0.8,
          credit_history: 0.7,
          debt_to_income: 0.6,
          employment_stability: 0.8,
          collateral_value: 0.5,
          positive: ['Renda comprovada', 'Histórico positivo'],
          negative: ['Primeira solicitação']
        },
        recommendations: ['Verificar documentação', 'Confirmar dados bancários']
      },
      // Detalhes da aprovação se existirem
      approval_details: backendLoan.approved_amount ? {
        approved: backendLoan.status === 'approved',
        approved_amount: backendLoan.approved_amount,
        final_interest_rate: backendLoan.final_interest_rate || backendLoan.interest_rate,
        approval_date: backendLoan.approved_at || backendLoan.updated_at,
        approved_by: 'sistema',
        comments: backendLoan.comments || '',
        conditions: backendLoan.conditions || []
      } : undefined
    }
  },

  /**
   * Mapear purpose do backend para frontend
   */
  mapPurpose(purpose: string): LoanApplication['purpose'] {
    const purposeMap: Record<string, LoanApplication['purpose']> = {
      'capital_giro': 'capital_giro',
      'expansao': 'expansao',
      'equipamentos': 'equipamentos',
      'marketing': 'marketing',
      'reforma': 'reforma'
    }
    return purposeMap[purpose] || 'outros'
  },

  /**
   * Mapear status do backend para frontend
   */
  mapStatus(status: string): LoanApplication['status'] {
    const statusMap: Record<string, LoanApplication['status']> = {
      'pending': 'pending',
      'under_review': 'under_review',
      'approved': 'approved',
      'rejected': 'rejected'
    }
    return statusMap[status] || 'pending'
  },

  /**
   * Calcular nível de risco baseado nos dados disponíveis
   */
  calculateRiskLevel(loan: BackendLoan): 'low' | 'medium' | 'high' {
    // Lógica simples para calcular risco
    const amount = loan.amount
    const income = loan.monthly_income || 5000
    const ratio = amount / (income * loan.duration_months)

    if (ratio < 0.3) return 'low'
    if (ratio < 0.6) return 'medium'
    return 'high'
  }
}