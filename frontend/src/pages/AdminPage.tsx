import { useState } from 'react'
import Button from '../components/Button'
import Icon from '../components/Icon'
import RevenueDistribution from '../components/RevenueDistribution'
import FraudDetection from '../components/FraudDetection'
import LoanApprovalWorkflow from '../components/LoanApprovalWorkflow'
import { getDistributions } from '../data/mockData'

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('distributions')

  const tabs = [
    {
      id: 'distributions',
      name: 'Distribuição de Receita',
      icon: 'dollar-sign',
      description: 'Gerenciar distribuições para investidores'
    },
    {
      id: 'fraud',
      name: 'Detecção de Fraudes',
      icon: 'shield',
      description: 'Monitorar atividades suspeitas'
    },
    {
      id: 'loans',
      name: 'Aprovação de Empréstimos',
      icon: 'file-text',
      description: 'Analisar solicitações de empréstimo'
    }
  ]

  const distributions = getDistributions()

  const handleDistributionProcess = (distributionId: number) => {
    console.log('Processando distribuição:', distributionId)
    // Aqui seria feita a lógica real de processamento
  }

  const handleEventUpdate = (eventId: number, status: string) => {
    console.log('Atualizando evento:', eventId, 'para status:', status)
    // Aqui seria feita a lógica real de atualização
  }

  const handleLoanApproval = (approved: boolean, details: any) => {
    console.log('Empréstimo', approved ? 'aprovado' : 'rejeitado', details)
    // Aqui seria feita a lógica real de aprovação/rejeição
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
        <p className="text-gray-600">Gestão completa da plataforma de investimentos</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon 
                name={tab.icon as any} 
                className={`mr-2 w-5 h-5 ${
                  activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
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

        {activeTab === 'loans' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Aprovação de Empréstimos</h2>
                <p className="text-gray-600">
                  Analise e aprove/rejeite solicitações de empréstimo com base na análise de risco.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">
                  <Icon name="filter" className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button size="sm">
                  <Icon name="download" className="w-4 h-4 mr-2" />
                  Relatório
                </Button>
              </div>
            </div>

            {/* Lista de aplicações para aprovação */}
            <div className="grid gap-6">
              {/* Aplicação 1 - Em análise */}
              <LoanApprovalWorkflow 
                applicationId={1}
                onApprovalChange={handleLoanApproval}
              />
              
              {/* Aplicação 3 - Em análise (a 2 já foi aprovada) */}
              {/* <LoanApprovalWorkflow 
                applicationId={3}
                onApprovalChange={handleLoanApproval}
              /> */}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="secondary" className="flex items-center justify-center">
            <Icon name="download" className="w-4 h-4 mr-2" />
            Exportar Relatórios
          </Button>
          <Button variant="secondary" className="flex items-center justify-center">
            <Icon name="settings" className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button variant="secondary" className="flex items-center justify-center">
            <Icon name="bell" className="w-4 h-4 mr-2" />
            Notificações
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminPage