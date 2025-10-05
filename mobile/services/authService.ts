import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, ApiError } from './api';
import { DEFAULT_AVATAR_BASE64 } from '../constants';
import { UserProfile } from '../types';

type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  dateOfBirth: string;
  profileImageBase64?: string;
};

type AuthResponse = {
  token: string;
  user_id: number;
  email: string;
};

class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_EMAIL_KEY = 'user_email';
  private readonly USER_ID_KEY = 'user_id';
  private readonly USER_NAME_KEY = 'user_name';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.postForm<AuthResponse>('/auth/login', {
        username: credentials.email,
        password: credentials.password,
        grant_type: 'password',
        scope: '',
      });

      await this.saveAuthData(response);
      await this.fetchAndCacheProfile();

      return response;
    } catch (error) {
      throw this.handleAuthError(error as ApiError);
    }
  }

  async register(data: RegisterData): Promise<UserProfile> {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        cpf: data.cpf,
        date_of_birth: data.dateOfBirth,
        profile_image_base64: data.profileImageBase64 || DEFAULT_AVATAR_BASE64,
      };

      return await apiService.post<UserProfile>('/auth/register', payload);
    } catch (error) {
      throw this.handleAuthError(error as ApiError);
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.TOKEN_KEY,
        this.USER_EMAIL_KEY,
        this.USER_ID_KEY,
        this.USER_NAME_KEY,
      ]);
    } catch (error) {
      console.warn('Erro ao fazer logout:', error);
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      return Boolean(token);
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const token = await AsyncStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return null;
    }

    try {
      return await this.fetchAndCacheProfile();
    } catch (error) {
      console.warn('Erro ao obter usuário atual:', error);
      const fallbackId = await AsyncStorage.getItem(this.USER_ID_KEY);
      const fallbackEmail = await AsyncStorage.getItem(this.USER_EMAIL_KEY);
      const fallbackName = await AsyncStorage.getItem(this.USER_NAME_KEY);

      if (fallbackId && fallbackEmail) {
        return {
          id: Number.parseInt(fallbackId, 10),
          email: fallbackEmail,
          full_name: fallbackName ?? fallbackEmail,
        };
      }

      return null;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.warn('Erro ao obter token:', error);
      return null;
    }
  }

  private async saveAuthData(authData: AuthResponse): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [this.TOKEN_KEY, authData.token],
        [this.USER_EMAIL_KEY, authData.email],
        [this.USER_ID_KEY, authData.user_id.toString()],
      ]);
    } catch (error) {
      console.warn('Erro ao salvar dados de autenticação:', error);
      throw new Error('Erro ao salvar dados de login.');
    }
  }

  private async fetchAndCacheProfile(): Promise<UserProfile> {
    const profile = await apiService.get<UserProfile>('/auth/me');

    await AsyncStorage.multiSet([
      [this.USER_ID_KEY, profile.id.toString()],
      [this.USER_EMAIL_KEY, profile.email],
      [this.USER_NAME_KEY, profile.full_name ?? profile.email],
    ]);

    return profile;
  }

  private handleAuthError(error: ApiError): Error {
    const backendDetail =
      (typeof error.details === 'object' &&
        error.details !== null &&
        ('detail' in error.details
          ? (error.details as any).detail
          : 'message' in error.details
          ? (error.details as any).message
          : 'error' in error.details
          ? (error.details as any).error
          : undefined)) ||
      undefined;

    const fallbackMessages: Record<number, string> = {
      400: 'Dados inválidos. Verifique e tente novamente.',
      401: 'E-mail ou senha incorretos.',
      409: 'Este e-mail ou CPF já está cadastrado.',
      422: 'Dados inválidos. Confira os campos enviados.',
      500: 'Erro interno do servidor. Tente novamente mais tarde.',
    };

    const message =
      (backendDetail && String(backendDetail)) ||
      fallbackMessages[error.status] ||
      error.message ||
      'Erro desconhecido.';

    return new Error(message);
  }
}

export const authService = new AuthService();

export default AuthService;