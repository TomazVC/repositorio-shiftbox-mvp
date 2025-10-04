import { apiService, ApiError } from './api';

// Interfaces para empréstimos
export interface LoanRequest {
  amount: number;
  installments: number;
  purpose: string;
}

export interface Loan {
  id: number;
  user_id: number;
  amount: number;
  installments: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  purpose: string;
  created_at: string;
  updated_at: string;
}

class LoanService {
  // Solicitar empréstimo
  async requestLoan(data: LoanRequest): Promise<{ message: string; loan_id: number }> {
    try {
      const response = await apiService.post('/loans/request', data);
      return response;
    } catch (error) {
      throw this.handleLoanError(error as ApiError);
    }
  }

  // Obter empréstimos do usuário
  async getLoans(): Promise<Loan[]> {
    try {
      const response = await apiService.get<Loan[]>('/loans');
      return response;
    } catch (error) {
      throw this.handleLoanError(error as ApiError);
    }
  }

  // Obter detalhes de um empréstimo
  async getLoan(loanId: number): Promise<Loan> {
    try {
      const response = await apiService.get<Loan>(`/loans/${loanId}`);
      return response;
    } catch (error) {
      throw this.handleLoanError(error as ApiError);
    }
  }

  // Tratar erros específicos de empréstimos
  private handleLoanError(error: ApiError): Error {
    const errorMessages: { [key: number]: string } = {
      400: 'Dados inválidos. Verifique os valores e tente novamente',
      401: 'Você precisa estar logado para solicitar empréstimos',
      403: 'Operação não permitida',
      409: 'Pool sem saldo suficiente para este empréstimo',
      500: 'Erro interno do servidor. Tente novamente mais tarde',
    };

    const message = errorMessages[error.status] || error.message || 'Erro desconhecido';
    return new Error(message);
  }
}

// Instância singleton do serviço
export const loanService = new LoanService();

// Exportar também a classe
export default LoanService;
