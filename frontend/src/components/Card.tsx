import { TrendIcon } from './Icon'

interface CardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

export default function Card({ title, value, subtitle, icon, trend }: CardProps) {
  return (
    <div className="card card-metric">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="card-metric-label">{title}</p>
          <p className="card-metric-value">{value}</p>
          {subtitle && (
            <p className="text-caption mt-1" style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div 
              className="flex items-center gap-1 mt-2 text-sm"
              style={{ 
                color: trend.direction === 'up' ? 'var(--color-green)' : 'var(--color-red)' 
              }}
            >
              <TrendIcon direction={trend.direction} size={16} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl" style={{ color: 'var(--color-primary)' }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

