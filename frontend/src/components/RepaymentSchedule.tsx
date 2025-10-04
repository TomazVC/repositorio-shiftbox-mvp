import { useState, useEffect } from 'react'
import Button from './Button'
import Card from './Card'
import Icon from './Icon'
import Modal from './Modal'
import { formatCurrency } from '../utils/format'
import { PaymentSchedule } from '../types/wallet'

interface RepaymentScheduleProps {
  loanId: number
  schedule: PaymentSchedule[]
  onPaymentUpdate?: (scheduleId: number, status: string) => void
  className?: string
}

const RepaymentSchedule = ({ loanId, schedule, onPaymentUpdate, className = '' }: RepaymentScheduleProps) => {
  const [expandedPayment, setExpandedPayment] = useState<number | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentSchedule | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    nextPayment: null as PaymentSchedule | null,
    overdueCount: 0
  })

  useEffect(() => {
    calculateSummary()
  }, [schedule])

  const calculateSummary = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let totalPaid = 0
    let totalPending = 0
    let overdueCount = 0
    let nextPayment: PaymentSchedule | null = null

    schedule.forEach(payment => {
      const dueDate = new Date(payment.due_date)
      dueDate.setHours(0, 0, 0, 0)

      if (payment.status === 'paid') {
        totalPaid += payment.paid_amount || payment.total_amount
      } else if (payment.status === 'pending') {
        totalPending += payment.total_amount
        
        if (dueDate < today) {
          overdueCount++
        } else if (!nextPayment || dueDate < new Date(nextPayment.due_date)) {
          nextPayment = payment
        }
      } else if (payment.status === 'overdue') {
        totalPending += payment.total_amount + (payment.late_fee || 0)
        overdueCount++
      }
    })

    setSummary({
      totalPaid,
      totalPending,
      nextPayment,
      overdueCount
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-blue-600 bg-blue-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      case 'partially_paid': return 'text-amber-600 bg-amber-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'pending': return 'Pendente'
      case 'overdue': return 'Vencido'
      case 'partially_paid': return 'Pago Parcialmente'
      default: return 'Desconhecido'
    }
  }

  const isOverdue = (dueDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    return due < today
  }

  const handlePayment = (payment: PaymentSchedule) => {
    setSelectedPayment(payment)
    setShowPaymentModal(true)
  }

  const processPayment = async () => {
    if (!selectedPayment) return

    setIsProcessing(true)

    try {
      // Simular processamento de pagamento
      setTimeout(() => {
        onPaymentUpdate?.(selectedPayment.id, 'paid')
        setShowPaymentModal(false)
        setSelectedPayment(null)
        setIsProcessing(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      setIsProcessing(false)
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Icon name="calendar" className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cronograma de Pagamentos</h3>
              <p className="text-sm text-gray-600">Empréstimo #{loanId}</p>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Pago</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(summary.totalPaid)}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pendente</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(summary.totalPending)}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Próximo Vencimento</p>
                <p className="text-lg font-bold text-gray-900">
                  {summary.nextPayment ? 
                    new Date(summary.nextPayment.due_date).toLocaleDateString('pt-BR') : 
                    'N/A'
                  }
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Em Atraso</p>
                <p className="text-xl font-bold text-red-600">
                  {summary.overdueCount}
                </p>
              </div>
            </Card>
          </div>

          {/* Próximo Pagamento Destacado */}
          {summary.nextPayment && (
            <Card className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Próximo Pagamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Parcela</p>
                      <p className="font-medium">{summary.nextPayment.installment_number}ª</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vencimento</p>
                      <p className="font-medium">
                        {new Date(summary.nextPayment.due_date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-blue-600">
                        {getDaysUntilDue(summary.nextPayment.due_date)} dias
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(summary.nextPayment.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => handlePayment(summary.nextPayment!)}>
                  <Icon name="credit-card" className="w-4 h-4 mr-2" />
                  Pagar Agora
                </Button>
              </div>
            </Card>
          )}

          {/* Lista de Pagamentos */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Histórico Completo</h4>
            {schedule.map((payment) => (
              <div
                key={payment.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                  expandedPayment === payment.id ? 'bg-gray-50' : 'bg-white'
                } ${isOverdue(payment.due_date) && payment.status === 'pending' ? 'border-red-200' : 'border-gray-200'}`}
                onClick={() => setExpandedPayment(
                  expandedPayment === payment.id ? null : payment.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-bold text-lg">{payment.installment_number}ª</p>
                      <p className="text-xs text-gray-500">parcela</p>
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isOverdue(payment.due_date) && payment.status === 'pending' ? 
                          `${Math.abs(getDaysUntilDue(payment.due_date))} dias em atraso` :
                          payment.status === 'pending' ? 
                            `${getDaysUntilDue(payment.due_date)} dias` : 
                            payment.paid_date ? 
                              `Pago em ${new Date(payment.paid_date).toLocaleDateString('pt-BR')}` :
                              'Data não informada'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(payment.total_amount + (payment.late_fee || 0))}
                      </p>
                      {payment.late_fee && payment.late_fee > 0 && (
                        <p className="text-xs text-red-600">
                          +{formatCurrency(payment.late_fee)} multa
                        </p>
                      )}
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </div>
                    
                    {payment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePayment(payment)
                        }}
                      >
                        Pagar
                      </Button>
                    )}
                    
                    <Icon 
                      name={expandedPayment === payment.id ? "chevron-up" : "chevron-down"} 
                      className="w-5 h-5 text-gray-400" 
                    />
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {expandedPayment === payment.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Principal</p>
                        <p className="font-medium">{formatCurrency(payment.principal_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Juros</p>
                        <p className="font-medium">{formatCurrency(payment.interest_amount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-medium">{formatCurrency(payment.total_amount)}</p>
                      </div>
                    </div>
                    
                    {payment.status === 'paid' && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="check" className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Pagamento Confirmado</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-green-700">Método: {payment.payment_method || 'PIX'}</p>
                          </div>
                          <div>
                            <p className="text-green-700">ID: {payment.transaction_id || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Realizar Pagamento"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Detalhes do Pagamento</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Parcela</p>
                  <p className="font-medium">{selectedPayment.installment_number}ª</p>
                </div>
                <div>
                  <p className="text-gray-600">Vencimento</p>
                  <p className="font-medium">
                    {new Date(selectedPayment.due_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Principal</p>
                  <p className="font-medium">{formatCurrency(selectedPayment.principal_amount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Juros</p>
                  <p className="font-medium">{formatCurrency(selectedPayment.interest_amount)}</p>
                </div>
                {selectedPayment.late_fee && selectedPayment.late_fee > 0 && (
                  <>
                    <div>
                      <p className="text-gray-600">Multa por Atraso</p>
                      <p className="font-medium text-red-600">{formatCurrency(selectedPayment.late_fee)}</p>
                    </div>
                    <div></div>
                  </>
                )}
                <div className="col-span-2 pt-2 border-t border-gray-200">
                  <p className="text-gray-600">Total a Pagar</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(selectedPayment.total_amount + (selectedPayment.late_fee || 0))}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pagamento
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    value="pix"
                    checked={paymentMethod === 'pix'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <Icon name="smartphone" className="w-5 h-5" />
                  <span>PIX (Instantâneo)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <Icon name="building" className="w-5 h-5" />
                  <span>Transferência Bancária (1-2 dias)</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    value="debit_wallet"
                    checked={paymentMethod === 'debit_wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <Icon name="wallet" className="w-5 h-5" />
                  <span>Debitar da Carteira</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={processPayment}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <Icon name="clock" className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Icon name="credit-card" className="w-4 h-4 mr-2" />
                )}
                {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default RepaymentSchedule