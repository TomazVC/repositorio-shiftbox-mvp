import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import MetricCard from '../components/MetricCard'
import Badge from '../components/Badge'
import Button from '../components/Button'

interface Investment {
  id: number
  user_name: string
  valor: number
  status: 'ativo' | 'resgatado'
  created_at: string
  rentabilidade: number
}

export default function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const { get } = useApi()
  const navigate = useNavigate()

  // Mock data
  const mockInvestments: Investment[] = [
    { id: 1, user_name: 'João Silva', valor: 10000, status: 'ativo', created_at: '2025-01-10', rentabilidade: 12.5 },
    { id: 2, user_name: 'Maria Santos', valor: 25000, status: 'ativo', created_at: '2025-01-12', rentabilidade: 12.5 },
    { id: 3, user_name: 'Pedro Costa', valor: 15000, status: 'resgatado', created_at: '2025-01-08', rentabilidade: 12.5 },
  ]

  useEffect(() => {
    loadInvestments()
  }, [])

  const loadInvestments = async () => {
    try {
      // TODO: Substituir por API real
      setTimeout(() => {
        setInvestments(mockInvestments)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error)
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    return status === 'ativo' ? (
      <Badge variant="success">Ativo</Badge>
    ) : (
      <Badge variant="neutral">Resgatado</Badge>
    )
  }

  const totalAtivo = investments
    .filter(inv => inv.status === 'ativo')
    .reduce((sum, inv) => sum + inv.valor, 0)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="skeleton h-8 w-64 mx-auto mb-4"></div>
        <div className="skeleton h-4 w-96 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Investimentos
          </h2>
          <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
            Gerencie os investimentos no pool
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/investments/create')}
        >
          + Novo Investimento
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Total Investido (Ativo)"
          value={formatCurrency(totalAtivo)}
          icon="💰"
          trend={{ value: 15.2, direction: 'up' }}
        />
        <MetricCard
          label="Investimentos Ativos"
          value={investments.filter(inv => inv.status === 'ativo').length}
          icon="✓"
        />
        <MetricCard
          label="Rentabilidade Média"
          value="12.5% a.a."
          icon="📈"
        />
      </div>

      {/* Tabela */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Investidor</th>
              <th>Valor</th>
              <th>Rentabilidade</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((investment) => (
              <tr key={investment.id}>
                <td style={{ color: 'var(--text-secondary)' }}>#{investment.id}</td>
                <td>
                  <span className="font-medium">{investment.user_name}</span>
                </td>
                <td className="font-semibold">{formatCurrency(investment.valor)}</td>
                <td style={{ color: 'var(--color-green)' }} className="font-medium">
                  {investment.rentabilidade}% a.a.
                </td>
                <td>{getStatusBadge(investment.status)}</td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {new Date(investment.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
