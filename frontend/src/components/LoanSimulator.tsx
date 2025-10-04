import { useState, useEffect, useMemo } from 'react'
import Button from './Button'
import Input from './Input'
import Select from './Select'
import Icon from './Icon'
import { formatCurrency } from '../utils/format'
import { getCreditScoreByUserId } from '../data/mockData'
import { LoanSimulation, SimulatedPayment } from '../types/wallet'

interface LoanSimulatorProps {
  userId?: number
  onSimulate?: (simulation: LoanSimulation) => void
  className?: string
}

const LoanSimulator = ({ userId, onSimulate, className = '' }: LoanSimulatorProps) => {
  const [amount, setAmount] = useState('')
  const [duration, setDuration] = useState('12')
  const [purpose, setPurpose] = useState('capital_giro')
  const [simulation, setSimulation] = useState<LoanSimulation | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Obter score de crédito do usuário se disponível
  const userCreditScore = userId ? getCreditScoreByUserId(userId) : null

  // Taxas base por finalidade
  const purposeRates = {
    capital_giro: 2.5,
    expansao: 2.8,
    equipamentos: 2.3,
    marketing: 3.2,
    reforma: 2.7,
    outros: 3.5
  }

  // Calcular taxa de juros baseada no score e finalidade
  const calculateInterestRate = useMemo(() => {
    const baseRate = purposeRates[purpose as keyof typeof purposeRates] || 3.5
    
    if (!userCreditScore) return baseRate
    
    // Ajustar taxa baseada no score
    const scoreMultiplier = {
      excellent: 0.8,   // -20%
      good: 0.9,        // -10%
      fair: 1.0,        // Base
      poor: 1.2,        // +20%
      very_poor: 1.5    // +50%
    }
    
    return baseRate * (scoreMultiplier[userCreditScore.risk_level] || 1.0)
  }, [purpose, userCreditScore])

  // Função para simular empréstimo
  const simulateLoan = () => {
    const loanAmount = parseFloat(amount) || 0
    const months = parseInt(duration)
    const monthlyRate = calculateInterestRate / 100

    if (loanAmount <= 0 || months <= 0) return

    setIsSimulating(true)

    setTimeout(() => {
      // Calcular PMT (Payment) usando fórmula de financiamento
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                            (Math.pow(1 + monthlyRate, months) - 1)

      const totalAmount = monthlyPayment * months
      const totalInterest = totalAmount - loanAmount

      // Calcular taxas
      const fees = {
        origination_fee: loanAmount * 0.02, // 2% do valor
        processing_fee: 150, // Taxa fixa
        insurance_fee: loanAmount * 0.005, // 0.5% do valor
        total_fees: 0
      }
      fees.total_fees = fees.origination_fee + fees.processing_fee + fees.insurance_fee

      // Gerar cronograma de pagamentos
      const schedule: SimulatedPayment[] = []
      let remainingBalance = loanAmount

      for (let month = 1; month <= months; month++) {
        const interestPayment = remainingBalance * monthlyRate
        const principalPayment = monthlyPayment - interestPayment
        remainingBalance -= principalPayment

        const dueDate = new Date()
        dueDate.setMonth(dueDate.getMonth() + month)

        schedule.push({
          month,
          due_date: dueDate.toISOString().split('T')[0],
          principal: principalPayment,
          interest: interestPayment,
          total: monthlyPayment,
          remaining_balance: Math.max(0, remainingBalance)
        })
      }

      const newSimulation: LoanSimulation = {
        amount: loanAmount,
        duration_months: months,
        interest_rate: calculateInterestRate,
        monthly_payment: monthlyPayment,
        total_amount: totalAmount,
        total_interest: totalInterest,
        schedule,
        fees
      }

      setSimulation(newSimulation)
      setIsSimulating(false)
      onSimulate?.(newSimulation)
    }, 1000)
  }

  // Auto-simular quando valores mudam
  useEffect(() => {
    if (amount && duration) {
      const timer = setTimeout(simulateLoan, 500)
      return () => clearTimeout(timer)
    }
  }, [amount, duration, purpose, calculateInterestRate])

  const formatAmountValue = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseInt(numbers) || 0
    return (amount / 100).toFixed(2)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmountValue(e.target.value)
    setAmount(formatted)
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-amber-600'
      case 'poor': return 'text-orange-600'
      case 'very_poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getApprovalProbability = () => {
    if (!userCreditScore) return 75 // Default para usuários sem score
    
    const probabilities = {
      excellent: 95,
      good: 85,
      fair: 70,
      poor: 45,
      very_poor: 20
    }
    
    return probabilities[userCreditScore.risk_level] || 50
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon name="calculator" className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Simulador de Empréstimo</h3>
            <p className="text-sm text-gray-600">Simule seu empréstimo e veja as condições</p>
          </div>
        </div>

        {/* Score do usuário */}
        {userCreditScore && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="shield" className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Seu Score de Crédito</p>
                  <p className={`text-sm ${getRiskLevelColor(userCreditScore.risk_level)}`}>
                    {userCreditScore.score} pontos - {
                      userCreditScore.risk_level === 'excellent' ? 'Excelente' :
                      userCreditScore.risk_level === 'good' ? 'Bom' :
                      userCreditScore.risk_level === 'fair' ? 'Regular' :
                      userCreditScore.risk_level === 'poor' ? 'Ruim' : 'Muito Ruim'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Prob. Aprovação</p>
                <p className="text-lg font-bold text-green-600">{getApprovalProbability()}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Desejado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                R$
              </span>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0,00"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mín: R$ 1.000 | Máx: R$ 100.000
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prazo (meses)
            </label>
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="18">18 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
              <option value="48">48 meses</option>
              <option value="60">60 meses</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Finalidade
            </label>
            <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              <option value="capital_giro">Capital de Giro</option>
              <option value="expansao">Expansão do Negócio</option>
              <option value="equipamentos">Equipamentos</option>
              <option value="marketing">Marketing</option>
              <option value="reforma">Reforma</option>
              <option value="outros">Outros</option>
            </Select>
          </div>
        </div>

        {/* Resultado da Simulação */}
        {simulation && (
          <div className="space-y-6">
            {/* Resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Taxa de Juros</p>
                <p className="text-xl font-bold text-blue-900">
                  {simulation.interest_rate.toFixed(2)}% a.m.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Parcela Mensal</p>
                <p className="text-xl font-bold text-green-900">
                  {formatCurrency(simulation.monthly_payment)}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-600 font-medium">Total de Juros</p>
                <p className="text-xl font-bold text-amber-900">
                  {formatCurrency(simulation.total_interest)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Total a Pagar</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(simulation.total_amount)}
                </p>
              </div>
            </div>

            {/* Taxas e Custos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Taxas e Custos</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Taxa de Originação (2%)</p>
                  <p className="font-medium">{formatCurrency(simulation.fees.origination_fee)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Taxa de Processamento</p>
                  <p className="font-medium">{formatCurrency(simulation.fees.processing_fee)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Seguro (0,5%)</p>
                  <p className="font-medium">{formatCurrency(simulation.fees.insurance_fee)}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Total de Taxas</p>
                  <p className="font-bold">{formatCurrency(simulation.fees.total_fees)}</p>
                </div>
              </div>
            </div>

            {/* Cronograma (primeiras 6 parcelas) */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cronograma de Pagamentos</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Parcela</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Vencimento</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-900">Principal</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-900">Juros</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-900">Total</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-900">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulation.schedule.slice(0, 6).map((payment, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-4 py-3 font-medium">{payment.month}ª</td>
                          <td className="px-4 py-3">
                            {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(payment.total)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(payment.remaining_balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {simulation.schedule.length > 6 && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-600">
                    ... e mais {simulation.schedule.length - 6} parcelas
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <Button 
                className="flex-1"
                onClick={() => {
                  // Aqui iria para o fluxo de solicitação
                  console.log('Solicitar empréstimo com:', simulation)
                }}
              >
                <Icon name="check" className="w-4 h-4 mr-2" />
                Solicitar Empréstimo
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  // Aqui iria para download do PDF
                  console.log('Download simulação:', simulation)
                }}
              >
                <Icon name="download" className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isSimulating && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3">
              <Icon name="clock" className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-gray-600">Calculando simulação...</span>
            </div>
          </div>
        )}

        {/* Estado inicial */}
        {!simulation && !isSimulating && amount && (
          <div className="text-center py-8">
            <Icon name="calculator" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Digite os valores para ver a simulação</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoanSimulator