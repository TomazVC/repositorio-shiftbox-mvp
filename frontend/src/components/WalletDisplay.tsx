import { useState, useEffect } from 'react'
import { User, getWalletByUserId, getTransactionsByUserId } from '../data/mockData'
import { formatCurrency } from '../utils/format'
import Icon from './Icon'
import Button from './Button'
import Badge from './Badge'
import Card from './Card'
import Modal from './Modal'

interface WalletDisplayProps {
  users: User[]
  selectedUser: User | null
  className?: string
}

interface UserWalletData {
  user: User
  wallet: any
  transactions: any[]
  totalTransactions: number
  monthlyVolume: number
  lastActivity: string
}

const WalletDisplay = ({ users, selectedUser, className = '' }: WalletDisplayProps) => {
  const [walletsData, setWalletsData] = useState<UserWalletData[]>([])
  const [selectedWalletDetails, setSelectedWalletDetails] = useState<UserWalletData | null>(null)
  const [loading, setLoading] = useState(true) // Começar em loading true

  console.log('WalletDisplay - Props recebidas:', { 
    usersCount: users.length, 
    selectedUser: selectedUser?.name || 'none',
    users: users.map(u => u.name)
  })

  useEffect(() => {
    const loadWalletsData = async () => {
      setLoading(true)
      try {
        const usersToProcess = selectedUser ? [selectedUser] : users.slice(0, 10) // Limitar a 10 usuários para performance
        
        console.log('WalletDisplay - Usuários para processar:', usersToProcess.length)
        console.log('WalletDisplay - Selected User:', selectedUser)
        console.log('WalletDisplay - All Users:', users.length)
        
        if (usersToProcess.length === 0) {
          setWalletsData([])
          setLoading(false)
          return
        }
        
        const data = await Promise.all(
          usersToProcess.map(async (user) => {
            const wallet = getWalletByUserId(user.id)
            const transactions = getTransactionsByUserId(user.id)
            
            console.log(`WalletDisplay - User ${user.name}: Wallet:`, wallet, 'Transactions:', transactions.length)
            
            // Calcular métricas
            const monthlyTransactions = transactions.filter(t => {
              const transactionDate = new Date(t.created_at)
              const currentDate = new Date()
              const monthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1))
              return transactionDate >= monthAgo
            })
            
            const monthlyVolume = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
            const lastActivity = transactions.length > 0 
              ? transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
              : user.created_at

            return {
              user,
              wallet: wallet || { available_balance: 0, blocked_balance: 0, total_balance: 0 },
              transactions,
              totalTransactions: transactions.length,
              monthlyVolume,
              lastActivity
            }
          })
        )
        
        console.log('WalletDisplay - Dados carregados:', data)
        setWalletsData(data)
      } catch (error) {
        console.error('Erro ao carregar dados das carteiras:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWalletsData()
  }, [users, selectedUser])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return 'plus'
      case 'withdraw': return 'minus'
      case 'investment': return 'trending-up'
      case 'loan_disbursement': return 'credit-card'
      case 'loan_payment': return 'payment'
      case 'interest_distribution': return 'percent'
      default: return 'activity'
    }
  }

  const getTransactionTitle = (type: string) => {
    switch (type) {
      case 'deposit': return 'Depósito'
      case 'withdraw': return 'Saque'
      case 'investment': return 'Investimento'
      case 'loan_disbursement': return 'Empréstimo Liberado'
      case 'loan_payment': return 'Pagamento de Empréstimo'
      case 'interest_distribution': return 'Juros Recebidos'
      default: return 'Transação'
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

  const formatTransactionAmount = (amount: number) => {
    const isPositive = amount > 0
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    const prefix = isPositive ? '+' : ''
    
    return (
      <span className={color}>
        {prefix}{formatCurrency(Math.abs(amount))}
      </span>
    )
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (walletsData.length === 0 && !loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6">
          <div className="text-center py-8">
            <Icon name="wallet" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {users.length === 0 ? 'Nenhum usuário encontrado' : 'Selecione usuários para visualizar suas carteiras'}
            </h3>
            <p className="text-gray-600">
              {users.length === 0 
                ? 'Use os filtros para encontrar usuários.' 
                : `${users.length} usuário(s) disponível(is). As carteiras aparecerão aqui.`
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedUser ? `Carteira - ${selectedUser.name}` : `Carteiras dos Usuários (${walletsData.length})`}
            </h3>
            {selectedUser && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedWalletDetails(walletsData[0])}
                >
                  <Icon name="eye" className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {walletsData.map((userData) => (
              <Card key={userData.user.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {userData.user.name.charAt(0)}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">{userData.user.name}</h4>
                      <p className="text-sm text-gray-600">{userData.user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(userData.user.kyc_status)}
                        <span className="text-xs text-gray-500">
                          {userData.totalTransactions} transações
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="space-y-1">
                      <div>
                        <span className="text-sm text-gray-600">Saldo Total:</span>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(userData.wallet.total_balance)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Disponível:</span>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(userData.wallet.available_balance)}
                          </p>
                        </div>
                        {userData.wallet.blocked_balance > 0 && (
                          <div>
                            <span className="text-gray-600">Bloqueado:</span>
                            <p className="font-semibold text-amber-600">
                              {formatCurrency(userData.wallet.blocked_balance)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="space-y-1">
                      <div>
                        <span className="text-sm text-gray-600">Volume Mensal:</span>
                        <p className="font-semibold text-blue-600">
                          {formatCurrency(userData.monthlyVolume)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Última Atividade:</span>
                        <p className="text-sm text-gray-900">
                          {new Date(userData.lastActivity).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedWalletDetails(userData)}
                    >
                      <Icon name="eye" className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Transações Recentes (apenas para usuário selecionado) */}
                {selectedUser && userData.transactions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Transações Recentes</h5>
                    <div className="space-y-2">
                      {userData.transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <Icon name={getTransactionIcon(transaction.type)} className="w-4 h-4 text-gray-600" />
                            <div>
                              <p className="text-sm font-medium">{getTransactionTitle(transaction.type)}</p>
                              <p className="text-xs text-gray-600">{transaction.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              {formatTransactionAmount(transaction.amount)}
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {userData.transactions.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          E mais {userData.transactions.length - 5} transações...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedWalletDetails && (
        <Modal
          isOpen={!!selectedWalletDetails}
          onClose={() => setSelectedWalletDetails(null)}
          title={`Detalhes da Carteira - ${selectedWalletDetails.user.name}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Informações do Usuário */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div 
                className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {selectedWalletDetails.user.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedWalletDetails.user.name}</h3>
                <p className="text-gray-600">{selectedWalletDetails.user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(selectedWalletDetails.user.kyc_status)}
                  <span className="text-sm text-gray-500">
                    Membro desde {new Date(selectedWalletDetails.user.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Métricas da Carteira */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="wallet" className="w-6 h-6 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedWalletDetails.wallet.available_balance)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Saldo Disponível</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="activity" className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {selectedWalletDetails.totalTransactions}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total de Transações</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Icon name="trending-up" className="w-6 h-6 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">
                    {formatCurrency(selectedWalletDetails.monthlyVolume)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Volume Mensal</p>
              </div>
            </div>

            {/* Histórico de Transações */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Histórico de Transações</h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {selectedWalletDetails.transactions.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">Nenhuma transação encontrada</p>
                ) : (
                  selectedWalletDetails.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon name={getTransactionIcon(transaction.type)} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{getTransactionTitle(transaction.type)}</p>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatTransactionAmount(transaction.amount)}
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default WalletDisplay