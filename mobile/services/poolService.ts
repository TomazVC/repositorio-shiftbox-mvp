import { apiService, ApiError } from './api';

// Interface para status do pool
export interface PoolStatus {
  saldo_total: number;
  saldo_disponivel: number;
  saldo_emprestado: number;
  percentual_utilizacao: number;
  total_investidores: number;
}

class PoolService {
  // Obter status do pool
  async getPoolStatus(): Promise<PoolStatus> {
    try {
      const response = await apiService.get<PoolStatus>('/pool');
      return response;
    } catch (error) {
      throw this.handlePoolError(error as ApiError);
    }
  }

  // Tratar erros específicos do pool
  private handlePoolError(error: ApiError): Error {
    const errorMessages: { [key: number]: string } = {
      400: 'Dados inválidos',
      401: 'Você precisa estar logado para acessar o pool',
      500: 'Erro interno do servidor. Tente novamente mais tarde',
    };

    const message = errorMessages[error.status] || error.message || 'Erro desconhecido';
    return new Error(message);
  }
}

// Instância singleton do serviço
export const poolService = new PoolService();

// Exportar também a classe
export default PoolService;
