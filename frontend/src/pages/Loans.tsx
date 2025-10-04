import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'
import MetricCard from '../components/MetricCard'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'

interface Loan {
  id: number
  user_name: string
  valor: number
  status: 'pendente' | 'aprovado' | 'pago' | 'rejeitado'
  created_at: string
  taxa_juros: number
}

export default function Loans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [actioningLoan, setActioningLoan] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null)
  const { get } = useApi()
  const navigate = useNavigate()
  const { toasts, removeToast, success, error } = useToast()

  // Mock data
  const mockLoans: Loan[] = [
    { id: 1, user_name: 'Carlos Mendes', valor: 5000, status: 'aprovado', created_at: '2025-01-15', taxa_juros: 2.5 },
    { id: 2, user_name: 'Fernanda Lima', valor: 8000, status: 'pendente', created_at: '2025-01-18', taxa_juros: 2.5 },
    { id: 3, user_name: 'Roberto Santos', valor: 12000, status: 'pago', created_at: '2025-01-05', taxa_juros: 2.5 },
    { id: 4, user_name: 'Juliana Costa', valor: 3000, status: 'rejeitado', created_at: '2025-01-17', taxa_juros: 2.5 },
  ]

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
      {/* Toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

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
          onClick={() => navigate('/loans/create')}
        >
          + Novo Empréstimo
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          label="Total Emprestado"
          value={formatCurrency(totalEmprestado)}
          icon="🏦"
        />
        <MetricCard
          label="Pendentes"
          value={loans.filter(loan => loan.status === 'pendente').length}
          icon="⏳"
        />
        <MetricCard
          label="Aprovados"
          value={loans.filter(loan => loan.status === 'aprovado').length}
          icon="✓"
        />
        <MetricCard
          label="Taxa Média"
          value="2.5% a.m."
          icon="📊"
        />
      </div>

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
                        Aprovar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(loan.id, 'reject')}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm">
                      Detalhes
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
