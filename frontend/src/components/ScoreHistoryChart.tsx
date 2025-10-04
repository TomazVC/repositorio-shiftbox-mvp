import { useMemo } from 'react'
import Icon from './Icon'
import { ScoreHistory } from '../types/wallet'

interface ScoreHistoryChartProps {
  history: ScoreHistory[]
  height?: number
}

const ScoreHistoryChart = ({ history, height = 200 }: ScoreHistoryChartProps) => {
  const chartData = useMemo(() => {
    // Ordenar por data
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    if (sortedHistory.length === 0) return { points: [], maxScore: 1000, minScore: 0 }

    const maxScore = Math.max(...sortedHistory.map(h => h.score), 1000)
    const minScore = Math.min(...sortedHistory.map(h => h.score), 0)

    // Criar pontos para o gráfico
    const points = sortedHistory.map((item, index) => {
      const x = (index / (sortedHistory.length - 1)) * 100
      const y = ((maxScore - item.score) / (maxScore - minScore)) * 100
      
      return {
        x,
        y,
        score: item.score,
        date: item.created_at,
        reason: item.reason,
        risk_level: item.risk_level
      }
    })

    return { points, maxScore, minScore, history: sortedHistory }
  }, [history])

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

  const getRiskLevelLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'excellent': return 'Excelente'
      case 'good': return 'Bom'
      case 'fair': return 'Regular'
      case 'poor': return 'Ruim'
      case 'very_poor': return 'Muito Ruim'
      default: return 'Desconhecido'
    }
  }

  const createPath = () => {
    if (chartData.points.length === 0) return ''
    
    const pathData = chartData.points.map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command} ${point.x} ${point.y}`
    }).join(' ')
    
    return pathData
  }

  const createAreaPath = () => {
    if (chartData.points.length === 0) return ''
    
    const pathData = createPath()
    const lastPoint = chartData.points[chartData.points.length - 1]
    const firstPoint = chartData.points[0]
    
    return `${pathData} L ${lastPoint.x} 100 L ${firstPoint.x} 100 Z`
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico do Score</h3>
        <div className="text-center py-12">
          <Icon name="chart-line" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico disponível</h4>
          <p className="text-gray-600">O histórico do score será exibido aqui conforme for sendo atualizado.</p>
        </div>
      </div>
    )
  }

  const currentScore = chartData.history?.[chartData.history.length - 1]
  const previousScore = chartData.history && chartData.history.length > 1 ? chartData.history[chartData.history.length - 2] : null
  const scoreDifference = previousScore && currentScore ? currentScore.score - previousScore.score : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Histórico do Score</h3>
          <div className="flex items-center gap-4">
            {scoreDifference !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${
                scoreDifference > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <Icon 
                  name={scoreDifference > 0 ? 'trending-up' : 'trending-down'} 
                  className="w-4 h-4" 
                />
                <span>{scoreDifference > 0 ? '+' : ''}{scoreDifference} pontos</span>
              </div>
            )}
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{currentScore?.score || 0}</div>
              <div className={`text-sm font-medium ${getRiskLevelColor(currentScore?.risk_level || 'fair')}`}>
                {getRiskLevelLabel(currentScore?.risk_level || 'fair')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <div className="relative" style={{ height: `${height}px` }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Área do gráfico */}
            <path
              d={createAreaPath()}
              fill="url(#gradient)"
              opacity="0.3"
            />
            
            {/* Linha do gráfico */}
            <path
              d={createPath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Pontos */}
            {chartData.points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                className="hover:r-4 transition-all cursor-pointer"
              />
            ))}
            
            {/* Gradiente */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
          </svg>
          
          {/* Labels dos eixos */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Eixo Y */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
              <span>{chartData.maxScore}</span>
              <span>{Math.round((chartData.maxScore + chartData.minScore) / 2)}</span>
              <span>{chartData.minScore}</span>
            </div>
            
            {/* Eixo X */}
            <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-gray-500">
              {chartData.points.length > 1 && (
                <>
                  <span>
                    {new Date(chartData.points[0].date).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </span>
                  <span>
                    {new Date(chartData.points[chartData.points.length - 1].date).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Histórico detalhado */}
      <div className="border-t border-gray-200">
        <div className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Eventos recentes</h4>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {chartData.history?.slice(-5).reverse().map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-gray-900">{item.reason}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{item.score}</p>
                  <p className={`text-xs ${getRiskLevelColor(item.risk_level)}`}>
                    {getRiskLevelLabel(item.risk_level)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreHistoryChart