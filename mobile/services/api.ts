import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, TIMEOUT } from '../config/environment';

// Interface para resposta padrão da API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Interface para erros da API
export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Erro ao obter token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar respostas e erros
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        // Se token expirou, limpar storage e redirecionar para login
        if (error.response?.status === 401) {
          try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user_email');
            // Aqui poderia redirecionar para login se necessário
          } catch (storageError) {
            console.warn('Erro ao limpar storage:', storageError);
          }
        }

        // Formatar erro para interface padrão
        const apiError: ApiError = {
          message: error.response?.data?.detail || error.message || 'Erro desconhecido',
          status: error.response?.status || 500,
          details: error.response?.data,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Métodos HTTP básicos
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // Método para fazer upload de arquivos (futuro)
  async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  }
}

// Instância singleton do serviço
export const apiService = new ApiService();

// Exportar também a classe para casos específicos
export default ApiService;
