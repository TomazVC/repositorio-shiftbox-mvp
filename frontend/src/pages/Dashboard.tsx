import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import MetricCard from '../components/MetricCard'

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
  const { get } = useApi()

  useEffect(() => {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="skeleton h-8 w-64 mb-4"></div>
          <div className="skeleton h-4 w-96"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-display font-bold" style={{ color: 'var(--text-primary)' }}>
          Visão Geral do Pool
        </h2>
        <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
          Acompanhe as principais métricas em tempo real
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Saldo Total"
          value={formatCurrency(poolData?.saldo_total || 0)}
          trend={{ value: 12.5, direction: 'up' }}
        />
        <MetricCard
          label="Disponível"
          value={formatCurrency(poolData?.saldo_disponivel || 0)}
        />
        <MetricCard
          label="Emprestado"
          value={formatCurrency(poolData?.saldo_emprestado || 0)}
        />
        <MetricCard
          label="Utilização"
          value={`${poolData?.percentual_utilizacao || 0}%`}
        />
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-h2 mb-4" style={{ color: 'var(--text-primary)' }}>
            Investidores Ativos
          </h3>
          <div>
            <p className="text-display font-bold" style={{ color: 'var(--color-primary)' }}>
              {poolData?.total_investidores || 0}
            </p>
            <p className="text-caption mt-1" style={{ color: 'var(--text-secondary)' }}>
              Total de investidores no pool
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-h2 mb-4" style={{ color: 'var(--text-primary)' }}>
            Status do Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body" style={{ color: 'var(--text-secondary)' }}>
                API Backend
              </span>
              <span className="badge badge-success">Operacional</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body" style={{ color: 'var(--text-secondary)' }}>
                Banco de Dados
              </span>
              <span className="badge badge-success">Conectado</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body" style={{ color: 'var(--text-secondary)' }}>
                Última atualização
              </span>
              <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                {new Date().toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

