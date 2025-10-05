import { apiService } from './api';
import { ApiResponse, InvestmentDetailed, EarningsHistory, Projection } from '../types';

export interface InvestmentService {
  getUserInvestments(userId: string): Promise<InvestmentDetailed[]>;
  getInvestmentSummary(userId: string): Promise<{
    totalInvested: number;
    totalEarnings: number;
    currentYield: number;
  }>;
  getEarningsHistory(userId: string): Promise<EarningsHistory[]>;
  getProjections(userId: string): Promise<Projection[]>;
  redeemInvestment(investmentId: string): Promise<void>;
}

class InvestmentServiceImpl implements InvestmentService {
  async getUserInvestments(userId: string): Promise<InvestmentDetailed[]> {
    try {
      const response = await apiService.get<ApiResponse<InvestmentDetailed[]>>(`/users/${userId}/investments`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar investimentos:', error);
      throw new Error(error.response?.data?.message || 'Erro ao carregar investimentos');
    }
  }

  async getInvestmentSummary(userId: string): Promise<{
    totalInvested: number;
    totalEarnings: number;
    currentYield: number;
  }> {
    try {
      const response = await apiService.get<ApiResponse<{
        totalInvested: number;
        totalEarnings: number;
        currentYield: number;
      }>>(`/users/${userId}/investments/summary`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar resumo de investimentos:', error);
      throw new Error(error.response?.data?.message || 'Erro ao carregar resumo');
    }
  }

  async getEarningsHistory(userId: string): Promise<EarningsHistory[]> {
    try {
      const response = await apiService.get<ApiResponse<EarningsHistory[]>>(`/users/${userId}/earnings`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar histórico de rendimentos:', error);
      throw new Error(error.response?.data?.message || 'Erro ao carregar histórico');
    }
  }

  async getProjections(userId: string): Promise<Projection[]> {
    try {
      const response = await apiService.get<ApiResponse<Projection[]>>(`/users/${userId}/projections`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar projeções:', error);
      throw new Error(error.response?.data?.message || 'Erro ao carregar projeções');
    }
  }

  async redeemInvestment(investmentId: string): Promise<void> {
    try {
      await apiService.post<ApiResponse<void>>(`/investments/${investmentId}/redeem`);
    } catch (error: any) {
      console.error('Erro ao resgatar investimento:', error);
      throw new Error(error.response?.data?.message || 'Erro ao resgatar investimento');
    }
  }
}

export const investmentService = new InvestmentServiceImpl();