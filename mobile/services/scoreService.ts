import { apiService } from './api';
import { ApiResponse } from '../types';
import { CreditScoreData } from '../types';

export interface ScoreService {
  getUserScore(userId: number): Promise<CreditScoreData>;
  updateScore(userId: number, factors: any): Promise<CreditScoreData>;
}

class ScoreServiceImpl implements ScoreService {
  async getUserScore(userId: number): Promise<CreditScoreData> {
    try {
      const response = await apiService.get<ApiResponse<CreditScoreData>>(`/users/${userId}/score`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar score do usuário:', error);
      throw new Error(error.response?.data?.message || 'Erro ao carregar score');
    }
  }

  async updateScore(userId: number, factors: any): Promise<CreditScoreData> {
    try {
      const response = await apiService.post<ApiResponse<CreditScoreData>>(`/users/${userId}/score/update`, factors);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar score:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar score');
    }
  }
}

export const scoreService = new ScoreServiceImpl();