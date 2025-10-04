import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function useApi() {
  return {
    get: (url: string) => api.get(url),
    post: (url: string, data: any) => api.post(url, data),
    put: (url: string, data: any) => api.put(url, data),
    delete: (url: string) => api.delete(url),
  }
}

