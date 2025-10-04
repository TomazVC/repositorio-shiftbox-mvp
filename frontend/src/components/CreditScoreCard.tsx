import { useMemo } from 'react'
import Icon from './Icon'
import { CreditScore } from '../types/wallet'

interface CreditScoreCardProps {
  creditScore: CreditScore
  compact?: boolean
}

const CreditScoreCard = ({ creditScore, compact = false }: CreditScoreCardProps) => {
  const scoreData = useMemo(() => {
    const { score, risk_level } = creditScore
    
    // Configurações para cada nível de risco
    const configs = {
      excellent: {
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        label: 'Excelente',
        description: 'Risco muito baixo'
      },
      good: {
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        label: 'Bom',
        description: 'Risco baixo'
      },
      fair: {
        color: 'amber',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        iconColor: 'text-amber-600',
        label: 'Regular',
        description: 'Risco moderado'
      },
      poor: {
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-600',
        label: 'Ruim',
        description: 'Risco alto'
      },
      very_poor: {
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        label: 'Muito Ruim',
        description: 'Risco muito alto'
      }
    }

    return {
      ...configs[risk_level],
      percentage: (score / 1000) * 100
    }
  }, [creditScore])

  const getScoreIcon = () => {
    if (creditScore.score >= 800) return 'shield'
    if (creditScore.score >= 700) return 'check-circle'
    if (creditScore.score >= 600) return 'info'
    if (creditScore.score >= 400) return 'alert-triangle'
    return 'x-circle'
  }

  if (compact) {
    return (
      <div className={`p-4 rounded-lg border ${scoreData.bgColor} ${scoreData.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon 
              name={getScoreIcon()} 
              className={`w-6 h-6 ${scoreData.iconColor}`}
            />
            <div>
              <p className="font-semibold text-gray-900">{creditScore.score}</p>
              <p className={`text-sm ${scoreData.textColor}`}>{scoreData.label}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-${scoreData.color}-500 transition-all duration-500`}
                style={{ width: `${scoreData.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(scoreData.percentage)}%</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className={`p-6 ${scoreData.bgColor} border-b ${scoreData.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-white rounded-full shadow-sm`}>
              <Icon 
                name={getScoreIcon()} 
                className={`w-8 h-8 ${scoreData.iconColor}`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Score de Crédito</h3>
              <p className={`text-sm ${scoreData.textColor}`}>{scoreData.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {creditScore.score}
            </div>
            <div className={`text-sm font-medium ${scoreData.textColor}`}>
              {scoreData.label}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>0</span>
            <span>1000</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-${scoreData.color}-500 transition-all duration-1000 ease-out`}
              style={{ width: `${scoreData.percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Muito Ruim</span>
            <span>Ruim</span>
            <span>Regular</span>
            <span>Bom</span>
            <span>Excelente</span>
          </div>
        </div>

        {/* Fatores do Score */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Fatores que influenciam seu score:</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Histórico de Pagamentos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${creditScore.factors.payment_history * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">
                  {Math.round(creditScore.factors.payment_history * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Utilização de Crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${creditScore.factors.credit_utilization * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">
                  {Math.round(creditScore.factors.credit_utilization * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Tempo de Histórico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500"
                    style={{ width: `${creditScore.factors.length_of_history * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">
                  {Math.round(creditScore.factors.length_of_history * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Tipos de Crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500"
                    style={{ width: `${creditScore.factors.types_of_credit * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">
                  {Math.round(creditScore.factors.types_of_credit * 100)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Consultas Recentes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ width: `${creditScore.factors.recent_inquiries * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">
                  {Math.round(creditScore.factors.recent_inquiries * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explicações */}
        {creditScore.explanation.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Análise detalhada:</h4>
            <ul className="space-y-2">
              {creditScore.explanation.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <Icon name="info" className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Última Atualização */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Última atualização: {new Date(creditScore.last_updated).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreditScoreCard