import { useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import MetricCard from '../components/MetricCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Select from '../components/Select'
import { ToastContainer } from '../components/Toast'
import UserInvestmentDetails from '../components/UserInvestmentDetails'
import { Investment, mockInvestments, getActiveUsers } from '../data/mockData'
import Icon from '../components/Icon'

export default function Investments() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    user_id: '',
    valor: '',
    rentabilidade: '12.5',
    status: 'ativo' as 'ativo' | 'resgatado'
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const { toasts, removeToast, success } = useToast()

  // Obter apenas usuários ativos (KYC aprovado)
  const activeUsers = getActiveUsers()

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

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId)
  }

  const handleCreateInvestment = async () => {
    if (!createForm.user_id || !createForm.valor) {
      return
    }

    setCreateLoading(true)

    try {
      // Buscar dados do usuário selecionado
      const selectedUser = activeUsers.find(user => user.id === parseInt(createForm.user_id))
      if (!selectedUser) {
        throw new Error('Usuário não encontrado')
      }

      // TODO: Integrar com API real
      // await post('/investments', createForm)
      
      // Simulação local
      const newInvestment: Investment = {
        id: Math.max(...investments.map(inv => inv.id)) + 1,
        user_id: parseInt(createForm.user_id),
        user_name: selectedUser.name,
        valor: parseFloat(createForm.valor),
        status: createForm.status,
        rentabilidade: parseFloat(createForm.rentabilidade),
        created_at: new Date().toISOString()
      }

      setInvestments(prev => [...prev, newInvestment])
      success('Investimento criado com sucesso!')
      setIsCreateModalOpen(false)
      setCreateForm({
        user_id: '',
        valor: '',
        rentabilidade: '12.5',
        status: 'ativo'
      })
    } catch (error) {
      console.error('Erro ao criar investimento:', error)
    } finally {
      setCreateLoading(false)
    }
  }

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

      {/* Modal de Criação */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Investimento"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Usuário"
            value={createForm.user_id}
            onChange={(e) => setCreateForm(prev => ({ ...prev, user_id: e.target.value }))}
          >
            <option value="">Selecione um usuário</option>
            {activeUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </Select>

          <Input
            label="Valor do Investimento"
            type="number"
            placeholder="0.00"
            hint="Valor em reais (R$)"
            value={createForm.valor}
            onChange={(e) => setCreateForm(prev => ({ ...prev, valor: e.target.value }))}
          />

          <Input
            label="Rentabilidade"
            type="number"
            placeholder="12.5"
            hint="Percentual anual (%)"
            value={createForm.rentabilidade}
            onChange={(e) => setCreateForm(prev => ({ ...prev, rentabilidade: e.target.value }))}
          />

          <Select
            label="Status"
            value={createForm.status}
            onChange={(e) => setCreateForm(prev => ({ 
              ...prev, 
              status: e.target.value as 'ativo' | 'resgatado' 
            }))}
          >
            <option value="ativo">Ativo</option>
            <option value="resgatado">Resgatado</option>
          </Select>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={createLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateInvestment}
              loading={createLoading}
            >
              Criar Investimento
            </Button>
          </div>
        </div>
      </Modal>
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
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Icon name="plus" size={16} />
          Novo Investimento
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Total Investido (Ativo)"
          value={formatCurrency(totalAtivo)}
          trend={{ value: 15.2, direction: 'up' }}
        />
        <MetricCard
          label="Investimentos Ativos"
          value={investments.filter(inv => inv.status === 'ativo').length}
        />
        <MetricCard
          label="Rentabilidade Média"
          value="12.5% a.a."
        />
      </div>

      {/* Tabela */}
      <div className="table-container">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <Icon name="info" size={16} />
            <span className="text-sm font-medium">
              💡 Dica: Clique em qualquer investidor para ver informações detalhadas
            </span>
          </div>
        </div>
        
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
              <tr 
                key={investment.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleUserClick(investment.user_id)}
                title="Clique para ver detalhes do investidor"
              >
                <td style={{ color: 'var(--text-secondary)' }}>#{investment.id}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      {investment.user_name.charAt(0)}
                    </div>
                    <span className="font-medium">{investment.user_name}</span>
                    <Icon name="eye" className="w-4 h-4 text-gray-400 ml-2" />
                  </div>
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

      {/* Modal de Detalhes do Usuário */}
      {selectedUserId && (
        <UserInvestmentDetails
          userId={selectedUserId}
          isOpen={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
