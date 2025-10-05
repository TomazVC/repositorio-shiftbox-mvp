import api, { handleAPIError } from './api'

// Interfaces do backend
export interface BackendWallet {
  id: number
  user_id: number
  saldo: number
  created_at: string
  updated_at: string
}

export interface BackendTransaction {
  id: number
  wallet_id: number
  tipo: string
  valor: number
  descricao: string
  created_at: string
  related_investment_id?: number
  related_loan_id?: number
}

// Interfaces do frontend
export interface FrontendWallet {
  id: number
  user_id: number
  available_balance: number
  blocked_balance: number
  total_balance: number
  last_updated: string
}

export interface FrontendTransaction {
  id: number
  user_id: number
  type: 'deposit' | 'withdraw' | 'investment' | 'loan_disbursement' | 'loan_payment' | 'interest_distribution'
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description: string
  created_at: string
  completed_at?: string
  reference_id?: string
  metadata?: {
    pix_key?: string
    qr_code?: string
    bank_slip?: string
    loan_id?: number
    investment_id?: number
  }
}

export const walletService = {
  /**
   * Buscar carteira do usuário
   */
  async getUserWallet(userId: number): Promise<FrontendWallet> {
    try {
      const response = await api.get(`/wallets?user_id=${userId}`)
      const wallets = response.data
      
      if (wallets.length === 0) {
        throw new Error('Carteira não encontrada para este usuário')
      }

      return this.transformBackendWallet(wallets[0])
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Buscar carteira por ID
   */
  async getWalletById(walletId: number): Promise<FrontendWallet> {
    try {
      const response = await api.get(`/wallets/${walletId}`)
      return this.transformBackendWallet(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Criar carteira para usuário
   */
  async createWallet(userId: number, initialBalance: number = 0): Promise<FrontendWallet> {
    try {
      const response = await api.post('/wallets', {
        user_id: userId,
        saldo: initialBalance
      })
      return this.transformBackendWallet(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Atualizar saldo da carteira
   */
  async updateWalletBalance(walletId: number, newBalance: number): Promise<FrontendWallet> {
    try {
      const response = await api.patch(`/wallets/${walletId}`, {
        saldo: newBalance
      })
      return this.transformBackendWallet(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Buscar transações de uma carteira
   */
  async getWalletTransactions(walletId: number): Promise<FrontendTransaction[]> {
    try {
      const response = await api.get(`/wallets/${walletId}/transactions`)
      return response.data.map(this.transformBackendTransaction)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Buscar todas as transações (com filtros opcionais)
   */
  async getAllTransactions(filters?: {
    walletId?: number
    tipo?: string
    skip?: number
    limit?: number
  }): Promise<FrontendTransaction[]> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.walletId) params.append('wallet_id', filters.walletId.toString())
      if (filters?.tipo) params.append('tipo', filters.tipo)
      if (filters?.skip) params.append('skip', filters.skip.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await api.get(`/transactions?${params.toString()}`)
      return response.data.map(this.transformBackendTransaction)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Buscar transação específica
   */
  async getTransactionById(transactionId: number): Promise<FrontendTransaction> {
    try {
      const response = await api.get(`/transactions/${transactionId}`)
      return this.transformBackendTransaction(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Criar nova transação
   */
  async createTransaction(transactionData: {
    wallet_id: number
    tipo: string
    valor: number
    descricao: string
    related_investment_id?: number
    related_loan_id?: number
  }): Promise<FrontendTransaction> {
    try {
      const response = await api.post('/transactions', transactionData)
      return this.transformBackendTransaction(response.data)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Processar depósito
   */
  async processDeposit(userId: number, amount: number, pixKey?: string): Promise<FrontendTransaction> {
    try {
      // Primeiro buscar a carteira do usuário
      const wallet = await this.getUserWallet(userId)
      
      // Criar transação de depósito
      return await this.createTransaction({
        wallet_id: wallet.id,
        tipo: 'deposito',
        valor: amount,
        descricao: pixKey ? `Depósito via PIX - Chave: ${pixKey}` : 'Depósito'
      })
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Processar saque
   */
  async processWithdraw(userId: number, amount: number, pixKey: string): Promise<FrontendTransaction> {
    try {
      // Primeiro buscar a carteira do usuário
      const wallet = await this.getUserWallet(userId)
      
      // Verificar se há saldo suficiente
      if (wallet.available_balance < amount) {
        throw new Error('Saldo insuficiente para realizar o saque')
      }
      
      // Criar transação de saque
      return await this.createTransaction({
        wallet_id: wallet.id,
        tipo: 'saque',
        valor: amount,
        descricao: `Saque via PIX - Chave: ${pixKey}`
      })
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Buscar transações por usuário
   */
  async getUserTransactions(userId: number): Promise<FrontendTransaction[]> {
    try {
      // Primeiro buscar a carteira do usuário
      const wallet = await this.getUserWallet(userId)
      
      // Depois buscar as transações da carteira
      return await this.getWalletTransactions(wallet.id)
    } catch (error) {
      throw handleAPIError(error)
    }
  },

  /**
   * Transformar dados do backend para formato esperado pelo frontend
   */
  transformBackendWallet(backendWallet: BackendWallet): FrontendWallet {
    return {
      id: backendWallet.id,
      user_id: backendWallet.user_id,
      available_balance: backendWallet.saldo,
      blocked_balance: 0, // Backend não tem esse campo ainda
      total_balance: backendWallet.saldo,
      last_updated: backendWallet.updated_at
    }
  },

  /**
   * Transformar transação do backend para frontend
   */
  transformBackendTransaction(backendTransaction: BackendTransaction): FrontendTransaction {
    return {
      id: backendTransaction.id,
      user_id: 0, // Será preenchido quando necessário
      type: this.mapTransactionType(backendTransaction.tipo),
      amount: backendTransaction.valor,
      status: 'completed', // Backend não tem status ainda, assumir completed
      description: backendTransaction.descricao,
      created_at: backendTransaction.created_at,
      completed_at: backendTransaction.created_at,
      reference_id: backendTransaction.id.toString(),
      metadata: {
        loan_id: backendTransaction.related_loan_id,
        investment_id: backendTransaction.related_investment_id
      }
    }
  },

  /**
   * Mapear tipos de transação do backend para frontend
   */
  mapTransactionType(backendType: string): 'deposit' | 'withdraw' | 'investment' | 'loan_disbursement' | 'loan_payment' | 'interest_distribution' {
    const typeMap: Record<string, FrontendTransaction['type']> = {
      'deposito': 'deposit',
      'saque': 'withdraw',
      'investimento': 'investment',
      'emprestimo_recebido': 'loan_disbursement',
      'pagamento_emprestimo': 'loan_payment',
      'rendimento': 'interest_distribution',
      'resgate_investimento': 'withdraw',
      'ajuste_saldo': 'deposit'
    }
    
    return typeMap[backendType] || 'deposit'
  },

  /**
   * Mapear tipos de transação do frontend para backend
   */
  mapTransactionTypeToBackend(frontendType: FrontendTransaction['type']): string {
    const typeMap: Record<FrontendTransaction['type'], string> = {
      'deposit': 'deposito',
      'withdraw': 'saque',
      'investment': 'investimento',
      'loan_disbursement': 'emprestimo_recebido',
      'loan_payment': 'pagamento_emprestimo',
      'interest_distribution': 'rendimento'
    }
    
    return typeMap[frontendType] || 'deposito'
  },

  /**
   * Formatar tipo de transação para exibição
   */
  getTransactionTypeLabel(type: FrontendTransaction['type']): string {
    const labels: Record<FrontendTransaction['type'], string> = {
      'deposit': 'Depósito',
      'withdraw': 'Saque',
      'investment': 'Investimento',
      'loan_disbursement': 'Empréstimo Recebido',
      'loan_payment': 'Pagamento de Empréstimo',
      'interest_distribution': 'Distribuição de Juros'
    }
    
    return labels[type] || 'Transação'
  },

  /**
   * Obter cor do badge por tipo de transação
   */
  getTransactionTypeColor(type: FrontendTransaction['type']): 'success' | 'danger' | 'warning' | 'info' {
    const colors: Record<FrontendTransaction['type'], 'success' | 'danger' | 'warning' | 'info'> = {
      'deposit': 'success',
      'withdraw': 'danger',
      'investment': 'info',
      'loan_disbursement': 'success',
      'loan_payment': 'warning',
      'interest_distribution': 'success'
    }
    
    return colors[type] || 'info'
  }
}