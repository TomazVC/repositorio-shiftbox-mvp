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
  onLoanRequest?: (simulation: LoanSimulation) => void
  className?: string
}

const LoanSimulator = ({ userId, onSimulate, onLoanRequest, className = '' }: LoanSimulatorProps) => {
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

  // Função para solicitar empréstimo
  const handleLoanRequest = (simulation: LoanSimulation) => {
    if (onLoanRequest) {
      onLoanRequest(simulation)
    } else {
      // Comportamento padrão - redirecionar ou mostrar modal
      alert(`Solicitação de empréstimo iniciada!\nValor: ${formatCurrency(simulation.amount)}\nParcelas: ${simulation.duration_months}x de ${formatCurrency(simulation.monthly_payment)}`)
    }
  }

  // Função para baixar PDF da simulação
  const handleDownloadPDF = (simulation: LoanSimulation) => {
    // Criar conteúdo do PDF
    const pdfContent = `
SIMULAÇÃO DE EMPRÉSTIMO
========================

Valor Solicitado: ${formatCurrency(simulation.amount)}
Prazo: ${simulation.duration_months} meses
Taxa de Juros: ${simulation.interest_rate.toFixed(2)}% a.m.

RESUMO FINANCEIRO
=================
Parcela Mensal: ${formatCurrency(simulation.monthly_payment)}
Total de Juros: ${formatCurrency(simulation.total_interest)}
Valor Total: ${formatCurrency(simulation.total_amount)}

TAXAS E CUSTOS
==============
Taxa de Originação: ${formatCurrency(simulation.fees.origination_fee)}
Taxa de Processamento: ${formatCurrency(simulation.fees.processing_fee)}
Seguro: ${formatCurrency(simulation.fees.insurance_fee)}
Total de Taxas: ${formatCurrency(simulation.fees.total_fees)}

CRONOGRAMA DE PAGAMENTOS (Primeiras 3 parcelas)
===============================================
${simulation.schedule.slice(0, 3).map(payment => 
  `${payment.month}ª parcela - ${payment.due_date} - ${formatCurrency(payment.total)}`
).join('\n')}

Data da Simulação: ${new Date().toLocaleDateString('pt-BR')}
    `

    // Criar e baixar arquivo
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `simulacao-emprestimo-${simulation.amount}-${new Date().getTime()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className={`bg-gradient-to-br from-white to-blue-50/30 rounded-xl border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Icon name="calculator" className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Simulador de Empréstimo</h3>
            <p className="text-gray-600">Descubra as melhores condições para seu empréstimo</p>
          </div>
        </div>

        {/* Score do usuário */}
        {userCreditScore && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Icon name="shield" className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Seu Score de Crédito</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getRiskLevelColor(userCreditScore.risk_level)}`}>
                      {userCreditScore.score} pontos
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      userCreditScore.risk_level === 'excellent' ? 'bg-green-100 text-green-800' :
                      userCreditScore.risk_level === 'good' ? 'bg-blue-100 text-blue-800' :
                      userCreditScore.risk_level === 'fair' ? 'bg-amber-100 text-amber-800' :
                      userCreditScore.risk_level === 'poor' ? 'bg-orange-100 text-orange-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {userCreditScore.risk_level === 'excellent' ? 'Excelente' :
                       userCreditScore.risk_level === 'good' ? 'Bom' :
                       userCreditScore.risk_level === 'fair' ? 'Regular' :
                       userCreditScore.risk_level === 'poor' ? 'Ruim' : 'Muito Ruim'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Chance de Aprovação</p>
                <div className="flex items-center gap-2">
                  <div className="relative w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${getApprovalProbability()}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-green-600">{getApprovalProbability()}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Valor Desejado
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                R$
              </span>
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0,00"
                className="pl-12 h-12 text-lg font-medium border-2 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Mín: R$ 1.000</span>
              <span>Máx: R$ 100.000</span>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Prazo (meses)
            </label>
            <Select 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              className="h-12 text-lg border-2 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
            >
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="18">18 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
              <option value="48">48 meses</option>
              <option value="60">60 meses</option>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Parcele em até 5 anos
            </p>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Finalidade
            </label>
            <Select 
              value={purpose} 
              onChange={(e) => setPurpose(e.target.value)}
              className="h-12 text-lg border-2 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
            >
              <option value="capital_giro">Capital de Giro</option>
              <option value="expansao">Expansão do Negócio</option>
              <option value="equipamentos">Equipamentos</option>
              <option value="marketing">Marketing</option>
              <option value="reforma">Reforma</option>
              <option value="outros">Outros</option>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Taxa varia conforme finalidade
            </p>
            
            {/* Visualização da finalidade selecionada */}
            <div className="mt-3 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <Icon 
                name={
                  purpose === 'capital_giro' ? 'dollar-sign' :
                  purpose === 'expansao' ? 'trending-up' :
                  purpose === 'equipamentos' ? 'settings' :
                  purpose === 'marketing' ? 'smartphone' :
                  purpose === 'reforma' ? 'home' : 'file-text'
                } 
                className={`w-4 h-4 ${
                  purpose === 'capital_giro' ? 'text-blue-600' :
                  purpose === 'expansao' ? 'text-green-600' :
                  purpose === 'equipamentos' ? 'text-orange-600' :
                  purpose === 'marketing' ? 'text-purple-600' :
                  purpose === 'reforma' ? 'text-indigo-600' : 'text-gray-600'
                }`} 
              />
              <span className="text-xs text-gray-600">
                {purpose === 'capital_giro' ? 'Ideal para fluxo de caixa' :
                 purpose === 'expansao' ? 'Invista no crescimento' :
                 purpose === 'equipamentos' ? 'Modernize seu negócio' :
                 purpose === 'marketing' ? 'Amplie sua presença' :
                 purpose === 'reforma' ? 'Melhore seu espaço' : 'Outras necessidades'}
              </span>
            </div>
          </div>
        </div>

        {/* Resultado da Simulação */}
        {simulation && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Resumo Principal */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Icon name="trending-up" className="w-5 h-5 text-green-600" />
                Resultado da Simulação
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="percent" className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-700 font-semibold">Taxa de Juros</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {simulation.interest_rate.toFixed(2)}%
                  </p>
                  <p className="text-xs text-blue-600 mt-1">ao mês</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="credit-card" className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-700 font-semibold">Parcela Mensal</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(simulation.monthly_payment)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{simulation.duration_months}x vezes</p>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="calculator" className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-700 font-semibold">Total de Juros</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {formatCurrency(simulation.total_interest)}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    {((simulation.total_interest / simulation.amount) * 100).toFixed(1)}% do valor
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="dollar-sign" className="w-4 h-4 text-gray-600" />
                    <p className="text-sm text-gray-700 font-semibold">Total a Pagar</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(simulation.total_amount)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">valor final</p>
                </div>
              </div>
            </div>

            {/* Taxas e Custos */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="file-text" className="w-5 h-5 text-gray-600" />
                Taxas e Custos Detalhados
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Taxa de Originação</p>
                  <p className="font-bold text-gray-900">{formatCurrency(simulation.fees.origination_fee)}</p>
                  <p className="text-xs text-gray-500">2% do valor</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Taxa de Processamento</p>
                  <p className="font-bold text-gray-900">{formatCurrency(simulation.fees.processing_fee)}</p>
                  <p className="text-xs text-gray-500">valor fixo</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Seguro de Proteção</p>
                  <p className="font-bold text-gray-900">{formatCurrency(simulation.fees.insurance_fee)}</p>
                  <p className="text-xs text-gray-500">0,5% do valor</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-xl">
                  <p className="text-sm text-blue-100 mb-1">Total de Taxas</p>
                  <p className="font-bold text-xl">{formatCurrency(simulation.fees.total_fees)}</p>
                  <p className="text-xs text-blue-200">cobrado na liberação</p>
                </div>
              </div>
            </div>

            {/* Cronograma (primeiras 6 parcelas) */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icon name="calendar" className="w-5 h-5 text-blue-600" />
                Cronograma de Pagamentos
              </h4>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <tr>
                        <th className="px-4 py-4 text-left font-semibold text-gray-800">Parcela</th>
                        <th className="px-4 py-4 text-left font-semibold text-gray-800">Vencimento</th>
                        <th className="px-4 py-4 text-right font-semibold text-gray-800">Principal</th>
                        <th className="px-4 py-4 text-right font-semibold text-gray-800">Juros</th>
                        <th className="px-4 py-4 text-right font-semibold text-gray-800">Total</th>
                        <th className="px-4 py-4 text-right font-semibold text-gray-800">Saldo Devedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulation.schedule.slice(0, 6).map((payment, index) => (
                        <tr key={index} className={`border-t border-gray-100 hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-4 py-4 font-semibold text-blue-600">{payment.month}ª</td>
                          <td className="px-4 py-4 text-gray-700">
                            {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-4 text-right font-medium text-green-600">
                            {formatCurrency(payment.principal)}
                          </td>
                          <td className="px-4 py-4 text-right font-medium text-amber-600">
                            {formatCurrency(payment.interest)}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-gray-900">
                            {formatCurrency(payment.total)}
                          </td>
                          <td className="px-4 py-4 text-right text-gray-600">
                            {formatCurrency(payment.remaining_balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {simulation.schedule.length > 6 && (
                  <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                      Mostrando 6 de {simulation.schedule.length} parcelas
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {simulation.schedule.slice(0, 6).map((payment, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-blue-600 text-lg">{payment.month}ª Parcela</span>
                      <span className="text-sm text-gray-600">
                        {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Principal</p>
                        <p className="font-semibold text-green-600">{formatCurrency(payment.principal)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Juros</p>
                        <p className="font-semibold text-amber-600">{formatCurrency(payment.interest)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total da Parcela</p>
                        <p className="font-bold text-gray-900">{formatCurrency(payment.total)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Saldo Restante</p>
                        <p className="font-medium text-gray-700">{formatCurrency(payment.remaining_balance)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {simulation.schedule.length > 6 && (
                  <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-600">
                      Mostrando 6 de {simulation.schedule.length} parcelas
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                onClick={() => handleLoanRequest(simulation)}
              >
                <Icon name="check" className="w-5 h-5 mr-3" />
                Solicitar Este Empréstimo
              </Button>
              <Button 
                variant="secondary" 
                className="h-14 px-8 text-lg font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02]"
                onClick={() => handleDownloadPDF(simulation)}
              >
                <Icon name="download" className="w-5 h-5 mr-3" />
                Baixar Simulação
              </Button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isSimulating && (
          <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-blue-900 mb-1">Calculando sua simulação</h4>
                <p className="text-blue-700">Estamos analisando as melhores condições para você...</p>
              </div>
            </div>
          </div>
        )}

        {/* Estado inicial - sem simulação */}
        {!simulation && !isSimulating && !amount && (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-6 inline-block">
                <Icon name="calculator" className="w-12 h-12 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Comece sua simulação</h4>
              <p className="text-gray-600 mb-6">
                Preencha os campos acima para descobrir as condições do seu empréstimo e ver uma simulação completa
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <Icon name="check" className="w-4 h-4" />
                  <span>Taxa competitiva</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Icon name="shield" className="w-4 h-4" />
                  <span>Processo seguro</span>
                </div>
                <div className="flex items-center gap-2 text-purple-600">
                  <Icon name="clock" className="w-4 h-4" />
                  <span>Aprovação rápida</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estado inicial - com valor mas sem simulação completa */}
        {!simulation && !isSimulating && amount && (
          <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
            <div className="inline-flex items-center gap-4">
              <div className="animate-pulse">
                <Icon name="calculator" className="w-8 h-8 text-amber-600" />
              </div>
              <div className="text-left">
                <h4 className="text-lg font-semibold text-amber-900">Aguardando simulação</h4>
                <p className="text-amber-700">Ajuste os valores para ver o resultado</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoanSimulator