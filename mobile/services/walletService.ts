import { apiService, ApiError } from './api';

// Interfaces para carteira
export interface Wallet {
  id: number;
  user_id: number;
  saldo: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  type: 'deposit' | 'withdraw' | 'investment' | 'loan' | 'return';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface InvestmentRequest {
  amount: number;
  description?: string;
}

export interface WithdrawRequest {
  amount: number;
  description?: string;
}

class WalletService {
  // Obter saldo da carteira
  async getWallet(): Promise<Wallet> {
    try {
      const response = await apiService.get<Wallet>('/wallet');
      return response;
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  // Obter histórico de transações
  async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiService.get<Transaction[]>('/transactions');
      return response;
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  // Fazer investimento
  async invest(data: InvestmentRequest): Promise<{ message: string; investment_id: number }> {
    try {
      const response = await apiService.post('/investments', data);
      return response;
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  // Sacar dinheiro
  async withdraw(data: WithdrawRequest): Promise<{ message: string; transaction_id: number }> {
    try {
      const response = await apiService.post('/wallet/withdraw', data);
      return response;
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  // Depositar dinheiro
  async deposit(data: WithdrawRequest): Promise<{ message: string; transaction_id: number }> {
    try {
      const response = await apiService.post('/wallet/deposit', data);
      return response;
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  // Tratar erros específicos da carteira
  private handleWalletError(error: ApiError): Error {
    const errorMessages: { [key: number]: string } = {
      400: 'Dados inválidos. Verifique o valor e tente novamente',
      401: 'Você precisa estar logado para acessar sua carteira',
      403: 'Operação não permitida',
      404: 'Carteira não encontrada',
      409: 'Saldo insuficiente para esta operação',
      500: 'Erro interno do servidor. Tente novamente mais tarde',
    };

    const message = errorMessages[error.status] || error.message || 'Erro desconhecido';
    return new Error(message);
  }
}

// Instância singleton do serviço
export const walletService = new WalletService();

// Exportar também a classe
export default WalletService;
