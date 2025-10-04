import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import Card from '../components/Card'

interface PoolData {
  saldo_total: number
  saldo_disponivel: number
  saldo_emprestado: number
  percentual_utilizacao: number
  total_investidores: number
}

export default function Dashboard() {
  const [poolData, setPoolData] = useState<PoolData | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { get } = useApi()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    loadPoolData()
  }, [])

  const loadPoolData = async () => {
    try {
      const response = await get('/pool')
      setPoolData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_email')
    navigate('/login')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const mockUsers = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', saldo: 15000 },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', saldo: 28000 },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', saldo: 42000 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">ShiftBox Admin</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card
                title="Saldo Total"
                value={formatCurrency(poolData?.saldo_total || 0)}
                subtitle="Pool completo"
                color="blue"
              />
              <Card
                title="Disponível"
                value={formatCurrency(poolData?.saldo_disponivel || 0)}
                subtitle="Para empréstimos"
                color="green"
              />
              <Card
                title="Emprestado"
                value={formatCurrency(poolData?.saldo_emprestado || 0)}
                subtitle="Em circulação"
                color="yellow"
              />
              <Card
                title="Utilização"
                value={`${poolData?.percentual_utilizacao || 0}%`}
                subtitle={`${poolData?.total_investidores || 0} investidores`}
                color="purple"
              />
            </div>

            {/* Lista de Usuários Mock */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Usuários Recentes
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Saldo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(user.saldo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

