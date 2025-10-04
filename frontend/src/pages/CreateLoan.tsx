import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import Toast from '../components/Toast'

export default function CreateLoan() {
  const navigate = useNavigate()
  const { toasts, removeToast, success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    borrowerName: '',
    amount: '',
    duration: '',
    interestRate: '2.5',
    purpose: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.borrowerName.trim()) {
      newErrors.borrowerName = 'Nome do solicitante é obrigatório'
    }

    const amount = parseFloat(formData.amount)
    if (!formData.amount || amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
    }

    const duration = parseInt(formData.duration)
    if (!formData.duration || duration <= 0 || duration > 60) {
      newErrors.duration = 'Duração deve ser entre 1 e 60 meses'
    }

    const interestRate = parseFloat(formData.interestRate)
    if (!formData.interestRate || interestRate < 0 || interestRate > 20) {
      newErrors.interestRate = 'Taxa deve estar entre 0 e 20%'
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Finalidade é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      error('Por favor, corrija os erros no formulário')
      return
    }

    setLoading(true)

    try {
      // TODO: Integrar com API
      // await post('/loans', formData)

      await new Promise(resolve => setTimeout(resolve, 1000))

      success('Solicitação de empréstimo criada com sucesso!')
      setTimeout(() => navigate('/loans'), 1500)
    } catch (err) {
      error('Erro ao criar empréstimo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div>
        <h1 className="text-display font-bold" style={{ color: 'var(--text-primary)' }}>
          Novo Empréstimo
        </h1>
        <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
          Preencha os dados para registrar uma nova solicitação de empréstimo
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        <Input
          label="Nome do Solicitante"
          placeholder="Ex: Maria Santos"
          value={formData.borrowerName}
          onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
          error={errors.borrowerName}
        />

        <Input
          label="Valor Solicitado"
          type="number"
          placeholder="5000"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          error={errors.amount}
          hint="Valor em R$"
        />

        <Input
          label="Duração (meses)"
          type="number"
          placeholder="12"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          error={errors.duration}
          hint="Período de 1 a 60 meses"
        />

        <Input
          label="Taxa de Juros (%)"
          type="number"
          step="0.1"
          value={formData.interestRate}
          onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
          error={errors.interestRate}
          hint="Taxa mensal em %"
        />

        <Select
          label="Finalidade"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          error={errors.purpose}
        >
          <option value="">Selecione...</option>
          <option value="capital_giro">Capital de Giro</option>
          <option value="investimento">Investimento</option>
          <option value="emergencia">Emergência</option>
          <option value="consolidacao">Consolidação de Dívidas</option>
          <option value="outros">Outros</option>
        </Select>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/loans')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            fullWidth
          >
            Criar Solicitação
          </Button>
        </div>
      </form>

      {/* Informações Adicionais */}
      <div className="card" style={{ backgroundColor: 'var(--bg-elev-2)' }}>
        <h3 className="text-h2 mb-3" style={{ color: 'var(--text-primary)' }}>
          📌 Informações Importantes
        </h3>
        <ul className="space-y-2 text-body" style={{ color: 'var(--text-secondary)' }}>
          <li>• O empréstimo será criado com status "Pendente"</li>
          <li>• É necessário aprovação manual do administrador</li>
          <li>• O valor será debitado do saldo disponível do pool</li>
          <li>• A taxa de juros padrão é de 2.5% ao mês</li>
        </ul>
      </div>
    </div>
  )
}

