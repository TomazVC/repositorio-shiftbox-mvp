import axios from 'axios'

// Usar o proxy configurado no Vite para evitar problemas de CORS
// O Vite fará proxy de /api para http://localhost:8000
const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratamento de respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detalhado do erro
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Evitar redirect em loop se já estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    if (error.response?.status === 403) {
      console.warn('Acesso negado:', error.config.url)
    }
    
    if (error.response?.status === 404) {
      console.warn('Recurso não encontrado:', error.config.url)
    }
    
    if (error.response?.status >= 500) {
      console.error('Erro do servidor:', error.response.data)
    }
    
    return Promise.reject(error)
  }
)

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const handleAPIError = (error: any): APIError => {
  console.error('Handling API Error:', error)
  
  if (error.response) {
    const { status, data } = error.response
    
    // Mensagens específicas por status
    const statusMessages: { [key: number]: string } = {
      400: 'Dados inválidos enviados',
      401: 'Não autorizado. Faça login novamente',
      403: 'Acesso negado',
      404: 'Recurso não encontrado',
      409: 'Conflito de dados',
      422: 'Dados inválidos',
      429: 'Muitas tentativas. Tente novamente mais tarde',
      500: 'Erro interno do servidor',
      502: 'Servidor indisponível',
      503: 'Serviço temporariamente indisponível'
    }
    
    const message = data?.detail || 
                   data?.message || 
                   statusMessages[status] || 
                   `Erro HTTP ${status}`
    
    return new APIError(message, status, data?.code)
  }
  
  if (error.request) {
    // Erro de rede
    if (error.code === 'ECONNABORTED') {
      return new APIError('Tempo limite excedido. Tente novamente', 0, 'TIMEOUT')
    }
    
    return new APIError('Erro de conexão. Verifique sua internet', 0, 'NETWORK_ERROR')
  }
  
  // Erro genérico
  return new APIError(error.message || 'Erro inesperado', 0, 'UNKNOWN_ERROR')
}

export default api