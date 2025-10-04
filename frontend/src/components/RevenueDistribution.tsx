import { useState, useEffect } from 'react'
import Button from './Button'
import Card from './Card'
import Icon from './Icon'
import Modal from './Modal'
import { formatCurrency } from '../utils/format'
import { Distribution } from '../types/wallet'

interface RevenueDistributionProps {
  distributions: Distribution[]
  onDistribute?: (distributionId: number) => void
  className?: string
}

const RevenueDistribution = ({ distributions, onDistribute, className = '' }: RevenueDistributionProps) => {
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState({
    totalDistributed: 0,
    totalPending: 0,
    totalInvestors: 0,
    averageReturn: 0
  })

  useEffect(() => {
    calculateSummary()
  }, [distributions])

  const calculateSummary = () => {
    let totalDistributed = 0
    let totalPending = 0

    distributions.forEach(dist => {
      if (dist.status === 'completed') {
        totalDistributed += dist.investor_amount
      } else if (dist.status === 'pending') {
        totalPending += dist.investor_amount
      }
    })

    // Simular número de investidores únicos
    const totalInvestors = Math.floor(distributions.length * 1.5) || 1
    const averageReturn = totalDistributed / totalInvestors

    setSummary({
      totalDistributed,
      totalPending,
      totalInvestors,
      averageReturn
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-amber-600 bg-amber-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Distribuído'
      case 'pending': return 'Pendente'
      case 'failed': return 'Falhou'
      default: return 'Desconhecido'
    }
  }

  const processDistribution = async (distribution: Distribution) => {
    setIsProcessing(true)
    
    try {
      // Simular processamento
      setTimeout(() => {
        onDistribute?.(distribution.id)
        setShowDetailsModal(false)
        setIsProcessing(false)
      }, 2000)
    } catch (error) {
      console.error('Erro ao processar distribuição:', error)
      setIsProcessing(false)
    }
  }

  const showDistributionDetails = (distribution: Distribution) => {
    setSelectedDistribution(distribution)
    setShowDetailsModal(true)
  }

  const handleNewDistribution = () => {
    // Simular criação de nova distribuição
    const newDistribution: Distribution = {
      id: Math.max(...distributions.map(d => d.id)) + 1,
      loan_id: Math.floor(Math.random() * 10) + 1,
      payment_id: Math.floor(Math.random() * 1000) + 100,
      total_amount: Math.floor(Math.random() * 10000) + 1000,
      platform_fee: 0,
      security_reserve: 0,
      investor_amount: 0,
      distribution_date: new Date().toISOString().split('T')[0],
      status: 'pending'
    }
    
    // Calcular taxas
    newDistribution.platform_fee = newDistribution.total_amount * 0.05
    newDistribution.security_reserve = newDistribution.total_amount * 0.02
    newDistribution.investor_amount = newDistribution.total_amount * 0.93
    
    alert(`Nova distribuição criada!\n\nID: #${newDistribution.id}\nValor Total: R$ ${newDistribution.total_amount.toLocaleString()}\nPara Investidores: R$ ${newDistribution.investor_amount.toLocaleString()}\nStatus: Pendente\n\n(Em um sistema real, seria salva no banco de dados)`)
  }

  return (
    <>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Icon name="dollar-sign" className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Distribuição de Receita</h3>
              <p className="text-sm text-gray-600">Gestão de distribuição para investidores</p>
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Distribuído</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(summary.totalDistributed)}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pendente</p>
                <p className="text-xl font-bold text-amber-600">
                  {formatCurrency(summary.totalPending)}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Investidores</p>
                <p className="text-xl font-bold text-blue-600">
                  {summary.totalInvestors}
                </p>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Retorno Médio</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(summary.averageReturn)}
                </p>
              </div>
            </Card>
          </div>

          {/* Lista de Distribuições */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Distribuições</h4>
              <Button size="sm" onClick={handleNewDistribution}>
                <Icon name="plus" className="w-4 h-4 mr-2" />
                Nova Distribuição
              </Button>
            </div>

            {distributions.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="folder" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma distribuição encontrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {distributions.map((distribution) => (
                  <div
                    key={distribution.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => showDistributionDetails(distribution)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Icon name="trending-up" className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Distribuição #{distribution.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(distribution.distribution_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-purple-600">
                            {formatCurrency(distribution.investor_amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            de {formatCurrency(distribution.total_amount)}
                          </p>
                        </div>

                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(distribution.status)}`}>
                          {getStatusText(distribution.status)}
                        </div>

                        {distribution.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              processDistribution(distribution)
                            }}
                          >
                            Processar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Breakdown de valores */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-sm text-gray-600">Taxa da Plataforma</p>
                        <p className="font-medium">{formatCurrency(distribution.platform_fee)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reserva de Segurança</p>
                        <p className="font-medium">{formatCurrency(distribution.security_reserve)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Para Investidores</p>
                        <p className="font-medium text-purple-600">{formatCurrency(distribution.investor_amount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Distribuição #${selectedDistribution?.id}`}
      >
        {selectedDistribution && (
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Informações Gerais</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">ID do Empréstimo</p>
                  <p className="font-medium">{selectedDistribution.loan_id}</p>
                </div>
                <div>
                  <p className="text-gray-600">ID do Pagamento</p>
                  <p className="font-medium">{selectedDistribution.payment_id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Data de Distribuição</p>
                  <p className="font-medium">
                    {new Date(selectedDistribution.distribution_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedDistribution.status)}`}>
                    {getStatusText(selectedDistribution.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Financeiro */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Breakdown Financeiro</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor Total Recebido</span>
                  <span className="font-bold text-lg">{formatCurrency(selectedDistribution.total_amount)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span>Taxa da Plataforma (5%)</span>
                  <span>-{formatCurrency(selectedDistribution.platform_fee)}</span>
                </div>
                <div className="flex justify-between items-center text-amber-600">
                  <span>Reserva de Segurança (2%)</span>
                  <span>-{formatCurrency(selectedDistribution.security_reserve)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center text-green-600 font-bold">
                    <span>Para Investidores (93%)</span>
                    <span>{formatCurrency(selectedDistribution.investor_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulação de Investidores */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Investidores Beneficiados</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {/* Simular alguns investidores */}
                {[
                  { name: 'Investidor A', amount: selectedDistribution.investor_amount * 0.3, percentage: 30 },
                  { name: 'Investidor B', amount: selectedDistribution.investor_amount * 0.25, percentage: 25 },
                  { name: 'Investidor C', amount: selectedDistribution.investor_amount * 0.2, percentage: 20 },
                  { name: 'Investidor D', amount: selectedDistribution.investor_amount * 0.15, percentage: 15 },
                  { name: 'Investidor E', amount: selectedDistribution.investor_amount * 0.1, percentage: 10 }
                ].map((investor, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{investor.name} ({investor.percentage}%)</span>
                    <span className="font-medium">{formatCurrency(investor.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            {selectedDistribution.status === 'pending' && (
              <div className="flex gap-3">
                <Button
                  onClick={() => processDistribution(selectedDistribution)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <Icon name="clock" className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Icon name="check" className="w-4 h-4 mr-2" />
                  )}
                  {isProcessing ? 'Processando...' : 'Processar Distribuição'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDetailsModal(false)}
                  disabled={isProcessing}
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default RevenueDistribution