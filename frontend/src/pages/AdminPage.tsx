import { useState } from 'react'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Card from '../components/Card'
import AlertModal from '../components/AlertModal'
import RevenueDistribution from '../components/RevenueDistribution'
import FraudDetection from '../components/FraudDetection'
import LoanApprovalWorkflow from '../components/LoanApprovalWorkflow'
import { getDistributions, mockLoanApplications } from '../data/mockData'
import { formatCurrency } from '../utils/format'
import { useAlert } from '../hooks/useAlert'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedApplications, setSelectedApplications] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const { alertState, showSuccess, showInfo, showConfirm, hideAlert } = useAlert()

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'home',
      description: 'Visão geral da plataforma'
    },
    {
      id: 'loans',
      name: 'Empréstimos',
      icon: 'file-text',
      description: 'Gestão de solicitações'
    },
    {
      id: 'distributions',
      name: 'Distribuições',
      icon: 'dollar-sign',
      description: 'Receita dos investidores'
    },
    {
      id: 'fraud',
      name: 'Segurança',
      icon: 'shield',
      description: 'Detecção de fraudes'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: 'trending-up',
      description: 'Relatórios e métricas'
    }
  ]

  // Estados e dados
  const distributions = getDistributions()
  const loanApplications = mockLoanApplications.filter(app => app.status === 'under_review')
  
  // Métricas do dashboard
  const metrics = {
    totalApplications: mockLoanApplications.length,
    pendingApprovals: loanApplications.length,
    totalValue: mockLoanApplications.reduce((sum, app) => sum + app.requested_amount, 0),
    approvalRate: mockLoanApplications.filter(app => app.status === 'approved').length / mockLoanApplications.length * 100
  }

  // Filtrar aplicações
  const filteredApplications = loanApplications.filter(app => {
    const matchesSearch = app.applicant_info.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toString().includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Ações em lote
  const handleBulkAction = (action: string) => {
    if (selectedApplications.length === 0) {
      showInfo('Seleção Necessária', 'Selecione pelo menos uma solicitação para continuar')
      return
    }
    
    const actionText = action === 'approve' ? 'aprovar' : 'rejeitar'
    showConfirm({
      title: `Confirmar Ação em Lote`,
      message: (
        <div className="space-y-3">
          <p>Deseja <strong>{actionText}</strong> as <strong>{selectedApplications.length}</strong> solicitações selecionadas?</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
      ),
      confirmText: actionText === 'aprovar' ? 'Aprovar Todas' : 'Rejeitar Todas',
      onConfirm: () => {
        console.log(`Ação em lote: ${action}`, selectedApplications)
        setSelectedApplications([])
        showSuccess(
          'Ação Concluída',
          `${selectedApplications.length} solicitações ${actionText === 'aprovar' ? 'aprovadas' : 'rejeitadas'} com sucesso!`
        )
      }
    })
  }

  const handleDistributionProcess = (distributionId: number) => {
    console.log('Processando distribuição:', distributionId)
  }

  const handleEventUpdate = (eventId: number, status: string) => {
    console.log('Atualizando evento:', eventId, 'para status:', status)
  }

  const handleLoanApproval = (approved: boolean, details: any) => {
    console.log('Empréstimo', approved ? 'aprovado' : 'rejeitado', details)
  }

  const handleExportReports = () => {
    const reportData = `
Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}

RESUMO DE DISTRIBUIÇÕES
======================
Total de Distribuições: ${distributions.length}
Distribuições Concluídas: ${distributions.filter(d => d.status === 'completed').length}
Distribuições Pendentes: ${distributions.filter(d => d.status === 'pending').length}

VALORES
=======
Total Distribuído: R$ ${distributions.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.investor_amount, 0).toLocaleString()}
Total Pendente: R$ ${distributions.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.investor_amount, 0).toLocaleString()}
    `

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-admin-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    showSuccess(
      'Relatório Exportado',
      'O relatório administrativo foi baixado com sucesso!'
    )
  }

  const handleShowSettings = () => {
    showInfo(
      'Configurações do Sistema',
      (
        <div className="space-y-4 text-left">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Taxa da Plataforma:</span>
              <span className="text-blue-600 font-semibold">5%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Reserva de Segurança:</span>
              <span className="text-blue-600 font-semibold">2%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Limite de Empréstimo:</span>
              <span className="text-blue-600 font-semibold">R$ 100.000</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Taxa de Juros Base:</span>
              <span className="text-blue-600 font-semibold">2.5% a.m.</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            🛠️ Funcionalidade completa em desenvolvimento
          </p>
        </div>
      )
    )
  }

  const handleShowNotifications = () => {
    showInfo(
      'Notificações Recentes',
      (
        <div className="space-y-4 text-left">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-xl">🔔</span>
              <span className="text-blue-800">3 novas solicitações de empréstimo</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="text-xl">🔔</span>
              <span className="text-amber-800">2 distribuições pendentes</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <span className="text-xl">🔔</span>
              <span className="text-red-800">1 evento de segurança para investigar</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-xl">🔔</span>
              <span className="text-green-800">Sistema funcionando normalmente</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            📱 Central de notificações em desenvolvimento
          </p>
        </div>
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-3">Painel Administrativo</h1>
                <p className="text-blue-100 text-lg">Gestão completa da plataforma ShiftBox</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100 mb-1">Última atualização</div>
                <div className="text-lg font-semibold">{new Date().toLocaleTimeString('pt-BR')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
            <nav className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon 
                    name={tab.icon as any} 
                    className={`mr-2 w-5 h-5 ${
                      activeTab === tab.id ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Métricas principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Icon name="file-text" className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total de Solicitações</p>
                        <p className="text-2xl font-bold text-blue-800">{metrics.totalApplications}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <Icon name="clock" className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-amber-600 font-medium">Aguardando Aprovação</p>
                        <p className="text-2xl font-bold text-amber-800">{metrics.pendingApprovals}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <Icon name="dollar-sign" className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">Volume Total</p>
                        <p className="text-2xl font-bold text-green-800">{formatCurrency(metrics.totalValue)}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Icon name="trending-up" className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Taxa de Aprovação</p>
                        <p className="text-2xl font-bold text-purple-800">{metrics.approvalRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Ações rápidas */}
              <Card className="bg-gradient-to-br from-gray-50 to-slate-50">
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={handleExportReports}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold"
                    >
                      <Icon name="download" className="w-5 h-5 mr-3" />
                      Exportar Relatórios
                    </Button>
                    <Button 
                      onClick={handleShowSettings}
                      className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white py-4 rounded-xl font-semibold"
                    >
                      <Icon name="settings" className="w-5 h-5 mr-3" />
                      Configurações
                    </Button>
                    <Button 
                      onClick={handleShowNotifications}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold"
                    >
                      <Icon name="bell" className="w-5 h-5 mr-3" />
                      Notificações
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-6">
              {/* Controles de filtro e busca */}
              <Card className="bg-white shadow-lg">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                        <div className="relative">
                          <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ID ou empresa..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">Todos</option>
                          <option value="under_review">Em Análise</option>
                          <option value="pending">Pendente</option>
                          <option value="approved">Aprovado</option>
                          <option value="rejected">Rejeitado</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="date">Data</option>
                          <option value="amount">Valor</option>
                          <option value="risk">Risco</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Ações em lote */}
                    {selectedApplications.length > 0 && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleBulkAction('approve')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          <Icon name="check" className="w-4 h-4 mr-2" />
                          Aprovar ({selectedApplications.length})
                        </Button>
                        <Button 
                          onClick={() => handleBulkAction('reject')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          <Icon name="x" className="w-4 h-4 mr-2" />
                          Rejeitar ({selectedApplications.length})
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Lista de aplicações */}
              <div className="space-y-6">
                {filteredApplications.map((app) => (
                  <div key={app.id} className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(app.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApplications([...selectedApplications, app.id])
                          } else {
                            setSelectedApplications(selectedApplications.filter(id => id !== app.id))
                          }
                        }}
                        className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <LoanApprovalWorkflow 
                      applicationId={app.id}
                      onApprovalChange={handleLoanApproval}
                      className="pl-12"
                    />
                  </div>
                ))}
                
                {filteredApplications.length === 0 && (
                  <Card className="p-12 text-center">
                    <Icon name="search" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
                    <p className="text-gray-600">
                      Ajuste os filtros ou termos de busca para encontrar solicitações
                    </p>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'distributions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Distribuição de Receita</h2>
                <p className="text-gray-600">
                  Gerencie as distribuições de juros e receitas para os investidores da plataforma.
                </p>
              </div>
              <RevenueDistribution 
                distributions={distributions}
                onDistribute={handleDistributionProcess}
              />
            </div>
          )}

          {activeTab === 'fraud' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Detecção de Fraudes</h2>
                <p className="text-gray-600">
                  Monitore e investigue atividades suspeitas em toda a plataforma.
                </p>
              </div>
              <FraudDetection onEventUpdate={handleEventUpdate} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <Card className="p-8 text-center">
              <Icon name="trending-up" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Avançado</h3>
              <p className="text-gray-600 mb-6">
                Módulo de analytics em desenvolvimento. Em breve você terá acesso a relatórios detalhados, 
                métricas de performance e análises preditivas.
              </p>
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Icon name="bell" className="w-4 h-4 mr-2" />
                Notificar quando disponível
              </Button>
            </Card>
          )}
        </div>
      </div>

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

export default AdminPage