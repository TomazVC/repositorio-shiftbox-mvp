import { useState, useEffect } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import Icon from '../components/Icon'
import LoanSimulator from '../components/LoanSimulator'
import LoanApprovalWorkflow from '../components/LoanApprovalWorkflow'
import RepaymentSchedule from '../components/RepaymentSchedule'
import { formatCurrency } from '../utils/format'
import { getLoanApplicationsByUserId } from '../data/mockData'
import { LoanApplication, LoanSimulation, PaymentSchedule } from '../types/wallet'

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
    payment_method: 'PIX',
    transaction_id: 'TXN001'
  },
  {
    id: 2,
    loan_contract_id: 1,
    installment_number: 2,
    due_date: '2024-03-15',
    principal_amount: 2050,
    interest_amount: 450,
    total_amount: 2500,
    status: 'paid',
    paid_amount: 2500,
    paid_date: '2024-03-14',
    payment_method: 'PIX',
    transaction_id: 'TXN002'
  },
  {
    id: 3,
    loan_contract_id: 1,
    installment_number: 3,
    due_date: '2024-04-15',
    principal_amount: 2100,
    interest_amount: 400,
    total_amount: 2500,
    status: 'pending'
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

  useEffect(() => {
    loadUserApplications()
  }, [currentUserId])

  const loadUserApplications = () => {
    const applications = getLoanApplicationsByUserId(currentUserId)
    setUserApplications(applications)
  }

  const handleSimulation = (simulation: LoanSimulation) => {
    setLastSimulation(simulation)
  }

  const handleApprovalChange = (approved: boolean, details: any) => {
    console.log('Aprovação alterada:', approved, details)
    loadUserApplications() // Recarregar aplicações
  }

  const getApplicationSummary = () => {
    const pending = userApplications.filter(app => app.status === 'pending' || app.status === 'under_review').length
    const approved = userApplications.filter(app => app.status === 'approved').length
    const totalRequested = userApplications
      .filter(app => app.status === 'approved')
      .reduce((sum, app) => sum + app.requested_amount, 0)

    return { pending, approved, totalRequested }
  }

  const summary = getApplicationSummary()

  const tabs = [
    { id: 'simulator', label: 'Simulador', icon: 'calculator', adminOnly: false },
    { id: 'applications', label: 'Minhas Solicitações', icon: 'file-text', adminOnly: false },
    { id: 'schedule', label: 'Cronograma', icon: 'calendar', adminOnly: false },
    { id: 'approval', label: 'Análise de Crédito', icon: 'shield', adminOnly: true }
  ].filter(tab => !tab.adminOnly || isAdmin)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Solicitações Pendentes</p>
                <p className="text-2xl font-bold text-amber-600">{summary.pending}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Icon name="clock" className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Empréstimos Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon name="check" className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Emprestado</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.totalRequested)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon name="trending-up" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navegação por Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
                <Button className="w-full">
                  <Icon name="check" className="w-4 h-4 mr-2" />
                  Solicitar Este Empréstimo
                </Button>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {userApplications.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="file-text" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
                <p className="text-gray-600 mb-4">
                  Você ainda não fez nenhuma solicitação de empréstimo.
                </p>
                <Button onClick={() => setActiveTab('simulator')}>
                  <Icon name="calculator" className="w-4 h-4 mr-2" />
                  Fazer Simulação
                </Button>
              </Card>
            ) : (
              userApplications.map((application) => (
                <Card key={application.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Solicitação #{application.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(application.application_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      application.status === 'approved' ? 'text-green-600 bg-green-100' :
                      application.status === 'rejected' ? 'text-red-600 bg-red-100' :
                      application.status === 'under_review' ? 'text-blue-600 bg-blue-100' :
                      'text-amber-600 bg-amber-100'
                    }`}>
                      {application.status === 'approved' ? 'Aprovado' :
                       application.status === 'rejected' ? 'Rejeitado' :
                       application.status === 'under_review' ? 'Em Análise' : 'Pendente'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Valor Solicitado</p>
                      <p className="font-bold">{formatCurrency(application.requested_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prazo</p>
                      <p className="font-bold">{application.duration_months} meses</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Taxa Proposta</p>
                      <p className="font-bold">{application.proposed_interest_rate.toFixed(2)}% a.m.</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Finalidade</p>
                      <p className="font-bold">
                        {application.purpose === 'capital_giro' ? 'Capital de Giro' :
                         application.purpose === 'expansao' ? 'Expansão' :
                         application.purpose === 'equipamentos' ? 'Equipamentos' :
                         application.purpose === 'marketing' ? 'Marketing' :
                         application.purpose === 'reforma' ? 'Reforma' : 'Outros'}
                      </p>
                    </div>
                  </div>

                  {application.approval_details && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {application.approval_details.approved ? 'Detalhes da Aprovação' : 'Motivo da Rejeição'}
                      </h4>
                      <p className="text-sm text-gray-600">{application.approval_details.comments}</p>
                      {application.approval_details.approved && (
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Valor Aprovado</p>
                            <p className="font-bold text-green-600">
                              {formatCurrency(application.approval_details.approved_amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Taxa Final</p>
                            <p className="font-bold text-green-600">
                              {application.approval_details.final_interest_rate.toFixed(2)}% a.m.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    {isAdmin && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedApplication(application.id)
                          setActiveTab('approval')
                        }}
                      >
                        <Icon name="eye" className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    )}
                    {application.status === 'approved' && (
                      <Button onClick={() => setActiveTab('schedule')}>
                        <Icon name="calendar" className="w-4 h-4 mr-2" />
                        Ver Cronograma
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <RepaymentSchedule
            loanId={1}
            schedule={mockPaymentSchedules}
            onPaymentUpdate={(scheduleId, status) => {
              console.log('Pagamento atualizado:', scheduleId, status)
            }}
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
    </div>
  )
}

export default LoansPage