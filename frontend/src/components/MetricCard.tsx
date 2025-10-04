import { ReactNode } from 'react'
import { TrendIcon } from './Icon'

interface MetricCardProps {
  value: string | number
  label: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  onClick?: () => void
  compact?: boolean
}

// Função para formatar valores grandes de forma inteligente
const formatLargeNumber = (value: number): { formatted: string; size: 'small' | 'medium' | 'large' } => {
  const absValue = Math.abs(value)
  
  if (absValue >= 1e9) {
    return {
      formatted: `${(value / 1e9).toFixed(1)}B`,
      size: 'medium'
    }
  } else if (absValue >= 1e6) {
    return {
      formatted: `${(value / 1e6).toFixed(1)}M`,
      size: 'medium'
    }
  } else if (absValue >= 1e3) {
    return {
      formatted: `${(value / 1e3).toFixed(1)}K`,
      size: 'medium'
    }
  } else {
    return {
      formatted: value.toString(),
      size: 'large'
    }
  }
}

// Função para detectar se um valor formatado é muito longo
const getValueDisplayProps = (value: string | number) => {
  const stringValue = value.toString()
  
  // Se é um número, usar formatação inteligente
  if (typeof value === 'number') {
    return formatLargeNumber(value)
  }
  
  // Se é uma string com moeda brasileira
  if (stringValue.includes('R$')) {
    // Extrair valor numérico da string de moeda
    const cleanValue = stringValue.replace(/[R$\s.]/g, '').replace(',', '.')
    const numericValue = parseFloat(cleanValue)
    
    if (!isNaN(numericValue)) {
      if (numericValue >= 1e9) {
        return {
          formatted: `R$ ${(numericValue / 1e9).toFixed(1)}B`,
          size: 'medium' as const
        }
      } else if (numericValue >= 1e6) {
        return {
          formatted: `R$ ${(numericValue / 1e6).toFixed(1)}M`,
          size: 'medium' as const
        }
      } else if (numericValue >= 1e3) {
        return {
          formatted: `R$ ${(numericValue / 1e3).toFixed(0)}K`,
          size: 'medium' as const
        }
      }
    }
  }
  
  // Para strings longas, usar tamanho menor
  const length = stringValue.length
  if (length > 15) {
    return {
      formatted: stringValue,
      size: 'small' as const
    }
  } else if (length > 10) {
    return {
      formatted: stringValue,
      size: 'medium' as const
    }
  }
  
  return {
    formatted: stringValue,
    size: 'large' as const
  }
}

export default function MetricCard({ value, label, icon, trend, onClick, compact = false }: MetricCardProps) {
  const { formatted, size } = getValueDisplayProps(value)
  return (
    <div
      className={`card card-metric ${onClick ? 'cursor-pointer hover:shadow-hover transition-shadow' : ''} ${compact ? 'card-metric-compact' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex-1">
            <p className="card-metric-label truncate" title={label}>{label}</p>
            <div className="mt-1">
              <p 
                className={`card-metric-value break-words leading-tight ${
                  size === 'small' ? 'card-metric-value-small' : 
                  size === 'medium' ? 'card-metric-value-medium' : 
                  'card-metric-value-large'
                }`}
                title={value.toString()}
              >
                {formatted}
              </p>
            </div>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendIcon direction={trend.direction} size={16} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`flex-shrink-0 ml-3 ${
            compact ? 'text-2xl' : 'text-3xl'
          }`} style={{ color: 'var(--color-primary)' }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

