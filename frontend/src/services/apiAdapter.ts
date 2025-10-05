import { loanService } from './loanService'
import { userService } from './userService'
import { investmentService } from './investmentService'
import { walletService } from './walletService'
import * as mockData from '../data/mockData'

// Tentar usar API real primeiro, com fallback para mock
const USE_REAL_API = true

export class ApiAdapter {
  /**
   * Tentar usar API real primeiro, fazer fallback para mock se falhar
   */
  private async tryApiThenMock<T>(
    apiCall: () => Promise<T>,
    mockCall: () => T,
    operationName: string
  ): Promise<T> {
    if (!USE_REAL_API) {
      console.log(`Using mock data for ${operationName}`)
      return mockCall()
    }

    try {
      console.log(`Trying real API for ${operationName}`)
      return await apiCall()
    } catch (error: any) {
      console.warn(`API failed for ${operationName}, using mock:`, error?.message || error)
      
      // Se for erro de rede, exibir mensagem mais clara
      if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        console.warn(`⚠️  Backend appears to be offline. Using mock data for ${operationName}`)
      }
      
      return mockCall()
    }
  }

  // Loans
  async getLoanApplicationById(id: number) {
    return this.tryApiThenMock(
      () => loanService.getApplicationById(id),
      () => {
        const app = mockData.getLoanApplicationById(id)
        if (!app) throw new Error('Loan application not found')
        return app
      },
      'getLoanApplicationById'
    )
  }

  async getAllLoanApplications() {
    return this.tryApiThenMock(
      () => loanService.getAllApplications(),
      () => mockData.mockLoanApplications,
      'getAllLoanApplications'
    )
  }

  async approveLoan(id: number, approvalData: any) {
    return this.tryApiThenMock(
      () => loanService.approveLoan(id, approvalData),
      () => {
        const app = mockData.getLoanApplicationById(id)
        if (!app) throw new Error('Loan application not found')
        
        const updatedApp = {
          ...app,
          status: 'approved' as const,
          approval_details: {
            approved: true,
            approved_amount: approvalData.approved_amount,
            final_interest_rate: approvalData.final_interest_rate,
            approval_date: new Date().toISOString().split('T')[0],
            approved_by: 'mock_system',
            comments: approvalData.comments,
            conditions: approvalData.conditions || []
          }
        }
        mockData.updateLoanApplication(updatedApp)
        return updatedApp
      },
      'approveLoan'
    )
  }

  async rejectLoan(id: number, rejectionData: any) {
    return this.tryApiThenMock(
      () => loanService.rejectLoan(id, rejectionData),
      () => {
        const app = mockData.getLoanApplicationById(id)
        if (!app) throw new Error('Loan application not found')
        
        const updatedApp = {
          ...app,
          status: 'rejected' as const,
          approval_details: {
            approved: false,
            approved_amount: 0,
            final_interest_rate: 0,
            approval_date: new Date().toISOString().split('T')[0],
            approved_by: 'mock_system',
            comments: rejectionData.comments,
            conditions: []
          }
        }
        mockData.updateLoanApplication(updatedApp)
        return updatedApp
      },
      'rejectLoan'
    )
  }

  // Users
  async getAllUsers() {
    return this.tryApiThenMock(
      () => userService.getAllUsers(),
      () => mockData.mockUsers,
      'getAllUsers'
    )
  }

  // Investments
  async getAllInvestments() {
    return this.tryApiThenMock(
      () => investmentService.getAllInvestments(),
      () => mockData.mockInvestments,
      'getAllInvestments'
    )
  }

  // Pool
  async getPoolStatus() {
    return this.tryApiThenMock(
      async () => {
        const response = await fetch('http://localhost:8000/pool')
        if (!response.ok) throw new Error('Pool API failed')
        return response.json()
      },
      () => ({
        total_invested: 50000,
        total_available: 25000,
        total_loans: 30000,
        utilization_rate: 0.6,
        investors_count: 15,
        borrowers_count: 8,
        avg_return_rate: 1.2
      }),
      'getPoolStatus'
    )
  }

  // Wallet
  async getUserWallet(userId: number) {
    return this.tryApiThenMock(
      () => walletService.getUserWallet(userId),
      () => {
        const user = mockData.mockUsers.find(u => u.id === userId)
        if (!user) throw new Error('User not found')
        
        return {
          id: userId,
          user_id: userId,
          available_balance: user.saldo,
          blocked_balance: 0,
          total_balance: user.saldo,
          last_updated: new Date().toISOString()
        }
      },
      'getUserWallet'
    )
  }

  async getUserTransactions(userId: number) {
    return this.tryApiThenMock(
      () => walletService.getUserTransactions(userId),
      () => mockData.getTransactionsByUserId(userId),
      'getUserTransactions'
    )
  }

  async processDeposit(userId: number, amount: number, pixKey?: string) {
    return this.tryApiThenMock(
      () => walletService.processDeposit(userId, amount, pixKey),
      () => {
        const newTransaction = {
          id: Date.now(),
          user_id: userId,
          type: 'deposit' as const,
          amount: amount,
          status: 'completed' as const,
          description: pixKey ? `Depósito via PIX - Chave: ${pixKey}` : 'Depósito',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          reference_id: `PIX${Date.now()}`,
          metadata: { pix_key: pixKey }
        }
        
        // Atualizar saldo do usuário no mock
        const user = mockData.mockUsers.find(u => u.id === userId)
        if (user) {
          user.saldo += amount
        }
        
        return newTransaction
      },
      'processDeposit'
    )
  }

  async processWithdraw(userId: number, amount: number, pixKey: string) {
    return this.tryApiThenMock(
      () => walletService.processWithdraw(userId, amount, pixKey),
      () => {
        const user = mockData.mockUsers.find(u => u.id === userId)
        if (!user) throw new Error('User not found')
        if (user.saldo < amount) throw new Error('Saldo insuficiente')
        
        const newTransaction = {
          id: Date.now(),
          user_id: userId,
          type: 'withdraw' as const,
          amount: -amount,
          status: 'completed' as const,
          description: `Saque via PIX - Chave: ${pixKey}`,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          reference_id: `PIX${Date.now()}`,
          metadata: { pix_key: pixKey }
        }
        
        // Atualizar saldo do usuário no mock
        user.saldo -= amount
        
        return newTransaction
      },
      'processWithdraw'
    )
  }
}

export const apiAdapter = new ApiAdapter()