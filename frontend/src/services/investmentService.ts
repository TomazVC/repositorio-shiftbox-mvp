import api, { handleAPIError } from './api'

export interface BackendInvestment {
  id: number
  user_id: number
  valor: number
  taxa_rendimento: number
  rendimento_acumulado?: number
  status: 'ativo' | 'resgatado' | 'cancelado'
  created_at: string
  updated_at?: string
  resgatado_at?: string
  user?: {
    id: number
    email: string
    full_name?: string
  }
}

export interface FrontendInvestment {
  id: number
  user_id: number
  user_name: string
  valor: number
  status: 'ativo' | 'resgatado' | 'cancelado'
  created_at: string
  rentabilidade: number
}

export const investmentService = {
  /**
   * Buscar todos os investimentos
   */
  async getAllInvestments(): Promise<FrontendInvestment[]> {
    try {
      const response = await api.get('/investments')
      return response.data.map(this.transformBackendInvestment)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Buscar investimento específico por ID
   */
  async getInvestmentById(id: number): Promise<FrontendInvestment> {
    try {
      const response = await api.get(`/investments/${id}`)
      return this.transformBackendInvestment(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Buscar investimentos por usuário
   */
  async getInvestmentsByUser(userId: number): Promise<FrontendInvestment[]> {
    try {
      const response = await api.get(`/investments?user_id=${userId}`)
      return response.data.map(this.transformBackendInvestment)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Criar novo investimento
   */
  async createInvestment(investmentData: {
    user_id: number
    valor: number
    taxa_rendimento?: number
  }): Promise<FrontendInvestment> {
    try {
      const payload = {
        user_id: investmentData.user_id,
        valor: investmentData.valor,
        taxa_rendimento: investmentData.taxa_rendimento || 1.2,
        rendimento_acumulado: 0,
        status: 'ativo'
      }

      const response = await api.post('/investments', payload)
      return this.transformBackendInvestment(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Atualizar investimento
   */
  async updateInvestment(id: number, updateData: {
    status?: 'active' | 'completed' | 'cancelled'
    interest_rate?: number
    notes?: string
  }): Promise<FrontendInvestment> {
    try {
      const response = await api.put(`/investments/${id}`, updateData)
      return this.transformBackendInvestment(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Resgatar investimento
   */
  async redeemInvestment(id: number): Promise<FrontendInvestment> {
    try {
      const response = await api.post(`/investments/${id}/redeem`)
      return this.transformBackendInvestment(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Calcular métricas dos investimentos
   */
  async getInvestmentMetrics(): Promise<{
    totalInvested: number
    totalActive: number
    totalReturns: number
    activeInvestments: number
    completedInvestments: number
    averageReturn: number
  }> {
    try {
      const investments = await this.getAllInvestments()
      
      const totalInvested = investments.reduce((sum, inv) => sum + inv.valor, 0)
      const activeInvestments = investments.filter(inv => inv.status === 'ativo').length
      const completedInvestments = investments.filter(inv => inv.status === 'resgatado').length
      const totalActive = investments
        .filter(inv => inv.status === 'ativo')
        .reduce((sum, inv) => sum + inv.valor, 0)
      
      // Cálculo estimado de retornos (seria mais complexo na vida real)
      const totalReturns = investments
        .filter(inv => inv.status === 'resgatado')
        .reduce((sum, inv) => sum + (inv.valor * (inv.rentabilidade / 100)), 0)
      
      const averageReturn = investments.length > 0 
        ? investments.reduce((sum, inv) => sum + inv.rentabilidade, 0) / investments.length 
        : 0

      return {
        totalInvested,
        totalActive,
        totalReturns,
        activeInvestments,
        completedInvestments,
        averageReturn
      }
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Transformar dados do backend para formato esperado pelo frontend
   */
  transformBackendInvestment(backendInvestment: BackendInvestment): FrontendInvestment {
    return {
      id: backendInvestment.id,
      user_id: backendInvestment.user_id,
      user_name: backendInvestment.user?.full_name || 
                 backendInvestment.user?.email?.split('@')[0] || 
                 `Usuário ${backendInvestment.user_id}`,
      valor: backendInvestment.valor,
      status: backendInvestment.status,
      created_at: backendInvestment.created_at,
      rentabilidade: backendInvestment.taxa_rendimento || 1.2
    }
  },

  /**
   * Mapear status do backend para frontend
   */
  mapStatus(status: string): 'ativo' | 'resgatado' {
    switch (status) {
      case 'active': return 'ativo'
      case 'completed': return 'resgatado'
      case 'cancelled': return 'resgatado'
      default: return 'ativo'
    }
  },

  /**
   * Mapear status do frontend para backend
   */
  mapStatusToBackend(status: 'ativo' | 'resgatado'): 'active' | 'completed' {
    switch (status) {
      case 'ativo': return 'active'
      case 'resgatado': return 'completed'
      default: return 'active'
    }
  },

  /**
   * Obter cor do badge baseado no status
   */
  getStatusBadgeVariant(status: 'ativo' | 'resgatado'): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'ativo': return 'success'
      case 'resgatado': return 'warning'
      default: return 'warning'
    }
  },

  /**
   * Validar dados de investimento
   */
  validateInvestmentData(data: {
    user_id: number
    amount: number
    duration_months?: number
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.user_id || data.user_id <= 0) {
      errors.push('ID do usuário é obrigatório')
    }

    if (!data.amount || data.amount <= 0) {
      errors.push('Valor do investimento deve ser maior que zero')
    }

    if (data.amount && data.amount < 100) {
      errors.push('Valor mínimo de investimento é R$ 100,00')
    }

    if (data.duration_months && (data.duration_months < 1 || data.duration_months > 60)) {
      errors.push('Duração deve ser entre 1 e 60 meses')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}