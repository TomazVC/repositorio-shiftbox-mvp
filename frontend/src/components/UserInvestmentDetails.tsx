import { useState, useEffect } from 'react'
import { User, Investment, mockUsers, mockInvestments, getWalletByUserId, getTransactionsByUserId, getCreditScoreByUserId } from '../data/mockData'
import { formatCurrency } from '../utils/format'
import Icon from './Icon'
import Button from './Button'
import Badge from './Badge'
import Card from './Card'
import Modal from './Modal'

interface UserInvestmentDetailsProps {
  userId: number
  isOpen: boolean
  onClose: () => void
}

interface UserInvestmentData {
  user: User
  investments: Investment[]
  wallet: any
  totalInvested: number
  activeInvestments: number
  totalReturns: number
  averageReturn: number
  monthlyActivity: number
  riskScore: number
  lastInvestment: string
}

const UserInvestmentDetails = ({ userId, isOpen, onClose }: UserInvestmentDetailsProps) => {
  const [userData, setUserData] = useState<UserInvestmentData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      loadUserData()
    }
  }, [isOpen, userId])

  const loadUserData = async () => {
    setLoading(true)
    try {
      // Buscar dados do usuário
      const user = mockUsers.find(u => u.id === userId)
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      // Buscar investimentos do usuário
      const userInvestments = mockInvestments.filter(inv => inv.user_id === userId)
      
      // Buscar carteira do usuário
      const wallet = getWalletByUserId(userId)
      
      // Buscar transações do usuário
      const transactions = getTransactionsByUserId(userId)
      
      // Buscar score de crédito
      const creditScore = getCreditScoreByUserId(userId)

      // Calcular métricas
      const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.valor, 0)
      const activeInvestments = userInvestments.filter(inv => inv.status === 'ativo').length
      
      // Simular retornos (5% do valor investido como exemplo)
      const totalReturns = totalInvested * 0.05
      
      // Calcular rentabilidade média
      const averageReturn = userInvestments.length > 0 
        ? userInvestments.reduce((sum, inv) => sum + inv.rentabilidade, 0) / userInvestments.length
        : 0

      // Atividade mensal (transações relacionadas a investimentos)
      const monthlyActivity = transactions.filter(t => {
        const transactionDate = new Date(t.created_at)
        const currentDate = new Date()
        const monthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1))
        return transactionDate >= monthAgo && t.type === 'investment'
      }).length

      // Score de risco (usar score de crédito ou simular)
      const riskScore = creditScore?.score || Math.floor(Math.random() * 400) + 400

      // Último investimento
      const lastInvestment = userInvestments.length > 0 
        ? userInvestments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : user.created_at

      setUserData({
        user,
        investments: userInvestments,
        wallet: wallet || { available_balance: 0, blocked_balance: 0, total_balance: 0 },
        totalInvested,
        activeInvestments,
        totalReturns,
        averageReturn,
        monthlyActivity,
        riskScore,
        lastInvestment
      })
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
    }
    const labels: Record<string, string> = {
      approved: 'Aprovado',
      pending: 'Pendente',
      rejected: 'Rejeitado',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getInvestmentStatusBadge = (status: string) => {
    return status === 'ativo' ? (
      <Badge variant="success">Ativo</Badge>
    ) : (
      <Badge variant="neutral">Resgatado</Badge>
    )
  }

  const getRiskLevel = (score: number) => {
    if (score >= 800) return { label: 'Baixo Risco', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 600) return { label: 'Risco Médio', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { label: 'Alto Risco', color: 'text-red-600', bg: 'bg-red-100' }
  }

  if (!userData && !loading) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes do Investidor - ${userData?.user.name || 'Carregando...'}`}
      size="xl"
    >
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : userData ? (
        <div className="space-y-6">
          {/* Informações do Usuário */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {userData.user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{userData.user.name}</h3>
              <p className="text-gray-600">{userData.user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                {getStatusBadge(userData.user.kyc_status)}
                <span className="text-sm text-gray-500">
                  Membro desde {new Date(userData.user.created_at).toLocaleDateString('pt-BR')}
                </span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevel(userData.riskScore).bg} ${getRiskLevel(userData.riskScore).color}`}>
                  {getRiskLevel(userData.riskScore).label}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Score de Crédito</p>
              <p className="text-2xl font-bold text-blue-600">{userData.riskScore}</p>
            </div>
          </div>

          {/* Métricas de Investimento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="trending-up" className="w-6 h-6 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(userData.totalInvested)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Total Investido</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="chart-bar" className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {userData.activeInvestments}
                </span>
              </div>
              <p className="text-sm text-gray-600">Investimentos Ativos</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="percent" className="w-6 h-6 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">
                  {userData.averageReturn.toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-gray-600">Rentabilidade Média</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name="wallet" className="w-6 h-6 text-amber-600" />
                <span className="text-2xl font-bold text-amber-600">
                  {formatCurrency(userData.wallet.available_balance)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Saldo Disponível</p>
            </Card>
          </div>

          {/* Análise de Risco e Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h4 className="text-lg font-semibold mb-4">Análise de Risco</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Score de Crédito:</span>
                  <span className="font-semibold">{userData.riskScore}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Classificação:</span>
                  <span className={`font-semibold ${getRiskLevel(userData.riskScore).color}`}>
                    {getRiskLevel(userData.riskScore).label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Atividade Mensal:</span>
                  <span className="font-semibold">{userData.monthlyActivity} transações</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status KYC:</span>
                  {getStatusBadge(userData.user.kyc_status)}
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="text-lg font-semibold mb-4">Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Retorno Total:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(userData.totalReturns)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ROI Médio:</span>
                  <span className="font-semibold text-green-600">
                    {((userData.totalReturns / (userData.totalInvested || 1)) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Último Investimento:</span>
                  <span className="font-semibold">
                    {new Date(userData.lastInvestment).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Diversificação:</span>
                  <span className="font-semibold">
                    {userData.investments.length > 3 ? 'Alta' : 
                     userData.investments.length > 1 ? 'Média' : 'Baixa'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Histórico de Investimentos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Histórico de Investimentos</h4>
            <div className="max-h-96 overflow-y-auto">
              {userData.investments.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="trending-up" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum investimento encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userData.investments.map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon name="trending-up" className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Investimento #{investment.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(investment.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(investment.valor)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {investment.rentabilidade}% a.a.
                          </span>
                          {getInvestmentStatusBadge(investment.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="primary" className="flex-1">
              <Icon name="plus" className="w-4 h-4 mr-2" />
              Novo Investimento
            </Button>
            <Button variant="secondary">
              <Icon name="download" className="w-4 h-4 mr-2" />
              Relatório
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <Icon name="x" className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon name="warning" className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">Erro ao carregar dados do usuário</p>
        </div>
      )}
    </Modal>
  )
}

export default UserInvestmentDetails