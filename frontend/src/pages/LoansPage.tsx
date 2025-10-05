import { useState, useEffect } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Icon from '../components/Icon'
import AlertModal from '../components/AlertModal'
import LoanSimulator from '../components/LoanSimulator'
import LoanApprovalWorkflow from '../components/LoanApprovalWorkflow'
import RepaymentSchedule from '../components/RepaymentSchedule'
import { formatCurrency } from '../utils/format'
import { getLoanApplicationsByUserId, mockLoanApplications } from '../data/mockData'
import { LoanApplication, LoanSimulation, PaymentSchedule } from '../types/wallet'
import { useAlert } from '../hooks/useAlert'

interface LoansPageProps {
  currentUserId?: number
  isAdmin?: boolean
}

// Mock data para cronograma de pagamentos
const mockPaymentSchedules: PaymentSchedule[] = [
  {
    id: 1,
    loan_contract_id: 1,
    installment_number: 1,
    due_date: '2024-02-15',
    principal_amount: 2000,
    interest_amount: 500,
    total_amount: 2500,
    status: 'paid',
    paid_amount: 2500,
    paid_date: '2024-02-14',
    late_fee: 0
  },
  {
    id: 2,
    loan_contract_id: 1,
    installment_number: 2,
    due_date: '2024-03-15',
    principal_amount: 2100,
    interest_amount: 400,
    total_amount: 2500,
    status: 'paid',
    paid_amount: 2500,
    paid_date: '2024-03-10',
    late_fee: 0
  },
  {
    id: 3,
    loan_contract_id: 1,
    installment_number: 3,
    due_date: '2024-04-15',
    principal_amount: 2050,
    interest_amount: 450,
    total_amount: 2500,
    status: 'overdue',
    paid_amount: 0,
    late_fee: 75
  },
  {
    id: 4,
    loan_contract_id: 1,
    installment_number: 4,
    due_date: '2024-05-15',
    principal_amount: 2150,
    interest_amount: 350,
    total_amount: 2500,
    status: 'pending'
  }
]

