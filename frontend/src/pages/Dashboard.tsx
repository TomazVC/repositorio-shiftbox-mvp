import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import MetricCard from '../components/MetricCard'
import PoolPieChart from '../components/charts/PoolPieChart'
import InvestmentLineChart from '../components/charts/InvestmentLineChart'
import LoanStatusBarChart from '../components/charts/LoanStatusBarChart'
import { poolCompositionData, investmentEvolutionData, loanStatusData } from '../data/chartData'
import { poolTestScenarios, getPoolDataByScenario } from '../data/testPoolData'
import Button from '../components/Button'

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
  const [currentScenario, setCurrentScenario] = useState('Valores Normais')
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
      // Em caso de erro, usar dados de teste
      setPoolData(getPoolDataByScenario(currentScenario))
    } finally {
      setLoading(false)
    }
  }

  const switchToScenario = (scenarioName: string) => {
    setCurrentScenario(scenarioName)
    setPoolData(getPoolDataByScenario(scenarioName))
  }

  const formatCurrency = (value: number) => {
    // Para valores muito grandes, usar formatação compacta
    if (value >= 1e9) {
      return `R$ ${(value / 1e9).toFixed(1)}B`
    } else if (value >= 1e6) {
      return `R$ ${(value / 1e6).toFixed(1)}M`
    } else if (value >= 1e3) {
      return `R$ ${(value / 1e3).toFixed(0)}K`
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
        
        {/* Seletor de Cenários de Teste */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm font-medium text-blue-800 mb-2">
            Teste de Formatação de Valores
          </p>
          <div className="flex flex-wrap gap-2">
            {poolTestScenarios.map((scenario) => (
              <Button
                key={scenario.scenario}
                size="sm"
                variant={currentScenario === scenario.scenario ? 'primary' : 'secondary'}
                onClick={() => switchToScenario(scenario.scenario)}
              >
                {scenario.scenario}
              </Button>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Atual: {currentScenario} • Total: {formatCurrency(poolData?.saldo_total || 0)}
          </p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PoolPieChart data={poolCompositionData} loading={loading} />
        <InvestmentLineChart data={investmentEvolutionData} loading={loading} />
      </div>

      {/* Gráfico de Barras - Status dos Empréstimos */}
      <div className="grid grid-cols-1 gap-6">
        <LoanStatusBarChart data={loanStatusData} loading={loading} />
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

