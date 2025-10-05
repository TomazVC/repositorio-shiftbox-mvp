import api, { handleAPIError } from './api'
import { LoanApplication } from '../types/wallet'

export interface BackendLoan {
  id: number
  user_id: number
  valor: number
  valor_pago: number
  taxa_juros: number
  prazo_meses: number
  status: 'pendente' | 'ativo' | 'pago' | 'rejeitado'
  created_at: string
  updated_at?: string
  approved_at?: string
  paid_at?: string
  motivo_rejeicao?: string
  user?: {
    id: number
    email: string
    full_name?: string
    cpf?: string
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
    valor: number
    prazo_meses: number
    taxa_juros?: number
  }): Promise<LoanApplication> {
    try {
      const payload = {
        user_id: applicationData.user_id,
        valor: applicationData.valor,
        valor_pago: 0,
        taxa_juros: applicationData.taxa_juros || 2.5,
        prazo_meses: applicationData.prazo_meses
      }
      const response = await api.post('/loans', payload)
      return this.transformBackendLoan(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Aprovar empréstimo
   */
  async approveLoan(id: number, approvalData: {
    taxa_juros?: number
    prazo_meses?: number
  }): Promise<LoanApplication> {
    try {
      const response = await api.post(`/loans/${id}/approve`, approvalData)
      return this.transformBackendLoan(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Rejeitar empréstimo
   */
  async rejectLoan(id: number, rejectionData: {
    motivo_rejeicao: string
  }): Promise<LoanApplication> {
    try {
      const response = await api.post(`/loans/${id}/reject`, rejectionData)
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
      requested_amount: backendLoan.valor,
      duration_months: backendLoan.prazo_meses,
      purpose: 'capital_giro', // Valor padrão já que não está no backend atual
      application_date: backendLoan.created_at,
      status: this.mapStatus(backendLoan.status),
      proposed_interest_rate: backendLoan.taxa_juros,
      applicant_info: {
        document: backendLoan.user?.cpf || '***.***.***-**',
        monthly_income: 5000, // Valor padrão
        company_name: 'Empresa não informada'
      },
      risk_analysis: {
        score: 0.7,
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
      approval_details: backendLoan.status === 'ativo' ? {
        approved: true,
        approved_amount: backendLoan.valor,
        final_interest_rate: backendLoan.taxa_juros,
        approval_date: backendLoan.approved_at || backendLoan.created_at,
        approved_by: 'sistema',
        comments: '',
        conditions: []
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
      'pendente': 'pending',
      'ativo': 'approved',
      'pago': 'approved',
      'rejeitado': 'rejected'
    }
    return statusMap[status] || 'pending'
  },

  /**
   * Calcular nível de risco baseado nos dados disponíveis
   */
  calculateRiskLevel(loan: BackendLoan): 'low' | 'medium' | 'high' {
    // Lógica simples para calcular risco
    const amount = loan.valor
    const income = 5000 // Valor padrão
    const ratio = amount / (income * loan.prazo_meses)

    if (ratio < 0.3) return 'low'
    if (ratio < 0.6) return 'medium'
    return 'high'
  }
}