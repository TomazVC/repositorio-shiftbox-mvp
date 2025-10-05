import { useState, useEffect } from 'react'
import Button from './Button'
import Card from './Card'
import Icon from './Icon'
import Modal from './Modal'
import Input from './Input'
import { formatCurrency } from '../utils/format'
import { useLoanApplication } from '../hooks/useLoanApplication'
import { ApprovalDetails } from '../types/wallet'

interface LoanApprovalWorkflowProps {
  applicationId: number
  onApprovalChange?: (approved: boolean, details: ApprovalDetails) => void
  className?: string
}

const LoanApprovalWorkflow = ({ applicationId, onApprovalChange, className = '' }: LoanApprovalWorkflowProps) => {
  const { application, isLoading, error, updateApplication } = useLoanApplication(applicationId)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalType, setApprovalType] = useState<'approve' | 'reject' | null>(null)
  const [approvalComment, setApprovalComment] = useState('')
  const [adjustedAmount, setAdjustedAmount] = useState('')
  const [adjustedRate, setAdjustedRate] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Atualizar valores quando a aplicação carrega
  useEffect(() => {
    if (application) {
      setAdjustedAmount(application.requested_amount.toString())
      setAdjustedRate(application.proposed_interest_rate.toString())
    }
  }, [application])

  const handleApproval = (type: 'approve' | 'reject') => {
    setApprovalType(type)
    setShowApprovalModal(true)
  }

  const processApproval = async () => {
    if (!application || !approvalType) return

    setIsProcessing(true)

    try {
      const approvalDetails: ApprovalDetails = {
        approved: approvalType === 'approve',
        approved_amount: approvalType === 'approve' ? parseFloat(adjustedAmount) : 0,
        final_interest_rate: approvalType === 'approve' ? parseFloat(adjustedRate) : 0,
        approval_date: new Date().toISOString().split('T')[0],
        approved_by: 'analista_sistema', // Em um sistema real, seria o ID do analista
        comments: approvalComment || (approvalType === 'approve' ? 'Aprovado automaticamente' : 'Rejeitado por análise de risco'),
        conditions: approvalType === 'approve' ? [
          'Comprovação de renda atualizada',
          'Conta corrente no banco há pelo menos 6 meses',
          'Sem pendências no SPC/Serasa'
        ] : []
      }

      // Usar o hook para atualizar via API
      const updatedApp = await updateApplication(
        approvalType === 'approve' ? 'approved' : 'rejected',
        approvalDetails
      )

      if (updatedApp) {
        onApprovalChange?.(approvalType === 'approve', approvalDetails)
        setShowApprovalModal(false)
        setApprovalComment('')
      }
    } catch (error) {
      console.error('Erro ao processar aprovação:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-amber-600 bg-amber-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'under_review': return 'Em Análise'
      case 'approved': return 'Aprovado'
      case 'rejected': return 'Rejeitado'
      default: return 'Desconhecido'
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-8 text-center">
          <Icon name="clock" className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando solicitação...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-8 text-center">
          <Icon name="warning" className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600">Erro: {error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="secondary"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-8 text-center">
          <Icon name="warning" className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600">Solicitação não encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-2xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
        <div className="p-8">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Icon name="file-text" className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">
                    Solicitação #{application.id}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    <Icon name="calendar" className="w-4 h-4 inline mr-1" />
                    {new Date(application.application_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm ${
                application.status === 'approved' ? 'bg-green-500/20 text-green-100 border border-green-400/30' :
                application.status === 'rejected' ? 'bg-red-500/20 text-red-100 border border-red-400/30' :
                application.status === 'under_review' ? 'bg-amber-500/20 text-amber-100 border border-amber-400/30' :
                'bg-white/20 text-white border border-white/30'
              }`}>
                <Icon name={
                  application.status === 'approved' ? 'check-circle' :
                  application.status === 'rejected' ? 'x-circle' :
                  application.status === 'under_review' ? 'clock' : 'file-text'
                } className="w-4 h-4 inline mr-1" />
                {getStatusText(application.status)}
              </div>
            </div>
            
            {/* Valor em destaque */}
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Valor Solicitado</p>
                <p className="text-3xl font-bold">{formatCurrency(application.requested_amount)}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm mb-1">Prazo</p>
                <p className="text-xl font-semibold">{application.duration_months} meses</p>
              </div>
            </div>
          </div>

          {/* Informações do Solicitante */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon name="user" className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Informações do Solicitante</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <Icon name="user" className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Usuário ID</p>
                      <p className="font-semibold text-gray-900">{application.user_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <Icon name="credit-card" className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">CPF/CNPJ</p>
                      <p className="font-semibold text-gray-900">{application.applicant_info.document}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <Icon name="dollar-sign" className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Renda Mensal</p>
                      <p className="font-semibold text-green-600">{formatCurrency(application.applicant_info.monthly_income)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <Icon name="building" className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Empresa</p>
                      <p className="font-semibold text-gray-900">{application.applicant_info.company_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Detalhes da Solicitação */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Icon name="file-text" className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Detalhes da Solicitação</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Valor Solicitado</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(application.requested_amount)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-600">Prazo</p>
                      <p className="font-semibold text-gray-900">{application.duration_months} meses</p>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-gray-100">
                      <p className="text-sm text-gray-600">Taxa Proposta</p>
                      <p className="font-semibold text-green-600">{application.proposed_interest_rate.toFixed(2)}% a.m.</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-600">Finalidade</p>
                    <p className="font-semibold text-gray-900">
                      {application.purpose === 'capital_giro' ? 'Capital de Giro' :
                       application.purpose === 'expansao' ? 'Expansão' :
                       application.purpose === 'equipamentos' ? 'Equipamentos' :
                       application.purpose === 'marketing' ? 'Marketing' :
                       application.purpose === 'reforma' ? 'Reforma' : 'Outros'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Análise de Risco */}
          {application.risk_analysis && (
            <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-slate-50 to-blue-50">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Icon name="shield" className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Análise de Risco</h4>
                    <p className="text-gray-600">Avaliação automatizada do perfil de crédito</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Score e Status */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold mb-6 ${getRiskLevelColor(application.risk_analysis.risk_level)}`}>
                        <Icon name="alert-triangle" className="w-4 h-4" />
                        Risco {application.risk_analysis.risk_level === 'low' ? 'Baixo' : 
                                application.risk_analysis.risk_level === 'medium' ? 'Médio' : 'Alto'}
                      </div>
                      
                      {/* Score visual */}
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                            strokeDasharray="100, 100"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={application.risk_analysis.score >= 0.7 ? '#10b981' : application.risk_analysis.score >= 0.5 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="2"
                            strokeDasharray={`${application.risk_analysis.score * 100}, 100`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-gray-900">
                            {(application.risk_analysis.score * 100).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Score de Crédito</p>
                    </div>
                  </div>
                  
                  {/* Fatores */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Fatores Positivos */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon name="check-circle" className="w-6 h-6 text-green-600" />
                          <h5 className="font-bold text-green-800">Fatores Positivos</h5>
                        </div>
                        <div className="space-y-3">
                          {application.risk_analysis.factors.positive.map((factor: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                              <Icon name="check" className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-green-800 font-medium">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Fatores de Atenção */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon name="warning" className="w-6 h-6 text-amber-600" />
                          <h5 className="font-bold text-amber-800">Fatores de Atenção</h5>
                        </div>
                        <div className="space-y-3">
                          {application.risk_analysis.factors.negative.map((factor: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                              <Icon name="warning" className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-amber-800 font-medium">{factor}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Recomendações */}
                    <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon name="info" className="w-6 h-6 text-blue-600" />
                        <h5 className="font-bold text-blue-800">Recomendações da Análise</h5>
                      </div>
                      <div className="space-y-3">
                        {application.risk_analysis.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                            <Icon name="info" className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-blue-800 font-medium">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Detalhes da Aprovação/Rejeição */}
          {application.approval_details && (
            <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${application.approval_details.approved ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Icon name={application.approval_details.approved ? 'check-circle' : 'x-circle'} 
                          className={`w-8 h-8 ${application.approval_details.approved ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {application.approval_details.approved ? 'Detalhes da Aprovação' : 'Detalhes da Rejeição'}
                    </h4>
                    <p className="text-gray-600">
                      Processado em {new Date(application.approval_details.approval_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {application.approval_details.approved && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="dollar-sign" className="w-5 h-5 text-green-600" />
                          <p className="text-sm font-medium text-green-800">Valor Aprovado</p>
                        </div>
                        <p className="text-3xl font-bold text-green-700">
                          {formatCurrency(application.approval_details.approved_amount)}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="trending-up" className="w-5 h-5 text-blue-600" />
                          <p className="text-sm font-medium text-blue-800">Taxa Final</p>
                        </div>
                        <p className="text-3xl font-bold text-blue-700">
                          {application.approval_details.final_interest_rate.toFixed(2)}% a.m.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="message-circle" className="w-5 h-5 text-gray-600" />
                      <p className="text-sm font-medium text-gray-700">Comentários do Analista</p>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{application.approval_details.comments}</p>
                  </div>
                  
                  {application.approval_details.conditions.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon name="check-circle" className="w-5 h-5 text-amber-600" />
                        <p className="text-sm font-medium text-amber-800">Condições da Aprovação</p>
                      </div>
                      <div className="space-y-3">
                        {application.approval_details.conditions.map((condition: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                            <Icon name="check" className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-amber-800 font-medium">{condition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Analista:</span> {application.approval_details.approved_by}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Data:</span> {new Date(application.approval_details.approval_date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Ações */}
          {application.status === 'under_review' && (
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Decisão de Análise</h4>
                <p className="text-gray-600">Tome uma decisão sobre esta solicitação de empréstimo</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleApproval('approve')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Icon name="check" className="w-5 h-5 mr-3" />
                  Aprovar Solicitação
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => handleApproval('reject')}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border-0"
                >
                  <Icon name="x" className="w-5 h-5 mr-3" />
                  Rejeitar Solicitação
                </Button>
              </div>
            </div>
          )}

          {/* Status não modificável */}
          {application.status !== 'under_review' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 text-center">
              <Icon name={
                application.status === 'approved' ? 'check-circle' :
                application.status === 'rejected' ? 'x-circle' : 'clock'
              } className={`w-12 h-12 mx-auto mb-3 ${
                application.status === 'approved' ? 'text-green-600' :
                application.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
              }`} />
              <p className="text-lg font-semibold text-gray-900 mb-1">
                Solicitação {getStatusText(application.status)}
              </p>
              <p className="text-gray-600">
                Esta solicitação já foi processada e não pode ser modificada
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Aprovação/Rejeição */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title={approvalType === 'approve' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
      >
        <div className="space-y-6">
          {/* Header do modal */}
          <div className={`p-4 rounded-xl border ${
            approvalType === 'approve' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <Icon name={approvalType === 'approve' ? 'check-circle' : 'x-circle'} 
                    className={`w-6 h-6 ${approvalType === 'approve' ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <h3 className={`font-semibold ${approvalType === 'approve' ? 'text-green-800' : 'text-red-800'}`}>
                  {approvalType === 'approve' ? 'Confirmação de Aprovação' : 'Confirmação de Rejeição'}
                </h3>
                <p className={`text-sm ${approvalType === 'approve' ? 'text-green-600' : 'text-red-600'}`}>
                  Solicitação #{application?.id} - {formatCurrency(application?.requested_amount || 0)}
                </p>
              </div>
            </div>
          </div>

          {approvalType === 'approve' && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-gray-900 mb-4">Ajustar Condições da Aprovação</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Icon name="dollar-sign" className="w-4 h-4 inline mr-1" />
                    Valor Aprovado
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      R$
                    </span>
                    <Input
                      type="number"
                      value={adjustedAmount}
                      onChange={(e) => setAdjustedAmount(e.target.value)}
                      className="pl-10 text-lg font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Icon name="trending-up" className="w-4 h-4 inline mr-1" />
                    Taxa Final (% a.m.)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={adjustedRate}
                    onChange={(e) => setAdjustedRate(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Icon name="message-circle" className="w-4 h-4 inline mr-1" />
              Comentários da Análise
            </label>
            <textarea
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder={approvalType === 'approve' ? 
                'Descreva as condições e observações da aprovação...' : 
                'Explique os motivos técnicos da rejeição...'
              }
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Icon name="info" className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Importante</p>
                <p className="text-amber-700">
                  {approvalType === 'approve' 
                    ? 'Esta decisão irá liberar o valor para o solicitante e iniciar o processo de empréstimo.'
                    : 'Esta decisão é final e o solicitante será notificado sobre a rejeição.'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={processApproval}
              disabled={isProcessing}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                approvalType === 'approve'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white'
              }`}
            >
              {isProcessing ? (
                <Icon name="clock" className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Icon name={approvalType === 'approve' ? 'check' : 'x'} className="w-4 h-4 mr-2" />
              )}
              {isProcessing ? 'Processando...' : `Confirmar ${approvalType === 'approve' ? 'Aprovação' : 'Rejeição'}`}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowApprovalModal(false)}
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl font-semibold border-2 border-gray-300 hover:border-gray-400 transition-all duration-300"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default LoanApprovalWorkflow