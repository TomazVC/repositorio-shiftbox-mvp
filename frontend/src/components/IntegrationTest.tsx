import { useState, useEffect } from 'react'
import { apiAdapter } from '../services/apiAdapter'
import { useUsers } from '../hooks/useUsers'
import { useInvestments } from '../hooks/useInvestments'
import { useWallet } from '../hooks/useWallet'
import Card from '../components/Card'
import Button from '../components/Button'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'
import { formatCurrency } from '../utils/format'

interface IntegrationTestProps {
  userId?: number
}

const IntegrationTest = ({ userId = 1 }: IntegrationTestProps) => {
  const [poolData, setPoolData] = useState<any>(null)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const { alertState, showSuccess, showError, hideAlert } = useAlert()

  // Hooks
  const { users, isLoading: usersLoading } = useUsers()
  const { investments, isLoading: investmentsLoading } = useInvestments()
  const { wallet, loading: walletLoading } = useWallet(userId)

  // Teste individual de cada serviço
  const testPoolService = async () => {
    try {
      const data = await apiAdapter.getPoolStatus()
      setPoolData(data)
      setTestResults(prev => ({ ...prev, pool: true }))
      console.log('✅ Pool service working:', data)
    } catch (error) {
      setTestResults(prev => ({ ...prev, pool: false }))
      console.error('❌ Pool service failed:', error)
    }
  }

  const testUsersService = async () => {
    try {
      const data = await apiAdapter.getAllUsers()
      setTestResults(prev => ({ ...prev, users: true }))
      console.log('✅ Users service working:', data.length, 'users')
    } catch (error) {
      setTestResults(prev => ({ ...prev, users: false }))
      console.error('❌ Users service failed:', error)
    }
  }

  const testInvestmentsService = async () => {
    try {
      const data = await apiAdapter.getAllInvestments()
      setTestResults(prev => ({ ...prev, investments: true }))
      console.log('✅ Investments service working:', data.length, 'investments')
    } catch (error) {
      setTestResults(prev => ({ ...prev, investments: false }))
      console.error('❌ Investments service failed:', error)
    }
  }

  const testWalletService = async () => {
    try {
      const walletData = await apiAdapter.getUserWallet(userId)
      const transactions = await apiAdapter.getUserTransactions(userId)
      setTestResults(prev => ({ ...prev, wallet: true }))
      console.log('✅ Wallet service working:', walletData, transactions.length, 'transactions')
    } catch (error) {
      setTestResults(prev => ({ ...prev, wallet: false }))
      console.error('❌ Wallet service failed:', error)
    }
  }

  const testLoansService = async () => {
    try {
      const data = await apiAdapter.getAllLoanApplications()
      setTestResults(prev => ({ ...prev, loans: true }))
      console.log('✅ Loans service working:', data.length, 'applications')
    } catch (error) {
      setTestResults(prev => ({ ...prev, loans: false }))
      console.error('❌ Loans service failed:', error)
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setTestResults({})
    
    await Promise.all([
      testPoolService(),
      testUsersService(),
      testInvestmentsService(),
      testWalletService(),
      testLoansService()
    ])
    
    setLoading(false)
  }

  const testDeposit = async () => {
    try {
      const result = await apiAdapter.processDeposit(userId, 100, 'test@test.com')
      console.log('✅ Deposit test successful:', result)
      showSuccess('Teste Concluído', 'Depósito de teste realizado com sucesso! 💰')
    } catch (error) {
      console.error('❌ Deposit test failed:', error)
      showError('Teste Falhou', 'Falha no teste de depósito')
    }
  }

  useEffect(() => {
    runAllTests()
  }, [])

  const getStatusIcon = (status: boolean | undefined) => {
    if (status === undefined) return '⏳'
    return status ? '✅' : '❌'
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Teste de Integração de Serviços</h2>
          <Button onClick={runAllTests} disabled={loading}>
            {loading ? 'Testando...' : 'Executar Testes'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status dos Testes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Status dos Serviços</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span>Pool</span>
                <span className="text-lg">{getStatusIcon(testResults.pool)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Usuários</span>
                <span className="text-lg">{getStatusIcon(testResults.users)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Investimentos</span>
                <span className="text-lg">{getStatusIcon(testResults.investments)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Carteira</span>
                <span className="text-lg">{getStatusIcon(testResults.wallet)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Empréstimos</span>
                <span className="text-lg">{getStatusIcon(testResults.loans)}</span>
              </div>
            </div>
          </div>

          {/* Dados do Pool */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Dados do Pool</h3>
            {poolData ? (
              <div className="text-sm space-y-1">
                <p>Total Investido: {formatCurrency(poolData.total_invested || 0)}</p>
                <p>Disponível: {formatCurrency(poolData.total_available || 0)}</p>
                <p>Emprestado: {formatCurrency(poolData.total_loans || 0)}</p>
                <p>Investidores: {poolData.investors_count || 0}</p>
                <p>Taxa de Utilização: {((poolData.utilization_rate || 0) * 100).toFixed(1)}%</p>
              </div>
            ) : (
              <p className="text-gray-500">Carregando...</p>
            )}
          </div>

          {/* Dados da Carteira */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Carteira do Usuário {userId}</h3>
            {walletLoading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : wallet ? (
              <div className="text-sm space-y-1">
                <p>Saldo: {formatCurrency(wallet.available_balance)}</p>
                <p>Bloqueado: {formatCurrency(wallet.blocked_balance)}</p>
                <p>Total: {formatCurrency(wallet.total_balance)}</p>
                <Button 
                  onClick={testDeposit}
                  size="sm"
                  className="mt-2"
                >
                  Testar Depósito R$ 100
                </Button>
              </div>
            ) : (
              <p className="text-red-500">Erro ao carregar</p>
            )}
          </div>
        </div>
      </Card>

      {/* Estatísticas dos Hooks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Estatísticas dos Hooks</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Usuários</h4>
            {usersLoading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : (
              <div className="text-sm space-y-1">
                <p>Total: {users.length}</p>
                <p>Aprovados: {users.filter(u => u.kyc_status === 'aprovado').length}</p>
                <p>Pendentes: {users.filter(u => u.kyc_status === 'pendente').length}</p>
                <p>Rejeitados: {users.filter(u => u.kyc_status === 'rejeitado').length}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Investimentos</h4>
            {investmentsLoading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : (
              <div className="text-sm space-y-1">
                <p>Total: {investments.length}</p>
                <p>Ativos: {investments.filter(i => i.status === 'ativo').length}</p>
                <p>Resgatados: {investments.filter(i => i.status === 'resgatado').length}</p>
                <p>Valor Total: {formatCurrency(investments.reduce((sum, i) => sum + i.valor, 0))}</p>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">Integração</h4>
            <div className="text-sm space-y-1">
              <p>Modo: Desenvolvimento</p>
              <p>API Base: http://localhost:8000</p>
              <p>Fallback: Habilitado (Mock)</p>
              <p>Testes: {Object.values(testResults).filter(Boolean).length}/{Object.keys(testResults).length} OK</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Log de Console */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Log de Integração</h3>
        <p className="text-sm text-gray-600">
          Verifique o console do navegador (F12) para logs detalhados de cada teste de integração.
        </p>
        <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
          <p>✅ = Serviço funcionando (API real ou fallback)</p>
          <p>❌ = Serviço com falha</p>
          <p>⏳ = Teste em andamento</p>
        </div>
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

export default IntegrationTest