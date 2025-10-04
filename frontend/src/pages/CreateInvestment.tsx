import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import Button from '../components/Button'
import Input from '../components/Input'
import Toast from '../components/Toast'

export default function CreateInvestment() {
  const navigate = useNavigate()
  const { toasts, removeToast, success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    investorName: '',
    amount: '',
    duration: '',
    expectedReturn: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.investorName.trim()) {
      newErrors.investorName = 'Nome do investidor é obrigatório'
    }

    const amount = parseFloat(formData.amount)
    if (!formData.amount || amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
    }

    const duration = parseInt(formData.duration)
    if (!formData.duration || duration <= 0) {
      newErrors.duration = 'Duração deve ser maior que zero'
    }

    const expectedReturn = parseFloat(formData.expectedReturn)
    if (!formData.expectedReturn || expectedReturn < 0 || expectedReturn > 100) {
      newErrors.expectedReturn = 'Taxa deve estar entre 0 e 100%'
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
      // await post('/investments', formData)

      await new Promise(resolve => setTimeout(resolve, 1000))

      success('Investimento criado com sucesso!')
      setTimeout(() => navigate('/investments'), 1500)
    } catch (err) {
      error('Erro ao criar investimento')
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
          Novo Investimento
        </h1>
        <p className="text-body mt-2" style={{ color: 'var(--text-secondary)' }}>
          Preencha os dados para registrar um novo investimento no pool
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        <Input
          label="Nome do Investidor"
          placeholder="Ex: João Silva"
          value={formData.investorName}
          onChange={(e) => setFormData({ ...formData, investorName: e.target.value })}
          error={errors.investorName}
        />

        <Input
          label="Valor do Investimento"
          type="number"
          placeholder="10000"
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
          hint="Período em meses"
        />

        <Input
          label="Retorno Esperado (%)"
          type="number"
          step="0.01"
          placeholder="12.5"
          value={formData.expectedReturn}
          onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
          error={errors.expectedReturn}
          hint="Taxa anual em %"
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/investments')}
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
            Criar Investimento
          </Button>
        </div>
      </form>

      {/* Informações Adicionais */}
      <div className="card" style={{ backgroundColor: 'var(--bg-elev-2)' }}>
        <h3 className="text-h2 mb-3" style={{ color: 'var(--text-primary)' }}>
          📌 Informações Importantes
        </h3>
        <ul className="space-y-2 text-body" style={{ color: 'var(--text-secondary)' }}>
          <li>• O investimento será adicionado ao pool principal</li>
          <li>• A rentabilidade é calculada automaticamente</li>
          <li>• Investimentos ativos podem ser resgatados a qualquer momento</li>
        </ul>
      </div>
    </div>
  )
}

