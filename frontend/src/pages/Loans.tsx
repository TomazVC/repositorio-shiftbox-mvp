import { useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import MetricCard from '../components/MetricCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Select from '../components/Select'
import { ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { Loan, mockLoans, getActiveUsers } from '../data/mockData'
import Icon from '../components/Icon'

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [actioningLoan, setActioningLoan] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [detailsLoan, setDetailsLoan] = useState<Loan | null>(null)
  const [createForm, setCreateForm] = useState({
    user_id: '',
    valor: '',
    taxa_juros: '2.5',
    finalidade: '',
    status: 'pendente' as 'pendente' | 'aprovado' | 'pago' | 'rejeitado'
  })
  const [createLoading, setCreateLoading] = useState(false)
  const { toasts, removeToast, success } = useToast()

  // Obter apenas usuários ativos (KYC aprovado)
  const activeUsers = getActiveUsers()

  useEffect(() => {
    loadLoans()
  }, [])

  const loadLoans = async () => {
    try {
      // TODO: Substituir por API real
      setTimeout(() => {
        setLoans(mockLoans)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error)
      setLoading(false)
    }
  }

  const handleAction = (loanId: number, action: 'approve' | 'reject') => {
    setActioningLoan({ id: loanId, action })
  }

  const confirmAction = () => {
    if (!actioningLoan) return

    const { id, action } = actioningLoan
    const newStatus = action === 'approve' ? 'aprovado' : 'rejeitado'

    // TODO: Integrar com API
    setLoans(prev =>
      prev.map(loan =>
        loan.id === id ? { ...loan, status: newStatus as any } : loan
      )
    )

    success(`Empréstimo ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`)
    setActioningLoan(null)
  }

  const handleCreateLoan = async () => {
    if (!createForm.user_id || !createForm.valor || !createForm.finalidade) {
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
      // await post('/loans', createForm)
      
      // Simulação local
      const newLoan: Loan = {
        id: Math.max(...loans.map(loan => loan.id)) + 1,
        user_id: parseInt(createForm.user_id),
        user_name: selectedUser.name,
        valor: parseFloat(createForm.valor),
        status: createForm.status,
        taxa_juros: parseFloat(createForm.taxa_juros),
        finalidade: createForm.finalidade,
        created_at: new Date().toISOString()
      }

      setLoans(prev => [...prev, newLoan])
      success('Empréstimo criado com sucesso!')
      setIsCreateModalOpen(false)
      setCreateForm({
        user_id: '',
        valor: '',
        taxa_juros: '2.5',
        finalidade: '',
        status: 'pendente'
      })
    } catch (error) {
      console.error('Erro ao criar empréstimo:', error)
    } finally {
      setCreateLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
      aprovado: 'success',
      pendente: 'warning',
      pago: 'info',
      rejeitado: 'danger',
    }

    const labels: Record<string, string> = {
      aprovado: 'Aprovado',
      pendente: 'Pendente',
      pago: 'Pago',
      rejeitado: 'Rejeitado',
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const totalEmprestado = loans
    .filter(loan => loan.status === 'aprovado')
    .reduce((sum, loan) => sum + loan.valor, 0)

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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={actioningLoan !== null}
        onClose={() => setActioningLoan(null)}
        onConfirm={confirmAction}
        title={actioningLoan?.action === 'approve' ? 'Aprovar Empréstimo' : 'Rejeitar Empréstimo'}
        message={
          actioningLoan?.action === 'approve'
            ? 'Tem certeza que deseja aprovar este empréstimo?'
            : 'Tem certeza que deseja rejeitar este empréstimo? Esta ação não pode ser desfeita.'
        }
        confirmText={actioningLoan?.action === 'approve' ? 'Aprovar' : 'Rejeitar'}
        type={actioningLoan?.action === 'approve' ? 'info' : 'danger'}
      />

      {/* Modal de Criação */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Empréstimo"
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
            label="Valor do Empréstimo"
            type="number"
            placeholder="0.00"
            hint="Valor em reais (R$)"
            value={createForm.valor}
            onChange={(e) => setCreateForm(prev => ({ ...prev, valor: e.target.value }))}
          />

          <Input
            label="Taxa de Juros"
            type="number"
            placeholder="2.5"
            hint="Percentual mensal (%)"
            value={createForm.taxa_juros}
            onChange={(e) => setCreateForm(prev => ({ ...prev, taxa_juros: e.target.value }))}
          />

          <Select
            label="Finalidade"
            value={createForm.finalidade}
            onChange={(e) => setCreateForm(prev => ({ ...prev, finalidade: e.target.value }))}
          >
            <option value="">Selecione a finalidade</option>
            <option value="pessoal">Uso Pessoal</option>
            <option value="comercial">Comercial/Negócios</option>
            <option value="investimento">Investimento</option>
            <option value="emergencia">Emergência</option>
            <option value="educacao">Educação</option>
            <option value="outros">Outros</option>
          </Select>

          <Select
            label="Status"
            value={createForm.status}
            onChange={(e) => setCreateForm(prev => ({ 
              ...prev, 
              status: e.target.value as 'pendente' | 'aprovado' | 'pago' | 'rejeitado' 
            }))}
          >
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="pago">Pago</option>
            <option value="rejeitado">Rejeitado</option>
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
              onClick={handleCreateLoan}
              loading={createLoading}
            >
              Criar Empréstimo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-display font-bold" style={{ color: 'var(--text-primary)' }}>
            Empréstimos
          </h2>
          <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
            Gerencie as solicitações de empréstimos
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Icon name="plus" size={16} />
          Novo Empréstimo
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          label="Total Emprestado"
          value={formatCurrency(totalEmprestado)}
        />
        <MetricCard
          label="Pendentes"
          value={loans.filter(loan => loan.status === 'pendente').length}
        />
        <MetricCard
          label="Aprovados"
          value={loans.filter(loan => loan.status === 'aprovado').length}
        />
        <MetricCard
          label="Taxa Média"
          value="2.5% a.m."
        />
      </div>

      {/* Modal de Detalhes do Empréstimo */}
      {detailsLoan && (
        <Modal
          isOpen={!!detailsLoan}
          onClose={() => setDetailsLoan(null)}
          title="Detalhes do Empréstimo"
          size="lg"
        >
          <div className="space-y-6">
            {/* Informações do Usuário */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-h2 font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Dados do Solicitante
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Nome</p>
                  <p className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    {detailsLoan.user_name}
                  </p>
                </div>
                <div>
                  <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>ID do Usuário</p>
                  <p className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
                    #{detailsLoan.user_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Informações do Empréstimo */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-caption mb-1" style={{ color: 'var(--text-secondary)' }}>Valor Solicitado</p>
                <p className="text-h1 font-bold" style={{ color: 'var(--color-primary)' }}>
                  {formatCurrency(detailsLoan.valor)}
                </p>
              </div>
              <div>
                <p className="text-caption mb-1" style={{ color: 'var(--text-secondary)' }}>Taxa de Juros</p>
                <p className="text-h1 font-bold" style={{ color: 'var(--text-primary)' }}>
                  {detailsLoan.taxa_juros}% a.m.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-caption mb-1" style={{ color: 'var(--text-secondary)' }}>Status</p>
                {getStatusBadge(detailsLoan.status)}
              </div>
              <div>
                <p className="text-caption mb-1" style={{ color: 'var(--text-secondary)' }}>Data da Solicitação</p>
                <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                  {new Date(detailsLoan.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {detailsLoan.finalidade && (
              <div>
                <p className="text-caption mb-2" style={{ color: 'var(--text-secondary)' }}>Finalidade</p>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-body" style={{ color: 'var(--text-primary)' }}>
                    {detailsLoan.finalidade}
                  </p>
                </div>
              </div>
            )}

            {/* Cálculos do Empréstimo */}
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <h4 className="text-h3 font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Simulação de Pagamento (12 meses)
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Valor Total</p>
                  <p className="text-body font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(detailsLoan.valor * (1 + (detailsLoan.taxa_juros / 100) * 12))}
                  </p>
                </div>
                <div>
                  <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Juros Total</p>
                  <p className="text-body font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(detailsLoan.valor * (detailsLoan.taxa_juros / 100) * 12)}
                  </p>
                </div>
                <div>
                  <p className="text-caption" style={{ color: 'var(--text-secondary)' }}>Parcela Mensal</p>
                  <p className="text-body font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency((detailsLoan.valor * (1 + (detailsLoan.taxa_juros / 100) * 12)) / 12)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setDetailsLoan(null)}
              >
                Fechar
              </Button>
              {detailsLoan.status === 'pendente' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleAction(detailsLoan.id, 'reject')
                      setDetailsLoan(null)
                    }}
                  >
                    Rejeitar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleAction(detailsLoan.id, 'approve')
                      setDetailsLoan(null)
                    }}
                  >
                    Aprovar
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Tabela */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Solicitante</th>
              <th>Valor</th>
              <th>Taxa</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td style={{ color: 'var(--text-secondary)' }}>#{loan.id}</td>
                <td>
                  <span className="font-medium">{loan.user_name}</span>
                </td>
                <td className="font-semibold">{formatCurrency(loan.valor)}</td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {loan.taxa_juros}% a.m.
                </td>
                <td>{getStatusBadge(loan.status)}</td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {new Date(loan.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td>
                  {loan.status === 'pendente' ? (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(loan.id, 'approve')}
                      >
                        <Icon name="check" size={14} />
                        Aprovar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(loan.id, 'reject')}
                      >
                        <Icon name="x" size={14} />
                        Rejeitar
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDetailsLoan(loan)}
                    >
                      <Icon name="eye" size={14} />
                      Detalhes
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
