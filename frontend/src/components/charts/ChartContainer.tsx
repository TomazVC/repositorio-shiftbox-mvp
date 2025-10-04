import { ReactNode } from 'react'

interface ChartContainerProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  height?: number
  loading?: boolean
}

export default function ChartContainer({ 
  title, 
  subtitle, 
  children, 
  className = '',
  height = 350,
  loading = false 
}: ChartContainerProps) {
  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-h2 font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-caption mt-1" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Chart Content */}
      <div 
        className="relative"
        style={{ height: `${height}px` }}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-3 border-t-primary rounded-full animate-spin"></div>
              <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                Carregando gráfico...
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

// Skeleton para loading state
export function ChartSkeleton({ height = 350 }: { height?: number }) {
  return (
    <div className="card">
      <div className="mb-6">
        <div className="skeleton h-6 w-48 mb-2"></div>
        <div className="skeleton h-4 w-64"></div>
      </div>
      <div 
        className="skeleton rounded-lg"
        style={{ height: `${height}px` }}
      ></div>
    </div>
  )
}