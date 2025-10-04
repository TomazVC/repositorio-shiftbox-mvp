import { useState, useEffect } from 'react'
import Button from './Button'
import Card from './Card'
import Icon from './Icon'
import Modal from './Modal'
import Input from './Input'
import { formatCurrency } from '../utils/format'
import { getLoanApplicationById, updateLoanApplication } from '../data/mockData'
import { LoanApplication, ApprovalDetails } from '../types/wallet'

interface LoanApprovalWorkflowProps {
  applicationId: number
  onApprovalChange?: (approved: boolean, details: ApprovalDetails) => void
  className?: string
}

const LoanApprovalWorkflow = ({ applicationId, onApprovalChange, className = '' }: LoanApprovalWorkflowProps) => {
  const [application, setApplication] = useState<LoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalType, setApprovalType] = useState<'approve' | 'reject' | null>(null)
  const [approvalComment, setApprovalComment] = useState('')
  const [adjustedAmount, setAdjustedAmount] = useState('')
  const [adjustedRate, setAdjustedRate] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadApplication()
  }, [applicationId])

  const loadApplication = async () => {
    setIsLoading(true)
    try {
      // Simular carregamento
      setTimeout(() => {
        const app = getLoanApplicationById(applicationId)
        setApplication(app)
        if (app) {
          setAdjustedAmount(app.requested_amount.toString())
          setAdjustedRate(app.proposed_interest_rate.toString())
        }
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      setIsLoading(false)
    }
  }

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

      // Atualizar aplicação
      const updatedApp = {
        ...application,
        status: approvalType === 'approve' ? 'approved' as const : 'rejected' as const,
        approval_details: approvalDetails
      }

      updateLoanApplication(updatedApp)
      setApplication(updatedApp)
      onApprovalChange?.(approvalType === 'approve', approvalDetails)

      setShowApprovalModal(false)
      setApprovalComment('')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-100'
      case 'under_review': return 'text-blue-600 bg-blue-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
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
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="file-text" className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Solicitação #{application.id}
                </h3>
                <p className="text-sm text-gray-600">
                  Data: {new Date(application.application_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {getStatusText(application.status)}
            </div>
          </div>

          {/* Informações do Solicitante */}
          <Card className="mb-6">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Informações do Solicitante</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Usuário ID</p>
                  <p className="font-medium">{application.user_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPF/CNPJ</p>
                  <p className="font-medium">{application.applicant_info.document}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Renda Mensal</p>
                  <p className="font-medium">{formatCurrency(application.applicant_info.monthly_income)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Empresa</p>
                  <p className="font-medium">{application.applicant_info.company_name}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Detalhes da Solicitação */}
          <Card className="mb-6">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Detalhes da Solicitação</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Valor Solicitado</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(application.requested_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prazo</p>
                  <p className="font-medium">{application.duration_months} meses</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Finalidade</p>
                  <p className="font-medium">
                    {application.purpose === 'capital_giro' ? 'Capital de Giro' :
                     application.purpose === 'expansao' ? 'Expansão' :
                     application.purpose === 'equipamentos' ? 'Equipamentos' :
                     application.purpose === 'marketing' ? 'Marketing' :
                     application.purpose === 'reforma' ? 'Reforma' : 'Outros'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Taxa Proposta</p>
                <p className="text-lg font-bold text-green-600">
                  {application.proposed_interest_rate.toFixed(2)}% a.m.
                </p>
              </div>
            </div>
          </Card>

          {/* Análise de Risco */}
          {application.risk_analysis && (
            <Card className="mb-6">
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Análise de Risco</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`px-2 py-1 rounded text-sm font-medium ${getRiskLevelColor(application.risk_analysis.risk_level)}`}>
                        Risco {application.risk_analysis.risk_level === 'low' ? 'Baixo' : 
                                application.risk_analysis.risk_level === 'medium' ? 'Médio' : 'Alto'}
                      </div>
                      <span className="text-2xl font-bold">
                        {(application.risk_analysis.score * 100).toFixed(0)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Fatores Positivos</h5>
                      <ul className="space-y-1">
                        {application.risk_analysis.factors.positive.map((factor: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Icon name="check" className="w-4 h-4 text-green-600" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">Fatores de Atenção</h5>
                      <ul className="space-y-1">
                        {application.risk_analysis.factors.negative.map((factor: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Icon name="warning" className="w-4 h-4 text-amber-600" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Recomendações</h5>
                      <ul className="space-y-1">
                        {application.risk_analysis.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Icon name="info" className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Detalhes da Aprovação/Rejeição */}
          {application.approval_details && (
            <Card className="mb-6">
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  {application.approval_details.approved ? 'Detalhes da Aprovação' : 'Detalhes da Rejeição'}
                </h4>
                <div className="space-y-4">
                  {application.approval_details.approved && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Valor Aprovado</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(application.approval_details.approved_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Taxa Final</p>
                        <p className="text-lg font-bold text-green-600">
                          {application.approval_details.final_interest_rate.toFixed(2)}% a.m.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-600">Comentários</p>
                    <p className="font-medium">{application.approval_details.comments}</p>
                  </div>
                  
                  {application.approval_details.conditions.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Condições</p>
                      <ul className="space-y-1">
                        {application.approval_details.conditions.map((condition: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Icon name="check" className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span>{condition}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    Data: {new Date(application.approval_details.approval_date).toLocaleDateString('pt-BR')} | 
                    Analista: {application.approval_details.approved_by}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Ações */}
          {application.status === 'under_review' && (
            <div className="flex gap-3">
              <Button 
                onClick={() => handleApproval('approve')}
                className="flex-1"
              >
                <Icon name="check" className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
              <Button 
                variant="secondary"
                onClick={() => handleApproval('reject')}
                className="flex-1"
              >
                <Icon name="x" className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
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
        <div className="space-y-4">
          {approvalType === 'approve' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Aprovado
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                    <Input
                      type="number"
                      value={adjustedAmount}
                      onChange={(e) => setAdjustedAmount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa Final (% a.m.)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={adjustedRate}
                    onChange={(e) => setAdjustedRate(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentários
            </label>
            <textarea
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={approvalType === 'approve' ? 
                'Descreva as condições da aprovação...' : 
                'Explique os motivos da rejeição...'
              }
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={processApproval}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <Icon name="clock" className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Icon name="check" className="w-4 h-4 mr-2" />
              )}
              Confirmar {approvalType === 'approve' ? 'Aprovação' : 'Rejeição'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowApprovalModal(false)}
              disabled={isProcessing}
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