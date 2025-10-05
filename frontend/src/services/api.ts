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
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
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

export const handleAPIError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response
    throw new APIError(
      data.detail || data.message || 'Erro na API',
      status,
      data.code
    )
  }
  
  if (error.request) {
    throw new APIError('Erro de conexão com o servidor', 0)
  }
  
  throw new APIError(error.message || 'Erro desconhecido', 0)
}

export default api