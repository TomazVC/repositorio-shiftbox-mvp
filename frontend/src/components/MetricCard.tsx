import { ReactNode } from 'react'

interface MetricCardProps {
  value: string | number
  label: string
  icon?: ReactNode
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  onClick?: () => void
}

export default function MetricCard({ value, label, icon, trend, onClick }: MetricCardProps) {
  return (
    <div
      className={`card card-metric ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="card-metric-label">{label}</p>
          <p className="card-metric-value">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
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

