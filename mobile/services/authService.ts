import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, ApiError } from './api';

// Interfaces para autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user_id: number;
  email: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_EMAIL_KEY = 'user_email';
  private readonly USER_ID_KEY = 'user_id';

  // Fazer login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', credentials);
      
      // Salvar dados no AsyncStorage
      await this.saveAuthData(response);
      
      return response;
    } catch (error) {
      throw this.handleAuthError(error as ApiError);
    }
  }

  // Registrar usuário
  async register(data: RegisterData): Promise<{ message: string; email: string }> {
    try {
      const response = await apiService.post('/auth/register', {
        email: data.email,
        password: data.password,
      });
      
      return response;
    } catch (error) {
      throw this.handleAuthError(error as ApiError);
    }
  }

  // Fazer logout
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.TOKEN_KEY,
        this.USER_EMAIL_KEY,
        this.USER_ID_KEY,
      ]);
    } catch (error) {
      console.warn('Erro ao fazer logout:', error);
    }
  }

  // Verificar se usuário está logado
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Obter dados do usuário logado
  async getCurrentUser(): Promise<User | null> {
    try {
      const email = await AsyncStorage.getItem(this.USER_EMAIL_KEY);
      const userId = await AsyncStorage.getItem(this.USER_ID_KEY);
      
      if (!email || !userId) {
        return null;
      }

      return {
        id: parseInt(userId, 10),
        email,
      };
    } catch (error) {
      console.warn('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  // Obter token atual
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.warn('Erro ao obter token:', error);
      return null;
    }
  }

  // Salvar dados de autenticação
  private async saveAuthData(authData: AuthResponse): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [this.TOKEN_KEY, authData.token],
        [this.USER_EMAIL_KEY, authData.email],
        [this.USER_ID_KEY, authData.user_id.toString()],
      ]);
    } catch (error) {
      console.warn('Erro ao salvar dados de autenticação:', error);
      throw new Error('Erro ao salvar dados de login');
    }
  }

  // Tratar erros de autenticação
  private handleAuthError(error: ApiError): Error {
    const errorMessages: { [key: number]: string } = {
      401: 'Email ou senha incorretos',
      400: 'Dados inválidos. Verifique as informações e tente novamente',
      409: 'Este email já está cadastrado',
      500: 'Erro interno do servidor. Tente novamente mais tarde',
    };

    const message = errorMessages[error.status] || error.message || 'Erro desconhecido';
    return new Error(message);
  }
}

// Instância singleton do serviço
export const authService = new AuthService();

// Exportar também a classe
export default AuthService;
