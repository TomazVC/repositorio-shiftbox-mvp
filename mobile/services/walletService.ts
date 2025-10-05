import { apiService, ApiError } from './api';
import { Wallet, Transaction, Investment } from '../types';

type InvestmentPayload = {
  userId: number;
  amount: number;
};

type WithdrawPayload = {
  walletId: number;
  amount: number;
  description?: string;
};

type TransactionFilter = {
  walletId: number;
};

class WalletService {
  async getWalletByUser(userId: number): Promise<Wallet> {
    try {
      return await apiService.get<Wallet>(`/wallets/user/${userId}`);
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  async getWallet(walletId: number): Promise<Wallet> {
    try {
      return await apiService.get<Wallet>(`/wallets/${walletId}`);
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  async getTransactions({ walletId }: TransactionFilter): Promise<Transaction[]> {
    try {
      return await apiService.get<Transaction[]>(`/wallets/${walletId}/transactions`);
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  async invest({ userId, amount }: InvestmentPayload): Promise<Investment> {
    try {
      const payload = {
        user_id: userId,
        valor: amount,
        taxa_rendimento: 0.12,
        rendimento_acumulado: 0,
        status: 'ativo',
      };

      return await apiService.post<Investment>('/investments', payload);
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  async withdraw({ walletId, amount, description }: WithdrawPayload): Promise<Transaction> {
    try {
      const payload = {
        wallet_id: walletId,
        tipo: 'saque',
        valor: amount,
        descricao: description ?? 'Saque da carteira',
      };

      return await apiService.post<Transaction>('/transactions', payload);
    } catch (error) {
      throw this.handleWalletError(error as ApiError);
    }
  }

  private handleWalletError(error: ApiError): Error {
    const errorMessages: Record<number, string> = {
      400: 'Dados inválidos. Verifique o valor e tente novamente.',
      401: 'Você precisa estar logado para acessar a carteira.',
      403: 'Operação não permitida.',
      404: 'Carteira não encontrada.',
      409: 'Saldo insuficiente para esta operação.',
      500: 'Erro interno do servidor. Tente novamente mais tarde.',
    };

    const message = errorMessages[error.status] || error.message || 'Erro desconhecido.';
    return new Error(message);
  }
}

export const walletService = new WalletService();

export default WalletService;