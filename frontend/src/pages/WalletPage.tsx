import { useState } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import DepositModal from '../components/DepositModalNew'
import WithdrawModal from '../components/WithdrawModalNew'
import { getWalletByUserId, getTransactionsByUserId, mockUsers } from '../data/mockData'
import { formatCurrency } from '../utils/format'

export const WalletPage = () => {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  // Para este exemplo, vamos usar o usuário ID 1
  const currentUserId = 1
  const wallet = getWalletByUserId(currentUserId)
  const transactions = getTransactionsByUserId(currentUserId)
  const user = mockUsers.find(u => u.id === currentUserId)

  if (!wallet || !user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Icon name="warning" className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Carteira não encontrada</h2>
          <p className="text-gray-600">Não foi possível carregar os dados da carteira.</p>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check'
      case 'pending': return 'clock'
      case 'failed': return 'x'
      case 'cancelled': return 'x'
      default: return 'clock'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'pending': return 'text-amber-600'
      case 'failed': return 'text-red-600'
      case 'cancelled': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

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

  const formatTransactionAmount = (amount: number) => {
    const isPositive = amount > 0
    const color = isPositive ? 'text-green-600' : 'text-red-600'
    const prefix = isPositive ? '+' : ''
    
    return (
      <span className={color}>
        {prefix}{formatCurrency(amount)}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carteira</h1>
          <p className="text-gray-600">Gerencie seus recursos financeiros</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-2"
          >
            <Icon name="plus" className="w-4 h-4" />
            Depositar
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-2"
          >
            <Icon name="minus" className="w-4 h-4" />
            Sacar
          </Button>
        </div>
      </div>

      {/* Métricas da Carteira */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon name="wallet" className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Saldo Disponível</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(wallet.available_balance)}</p>
          <p className="text-sm text-gray-500 mt-1">Disponível para uso</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Icon name="lock" className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Saldo Bloqueado</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(wallet.blocked_balance)}</p>
          <p className="text-sm text-gray-500 mt-1">Em processamento</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Icon name="chart-bar" className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Saldo Total</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(wallet.total_balance)}</p>
          <p className="text-sm text-gray-500 mt-1">Total na conta</p>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Transações Recentes</h2>
            <Button variant="secondary" size="sm">
              <Icon name="download" className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="credit-card" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma transação encontrada</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon 
                        name={getTransactionIcon(transaction.type)} 
                        className="w-5 h-5 text-gray-700" 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {getTransactionTitle(transaction.type)}
                      </h3>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatTransactionAmount(transaction.amount)}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${getStatusColor(transaction.status)}`}>
                        <Icon name={getStatusIcon(transaction.status)} className="w-3 h-3" />
                        {transaction.status === 'completed' ? 'Concluída' :
                         transaction.status === 'pending' ? 'Pendente' :
                         transaction.status === 'failed' ? 'Falhada' : 'Cancelada'}
                      </div>
                    </div>
                    <Icon name="chevron-right" className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      <DepositModal 
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        wallet={wallet}
        onSuccess={() => {
          setShowDepositModal(false)
          // Aqui você atualizaria os dados da carteira
        }}
      />

      <WithdrawModal 
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        wallet={wallet}
        onSuccess={() => {
          setShowWithdrawModal(false)
          // Aqui você atualizaria os dados da carteira
        }}
      />

      {/* Modal de Detalhes da Transação */}
      {selectedTransaction && (
        <Modal 
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          title="Detalhes da Transação"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Icon 
                  name={getTransactionIcon(selectedTransaction.type)} 
                  className="w-6 h-6 text-gray-700" 
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {getTransactionTitle(selectedTransaction.type)}
                </h3>
                <p className="text-gray-600">{selectedTransaction.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor
                </label>
                <p className="text-lg font-semibold">
                  {formatTransactionAmount(selectedTransaction.amount)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className={`flex items-center gap-1 ${getStatusColor(selectedTransaction.status)}`}>
                  <Icon name={getStatusIcon(selectedTransaction.status)} className="w-4 h-4" />
                  <span className="font-medium">
                    {selectedTransaction.status === 'completed' ? 'Concluída' :
                     selectedTransaction.status === 'pending' ? 'Pendente' :
                     selectedTransaction.status === 'failed' ? 'Falhada' : 'Cancelada'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Criação
              </label>
              <p className="text-gray-900">
                {new Date(selectedTransaction.created_at).toLocaleString('pt-BR')}
              </p>
            </div>

            {selectedTransaction.completed_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Conclusão
                </label>
                <p className="text-gray-900">
                  {new Date(selectedTransaction.completed_at).toLocaleString('pt-BR')}
                </p>
              </div>
            )}

            {selectedTransaction.reference_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referência
                </label>
                <p className="text-gray-900 font-mono text-sm">
                  {selectedTransaction.reference_id}
                </p>
              </div>
            )}

            {selectedTransaction.metadata && Object.keys(selectedTransaction.metadata).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Informações Adicionais
                </label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  {Object.entries(selectedTransaction.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key}:</span>
                      <span className="text-gray-900 font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}