import { apiService, ApiError } from './api';
import { Loan } from '../types';

type LoanRequestPayload = {
  userId: number;
  amount: number;
  installments: number;
};

type LoanRequestResponse = Loan;

type LoanListParams = {
  userId?: number;
};

class LoanService {
  async requestLoan({ userId, amount, installments }: LoanRequestPayload): Promise<LoanRequestResponse> {
    try {
      const payload = {
        user_id: userId,
        valor: amount,
        valor_pago: 0,
        taxa_juros: 0.15,
        prazo_meses: installments,
        status: 'pendente',
      };

      return await apiService.post<Loan>('/loans', payload);
    } catch (error) {
      throw this.handleLoanError(error as ApiError);
    }
  }

  async approveLoan(loanId: number): Promise<Loan> {
    try {
      return await apiService.post<Loan>(`/loans/${loanId}/approve`, {});
    } catch (error) {
      throw this.handleLoanError(error as ApiError);
    }
  }

  async getLoans(params?: LoanListParams): Promise<Loan[]> {
    try {
      const query = params?.userId ? `?user_id=${params.userId}` : '';
      return await apiService.get<Loan[]>(`/loans${query}`);
    } catch (error) {
      throw this.handleLoanError(error as ApiError);
    }
  }

  private handleLoanError(error: ApiError): Error {
    const errorMessages: Record<number, string> = {
      400: 'Dados inválidos. Verifique os valores e tente novamente.',
      401: 'Você precisa estar logado para solicitar empréstimos.',
      403: 'Operação não permitida.',
      404: 'Empréstimo não encontrado.',
      409: 'Pool sem saldo suficiente para este empréstimo.',
      500: 'Erro interno do servidor. Tente novamente mais tarde.',
    };

    const message = errorMessages[error.status] || error.message || 'Erro desconhecido.';
    return new Error(message);
  }
}

export const loanService = new LoanService();

export default LoanService;