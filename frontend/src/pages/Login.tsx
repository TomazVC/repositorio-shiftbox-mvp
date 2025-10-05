import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ConnectionDiagnostic from '../components/ConnectionDiagnostic'

export default function Login() {
  const [email, setEmail] = useState('admin@shiftbox.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const navigate = useNavigate()

  // Usar proxy do Vite para evitar CORS
  const API_URL = '/api'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // O backend espera form data, não JSON
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)
      
      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user_email', response.data.email)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Tratar diferentes tipos de erro
      let errorMessage = 'Erro ao fazer login'
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMessage = '🔌 Não foi possível conectar com o servidor. Verifique se o backend está rodando.'
        setShowDiagnostic(true)
      } else if (err.response?.data) {
        const errorData = err.response.data
        
        // Se for um array de erros de validação (422)
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg).join(', ')
        }
        // Se for uma string simples
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        }
        // Se for um objeto com message
        else if (errorData.message) {
          errorMessage = errorData.message
        }
        // Fallback para status 422
        else if (err.response.status === 422) {
          errorMessage = 'Dados inválidos. Verifique email e senha.'
        }
      }
      
      setError(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Diagnóstico de Conexão */}
        {showDiagnostic && (
          <ConnectionDiagnostic />
        )}

        {/* Formulário de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ShiftBox</h1>
            <p className="text-gray-600">Painel Administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                {error}
                {error.includes('conectar com o servidor') && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setShowDiagnostic(!showDiagnostic)}
                      className="text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      {showDiagnostic ? 'Ocultar' : 'Mostrar'} diagnóstico de conexão
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg hover:shadow-xl"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Credenciais de teste:</p>
            <p className="font-mono text-xs mt-1">admin@shiftbox.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

