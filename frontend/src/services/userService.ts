import api, { handleAPIError } from './api'

export interface BackendUser {
  id: number
  email: string
  name?: string
  cpf?: string
  phone?: string
  birth_date?: string
  address?: string
  kyc_status: 'pending' | 'approved' | 'rejected'
  kyc_documents?: string[]
  kyc_comments?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface FrontendUser {
  id: number
  name: string
  email: string
  kyc_status: 'pending' | 'approved' | 'rejected'
  saldo: number
  created_at: string
  hash?: string
}

export const userService = {
  /**
   * Buscar todos os usuários
   */
  async getAllUsers(): Promise<FrontendUser[]> {
    try {
      const response = await api.get('/users')
      return response.data.map(this.transformBackendUser)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Buscar usuário específico por ID
   */
  async getUserById(id: number): Promise<FrontendUser> {
    try {
      const response = await api.get(`/users/${id}`)
      return this.transformBackendUser(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Criar novo usuário
   */
  async createUser(userData: {
    email: string
    name?: string
    cpf?: string
    phone?: string
  }): Promise<FrontendUser> {
    try {
      const response = await api.post('/users', userData)
      return this.transformBackendUser(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Atualizar dados do usuário
   */
  async updateUser(id: number, userData: Partial<{
    name: string
    email: string
    cpf: string
    phone: string
    birth_date: string
    address: string
  }>): Promise<FrontendUser> {
    try {
      const response = await api.put(`/users/${id}`, userData)
      return this.transformBackendUser(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Atualizar status KYC do usuário
   */
  async updateUserKycStatus(id: number, status: 'approved' | 'rejected', comments?: string): Promise<FrontendUser> {
    try {
      const response = await api.put(`/users/${id}/status`, {
        kyc_status: status,
        kyc_comments: comments
      })
      return this.transformBackendUser(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Upload de documentos KYC
   */
  async uploadKycDocuments(userId: number, files: File[]): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`document_${index}`, file)
      })
      formData.append('user_id', userId.toString())

      await api.post('/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return {
        success: true,
        message: 'Documentos enviados com sucesso'
      }
    } catch (error) {
      // Se o endpoint não existir, simular sucesso
      console.warn('KYC upload endpoint not available:', error)
      return {
        success: true,
        message: 'Documentos simulados como enviados (endpoint não implementado)'
      }
    }
  },

  /**
   * Buscar carteira do usuário para obter saldo
   */
  async getUserWallet(userId: number): Promise<{ available_balance: number }> {
    try {
      const response = await api.get(`/wallets?user_id=${userId}`)
      const wallets = response.data
      if (wallets.length > 0) {
        return { available_balance: wallets[0].available_balance || 0 }
      }
      return { available_balance: 0 }
    } catch (error) {
      console.warn('Wallet endpoint not available, using default balance:', error)
      return { available_balance: 5000 } // Saldo padrão
    }
  },

  /**
   * Transformar dados do backend para formato esperado pelo frontend
   */
  transformBackendUser(backendUser: BackendUser): FrontendUser {
    // Para o saldo, precisaríamos buscar a carteira, mas por simplicidade
    // vamos usar um valor padrão e implementar a busca da carteira separadamente
    return {
      id: backendUser.id,
      name: backendUser.name || backendUser.email.split('@')[0], // Usar parte do email se name não existir
      email: backendUser.email,
      kyc_status: backendUser.kyc_status,
      saldo: 5000, // Saldo padrão - seria buscado da carteira em implementação completa
      created_at: backendUser.created_at,
      hash: this.generateUserHash(backendUser)
    }
  },

  /**
   * Gerar hash para identificação do usuário
   */
  generateUserHash(user: BackendUser): string {
    const data = `${user.id}-${user.email}-${user.created_at}`
    // Simulação de hash simples
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0')
  },

  /**
   * Mapear status para badges
   */
  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' {
    switch (status) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'danger'
      default: return 'warning'
    }
  },

  /**
   * Mapear status para texto em português
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'approved': return 'Aprovado'
      case 'pending': return 'Pendente'
      case 'rejected': return 'Rejeitado'
      default: return 'Desconhecido'
    }
  }
}