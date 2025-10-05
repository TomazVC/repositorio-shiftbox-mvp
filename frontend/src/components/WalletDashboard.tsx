import { useState } from 'react'
import { useWallet, useTransactions } from '../hooks/useWallet'
import Card from './Card'
import Button from './Button'
import Input from './Input'
import AlertModal from './AlertModal'
import { useAlert } from '../hooks/useAlert'
import { formatCurrency } from '../utils/format'

interface WalletDashboardProps {
  userId: number
}

const WalletDashboard = ({ userId }: WalletDashboardProps) => {
  const { wallet, loading: walletLoading, processDeposit, processWithdraw } = useWallet(userId)
  const { transactions, loading: transactionsLoading } = useTransactions(userId)
  const { alertState, showError, showSuccess, hideAlert } = useAlert()
  
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit')
  const [processing, setProcessing] = useState(false)

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) {
      showError('Valor Inválido', 'Digite um valor válido para depósito')
      return
    }

    setProcessing(true)
    try {
      await processDeposit(Number(depositAmount), pixKey || undefined)
      setDepositAmount('')
      setPixKey('')
      showSuccess('Depósito Realizado', `Depósito de ${formatCurrency(Number(depositAmount))} realizado com sucesso! 💰`)
    } catch (error) {
      console.error('Erro no depósito:', error)
      showError('Erro no Depósito', 'Erro ao processar depósito. Tente novamente.')
    } finally {
      setProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      showError('Valor Inválido', 'Digite um valor válido para saque')
      return
    }

    if (!pixKey.trim()) {
      showError('Chave PIX Inválida', 'Digite uma chave PIX válida')
      return
    }

    setProcessing(true)
    try {
      await processWithdraw(Number(withdrawAmount), pixKey)
      setWithdrawAmount('')
      setPixKey('')
      showSuccess('Saque Realizado', `Saque de ${formatCurrency(Number(withdrawAmount))} realizado com sucesso! 🏦\n\nEnviado para: ${pixKey}`)
    } catch (error) {
      console.error('Erro no saque:', error)
      showError('Erro no Saque', 'Erro ao processar saque. Tente novamente.')
    } finally {
      setProcessing(false)
    }
  }

  if (walletLoading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p>Carregando carteira...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Saldo da Carteira */}
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Minha Carteira</h2>
          {wallet ? (
            <div className="space-y-2">
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(wallet.available_balance)}
              </p>
              <p className="text-sm text-gray-600">
                Saldo disponível
              </p>
              {wallet.blocked_balance > 0 && (
                <p className="text-sm text-orange-600">
                  {formatCurrency(wallet.blocked_balance)} bloqueado
                </p>
              )}
            </div>
          ) : (
            <p className="text-red-600">Erro ao carregar carteira</p>
          )}
        </div>
      </Card>

      {/* Operações */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Operações</h3>
        
        {/* Tabs */}
        <div className="flex mb-4 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'deposit'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('deposit')}
          >
            Depósito
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'withdraw'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('withdraw')}
          >
            Saque
          </button>
        </div>

        {/* Conteúdo das tabs */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Valor do Depósito
              </label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="R$ 0,00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Chave PIX (opcional)
              </label>
              <Input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="email@exemplo.com ou telefone"
              />
            </div>

            <Button 
              onClick={handleDeposit}
              disabled={processing || !depositAmount}
              className="w-full"
            >
              {processing ? 'Processando...' : 'Fazer Depósito'}
            </Button>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Valor do Saque
              </label>
              <Input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="R$ 0,00"
                min="0"
                step="0.01"
                max={wallet?.available_balance || 0}
              />
              {wallet && (
                <p className="text-xs text-gray-500 mt-1">
                  Saldo disponível: {formatCurrency(wallet.available_balance)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Chave PIX *
              </label>
              <Input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="email@exemplo.com ou telefone"
                required
              />
            </div>

            <Button 
              onClick={handleWithdraw}
              disabled={processing || !withdrawAmount || !pixKey.trim()}
              className="w-full"
              variant="danger"
            >
              {processing ? 'Processando...' : 'Fazer Saque'}
            </Button>
          </div>
        )}
      </Card>

      {/* Histórico de Transações */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Histórico de Transações</h3>
        
        {transactionsLoading ? (
          <p className="text-center text-gray-600">Carregando transações...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-600">Nenhuma transação encontrada</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
            
            {transactions.length > 10 && (
              <p className="text-center text-sm text-gray-600">
                Mostrando 10 de {transactions.length} transações
              </p>
            )}
          </div>
        )}
      </Card>
      
      <AlertModal
        isOpen={alertState.isOpen}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        onClose={hideAlert}
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
      />
    </div>
  )
}

export default WalletDashboard