const LoansPage = ({ currentUserId = 1, isAdmin = false }: LoansPageProps) => {
  const [activeTab, setActiveTab] = useState('simulator')
  const [userApplications, setUserApplications] = useState<LoanApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null)
  const [lastSimulation, setLastSimulation] = useState<LoanSimulation | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<string>('newest')
  const [showNotification, setShowNotification] = useState(false)
  const [notificationData, setNotificationData] = useState<{
    title: string
    message: string
    applicationId: number
    amount: number
  } | null>(null)
  const { alertState, showSuccess, showInfo, hideAlert } = useAlert()

  const showSuccessNotification = (applicationId: number, amount: number) => {
    setNotificationData({
      title: 'Solicitação Enviada com Sucesso!',
      message: 'Sua solicitação foi transferida para análise administrativa',
      applicationId,
      amount
    })
    setShowNotification(true)
    
    // Auto-ocultar após 8 segundos
    setTimeout(() => {
      setShowNotification(false)
    }, 8000)
  }

  useEffect(() => {
    loadUserApplications()
  }, [currentUserId])

  const loadUserApplications = () => {
    const applications = getLoanApplicationsByUserId(currentUserId)
    setUserApplications(applications)
  }

  // Filtrar e ordenar aplicações
  const filteredAndSortedApplications = userApplications
    .filter(app => statusFilter === 'all' || app.status === statusFilter)
    .sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
        case 'amount_high':
          return b.requested_amount - a.requested_amount
        case 'amount_low':
          return a.requested_amount - b.requested_amount
        case 'newest':
        default:
          return new Date(b.application_date).getTime() - new Date(a.application_date).getTime()
      }
    })

  const handleSimulation = (simulation: LoanSimulation) => {
    setLastSimulation(simulation)
  }

  const handleLoanRequest = (simulation: LoanSimulation) => {
    // Criar nova aplicação baseada na simulação
    const newApplication: LoanApplication = {
      id: mockLoanApplications.length + 1,
      user_id: currentUserId,
      requested_amount: simulation.amount,
      duration_months: simulation.duration_months,
      purpose: 'capital_giro', // Valor padrão, seria obtido do formulário
      status: 'under_review', // Automaticamente em análise para ir para o painel administrativo
      proposed_interest_rate: simulation.interest_rate,
      application_date: new Date().toISOString().split('T')[0],
      applicant_info: {
        document: '000.000.000-00', // Seria obtido do perfil do usuário
        monthly_income: 10000, // Seria obtido do perfil do usuário
        company_name: 'Empresa Exemplo' // Seria obtido do perfil do usuário
      },
      // Adicionar análise de risco automática para que apareça no painel administrativo
      risk_analysis: {
        score: Math.random() * 0.4 + 0.6, // Score aleatório entre 0.6 e 1.0
        risk_level: simulation.interest_rate <= 2.5 ? 'low' : simulation.interest_rate <= 3.0 ? 'medium' : 'high',
        factors: {
          income_verification: Math.random() * 0.3 + 0.7,
          credit_history: Math.random() * 0.4 + 0.6,
          debt_to_income: Math.random() * 0.5 + 0.3,
          employment_stability: Math.random() * 0.3 + 0.7,
          collateral_value: Math.random() * 0.3 + 0.4,
          positive: ['Simulação realizada', 'Valores dentro do limite', 'Perfil compatível'],
          negative: simulation.interest_rate > 3.0 ? ['Taxa elevada solicitada', 'Primeiro empréstimo'] : ['Primeiro empréstimo']
        },
        recommendations: [
          'Verificar documentação completa',
          'Confirmar dados bancários',
          'Validar renda declarada'
        ]
      }
    }

    // Adicionar à lista global de aplicações (para aparecer no painel administrativo)
    mockLoanApplications.push(newApplication)
    
    // Atualizar lista local do usuário
    setUserApplications(prev => [...prev, newApplication])
    
    // Mudar para a aba de aplicações
    setActiveTab('applications')
    
    // Mostrar notificação de sucesso
    showSuccessNotification(newApplication.id, simulation.amount)
  }

  const handleApprovalChange = (approved: boolean) => {
    // Recarregar aplicações quando houver mudança de status
    loadUserApplications()
    
    if (approved) {
      showSuccess(
        'Empréstimo Aprovado!',
        'A solicitação foi aprovada com sucesso e o valor será liberado em breve.'
      )
    } else {
      showInfo(
        'Empréstimo Rejeitado',
        'A solicitação foi rejeitada após análise administrativa.'
      )
    }
  }

  const handlePaymentUpdate = (scheduleId: number, status: string) => {
    console.log(`Pagamento ${scheduleId} atualizado para: ${status}`)
    // Atualizar status do pagamento no backend
  }

  // Estatísticas das aplicações
  const stats = {
    pending: userApplications.filter(app => app.status === 'pending' || app.status === 'under_review').length,
    approved: userApplications.filter(app => app.status === 'approved').length,
    totalRequested: userApplications
      .filter(app => app.status !== 'rejected')
      .reduce((total, app) => total + app.requested_amount, 0)
  }

  const tabs = [
    { id: 'simulator', label: 'Simulador', icon: 'calculator' },
    { id: 'applications', label: 'Minhas Solicitações', icon: 'file-text' },
    { id: 'schedule', label: 'Cronograma', icon: 'calendar' },
    ...(isAdmin ? [{ id: 'approval', label: 'Análise', icon: 'shield' }] : [])
  ]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'Gestão de Empréstimos' : 'Meus Empréstimos'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 
              'Analise solicitações e gerencie empréstimos da plataforma' : 
              'Simule, solicite e acompanhe seus empréstimos'
            }
          </p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setActiveTab('simulator')}>
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Novo Empréstimo
          </Button>
        )}
      </div>

      {/* Cards de Resumo */}
      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Solicitações Pendentes</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Icon name="clock" className="w-8 h-8 text-amber-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Empréstimos Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Icon name="check" className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Solicitado</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRequested)}</p>
              </div>
              <Icon name="dollar-sign" className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Navegação por Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon name={tab.icon as any} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="min-h-96">
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <LoanSimulator
              userId={currentUserId}
              onSimulate={handleSimulation}
              onLoanRequest={handleLoanRequest}
            />
            
            {/* Últimas Simulações */}
            {lastSimulation && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Última Simulação</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="font-bold">{formatCurrency(lastSimulation.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parcelas</p>
                    <p className="font-bold">{lastSimulation.duration_months}x</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parcela Mensal</p>
                    <p className="font-bold text-green-600">
                      {formatCurrency(lastSimulation.monthly_payment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Taxa</p>
                    <p className="font-bold">{lastSimulation.interest_rate.toFixed(2)}% a.m.</p>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => handleLoanRequest(lastSimulation)}
                >
                  <Icon name="check" className="w-4 h-4 mr-2" />
                  Solicitar Este Empréstimo
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Filtros e Barra de Busca */}
            {filteredAndSortedApplications.length > 0 && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Minhas Solicitações</h3>
                    <p className="text-sm text-gray-600">
                      {filteredAndSortedApplications.length} {filteredAndSortedApplications.length === 1 ? 'solicitação encontrada' : 'solicitações encontradas'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="pending">Pendente</option>
                      <option value="under_review">Em Análise</option>
                      <option value="approved">Aprovado</option>
                      <option value="rejected">Rejeitado</option>
                    </select>
                    
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="newest">Mais Recentes</option>
                      <option value="oldest">Mais Antigas</option>
                      <option value="amount_high">Maior Valor</option>
                      <option value="amount_low">Menor Valor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {filteredAndSortedApplications.length === 0 ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-12 text-center border border-blue-200">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-6 inline-block">
                    <Icon name="file-text" className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {statusFilter === 'all' ? 'Nenhuma solicitação ainda' : 'Nenhuma solicitação encontrada'}
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {statusFilter === 'all' 
                      ? 'Você ainda não fez nenhuma solicitação de empréstimo. Comece criando uma simulação personalizada para suas necessidades.'
                      : 'Não há solicitações com o status selecionado. Tente ajustar os filtros.'
                    }
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
                    <div className="flex items-center gap-2 text-blue-600 bg-white p-3 rounded-lg">
                      <Icon name="calculator" className="w-4 h-4" />
                      <span>Simule grátis</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 bg-white p-3 rounded-lg">
                      <Icon name="clock" className="w-4 h-4" />
                      <span>Resposta rápida</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600 bg-white p-3 rounded-lg">
                      <Icon name="shield" className="w-4 h-4" />
                      <span>100% seguro</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setActiveTab('simulator')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Icon name="calculator" className="w-5 h-5 mr-3" />
                    {statusFilter === 'all' ? 'Fazer Primeira Simulação' : 'Fazer Nova Simulação'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredAndSortedApplications.map((application) => (
                  <div key={application.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Header do Card */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                            application.status === 'approved' ? 'bg-green-100' :
                            application.status === 'rejected' ? 'bg-red-100' :
                            application.status === 'under_review' ? 'bg-blue-100' :
                            'bg-amber-100'
                          }`}>
                            <Icon 
                              name={
                                application.status === 'approved' ? 'check' :
                                application.status === 'rejected' ? 'x' :
                                application.status === 'under_review' ? 'clock' :
                                'file-text'
                              } 
                              className={`w-6 h-6 ${
                                application.status === 'approved' ? 'text-green-600' :
                                application.status === 'rejected' ? 'text-red-600' :
                                application.status === 'under_review' ? 'text-blue-600' :
                                'text-amber-600'
                              }`} 
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              Solicitação #{application.id.toString().padStart(4, '0')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Solicitada em {new Date(application.application_date).toLocaleDateString('pt-BR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2 ${
                          application.status === 'approved' ? 'text-green-700 bg-green-100 border border-green-200' :
                          application.status === 'rejected' ? 'text-red-700 bg-red-100 border border-red-200' :
                          application.status === 'under_review' ? 'text-blue-700 bg-blue-100 border border-blue-200' :
                          'text-amber-700 bg-amber-100 border border-amber-200'
                        }`}>
                          <Icon 
                            name={
                              application.status === 'approved' ? 'check-circle' :
                              application.status === 'rejected' ? 'x-circle' :
                              application.status === 'under_review' ? 'search' : 'clock'
                            } 
                            className="w-4 h-4" 
                          />
                          {application.status === 'approved' ? 'Aprovado' :
                           application.status === 'rejected' ? 'Rejeitado' :
                           application.status === 'under_review' ? 'Em Análise Administrativa' : 'Pendente'}
                        </div>
                        
                        {/* Indicador de Transferência para Análise */}
                        {application.status === 'under_review' && (
                          <div className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium flex items-center gap-1 mt-2">
                            <Icon name="arrow-right" className="w-3 h-3" />
                            Transferida para painel administrativo
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-6">
                      {/* Informações Principais */}
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Icon name="dollar-sign" className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Valor Solicitado</p>
                              <p className="text-2xl font-bold text-gray-900">{formatCurrency(application.requested_amount)}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Prazo</p>
                              <p className="font-semibold text-gray-900">{application.duration_months} meses</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Taxa Proposta</p>
                              <p className="font-semibold text-gray-900">{application.proposed_interest_rate.toFixed(2)}% a.m.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Finalidade</p>
                            <div className="flex items-center gap-2">
                              <Icon 
                                name={
                                  application.purpose === 'capital_giro' ? 'dollar-sign' :
                                  application.purpose === 'expansao' ? 'trending-up' :
                                  application.purpose === 'equipamentos' ? 'settings' :
                                  application.purpose === 'marketing' ? 'smartphone' :
                                  application.purpose === 'reforma' ? 'home' : 'file-text'
                                } 
                                className={`w-5 h-5 ${
                                  application.purpose === 'capital_giro' ? 'text-blue-600' :
                                  application.purpose === 'expansao' ? 'text-green-600' :
                                  application.purpose === 'equipamentos' ? 'text-orange-600' :
                                  application.purpose === 'marketing' ? 'text-purple-600' :
                                  application.purpose === 'reforma' ? 'text-indigo-600' : 'text-gray-600'
                                }`} 
                              />
                              <span className="font-medium text-gray-900">
                                {application.purpose === 'capital_giro' ? 'Capital de Giro' :
                                 application.purpose === 'expansao' ? 'Expansão' :
                                 application.purpose === 'equipamentos' ? 'Equipamentos' :
                                 application.purpose === 'marketing' ? 'Marketing' :
                                 application.purpose === 'reforma' ? 'Reforma' : 'Outros'}
                              </span>
                            </div>
                          </div>
                          
                          {application.risk_analysis && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Score de Risco</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      application.risk_analysis.risk_level === 'low' ? 'bg-green-500' :
                                      application.risk_analysis.risk_level === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${application.risk_analysis.score * 100}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-medium ${
                                  application.risk_analysis.risk_level === 'low' ? 'text-green-600' :
                                  application.risk_analysis.risk_level === 'medium' ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {(application.risk_analysis.score * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Empresa</p>
                            <p className="font-medium text-gray-900">{application.applicant_info.company_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Renda Mensal</p>
                            <p className="font-medium text-gray-900">{formatCurrency(application.applicant_info.monthly_income)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Detalhes da Aprovação/Rejeição */}
                      {application.approval_details && (
                        <div className={`p-4 rounded-xl border-l-4 mb-6 ${
                          application.approval_details.approved 
                            ? 'bg-green-50 border-green-500' 
                            : 'bg-red-50 border-red-500'
                        }`}>
                          <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                            application.approval_details.approved ? 'text-green-900' : 'text-red-900'
                          }`}>
                            <Icon 
                              name={application.approval_details.approved ? 'check-circle' : 'x-circle'} 
                              className="w-5 h-5" 
                            />
                            {application.approval_details.approved ? 'Detalhes da Aprovação' : 'Motivo da Rejeição'}
                          </h4>
                          <p className={`text-sm mb-3 ${
                            application.approval_details.approved ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {application.approval_details.comments}
                          </p>
                          
                          {application.approval_details.approved && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded-lg border border-green-200">
                                <p className="text-sm text-green-600">Valor Aprovado</p>
                                <p className="text-lg font-bold text-green-700">
                                  {formatCurrency(application.approval_details.approved_amount)}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-green-200">
                                <p className="text-sm text-green-600">Taxa Final</p>
                                <p className="text-lg font-bold text-green-700">
                                  {application.approval_details.final_interest_rate.toFixed(2)}% a.m.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {isAdmin && (
                          <Button
                            variant="secondary"
                            className="flex-1 sm:flex-none"
                            onClick={() => {
                              setSelectedApplication(application.id)
                              setActiveTab('approval')
                            }}
                          >
                            <Icon name="eye" className="w-4 h-4 mr-2" />
                            Ver Detalhes Completos
                          </Button>
                        )}
                        
                        {application.status === 'approved' && (
                          <Button 
                            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            onClick={() => setActiveTab('schedule')}
                          >
                            <Icon name="calendar" className="w-4 h-4 mr-2" />
                            Ver Cronograma
                          </Button>
                        )}
                        
                        {application.status === 'pending' && (
                          <Button 
                            variant="secondary"
                            className="flex-1 sm:flex-none border-amber-300 text-amber-700 hover:bg-amber-50"
                          >
                            <Icon name="clock" className="w-4 h-4 mr-2" />
                            Aguardando Análise
                          </Button>
                        )}
                        
                        {application.status === 'under_review' && (
                          <Button 
                            variant="secondary"
                            className="flex-1 sm:flex-none border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Icon name="clock" className="w-4 h-4 mr-2" />
                            Em Análise
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <RepaymentSchedule
            loanId={1}
            schedule={mockPaymentSchedules}
            onPaymentUpdate={handlePaymentUpdate}
          />
        )}

        {activeTab === 'approval' && isAdmin && selectedApplication && (
          <LoanApprovalWorkflow
            applicationId={selectedApplication}
            onApprovalChange={handleApprovalChange}
          />
        )}

        {activeTab === 'approval' && isAdmin && !selectedApplication && (
          <Card className="p-8 text-center">
            <Icon name="shield" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma Solicitação</h3>
            <p className="text-gray-600">
              Acesse a aba "Solicitações" e clique em "Ver Detalhes" para analisar uma solicitação específica.
            </p>
          </Card>
        )}
      </div>

      {/* Notificação de Sucesso */}
      {showNotification && notificationData && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl border border-green-400 max-w-md">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Icon name="check-circle" className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">{notificationData.title}</h4>
                  <p className="text-green-100 text-sm mb-3">{notificationData.message}</p>
                  
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-green-200">Solicitação</p>
                        <p className="font-semibold">#{notificationData.applicationId}</p>
                      </div>
                      <div>
                        <p className="text-green-200">Valor</p>
                        <p className="font-semibold">{formatCurrency(notificationData.amount)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 text-sm">
                    <Icon name="arrow-right" className="w-4 h-4 text-green-200" />
                    <span className="text-green-100">Transferida para análise administrativa</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowNotification(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Icon name="x" className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
        onConfirm={alertState.onConfirm}
      />
    </div>
  )
}

export default LoansPage