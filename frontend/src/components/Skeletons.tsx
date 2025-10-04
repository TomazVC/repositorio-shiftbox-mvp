// Skeleton components para loading states

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i}>
                <div className="skeleton h-4 w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex}>
                  {colIndex === 0 ? (
                    // Primeira coluna com avatar
                    <div className="flex items-center">
                      <div className="skeleton h-10 w-10 rounded-full"></div>
                      <div className="ml-4">
                        <div className="skeleton h-4 w-24 mb-1"></div>
                      </div>
                    </div>
                  ) : colIndex === columns - 1 ? (
                    // Última coluna com botões
                    <div className="flex gap-2">
                      <div className="skeleton h-8 w-16"></div>
                      <div className="skeleton h-8 w-16"></div>
                    </div>
                  ) : (
                    // Colunas normais
                    <div className="skeleton h-4 w-20"></div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-4 w-20 mb-2"></div>
      <div className="skeleton h-8 w-32 mb-2"></div>
      <div className="skeleton h-3 w-16"></div>
    </div>
  )
}

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

export function UserCardSkeleton() {
  return (
    <div className="card">
      <div className="flex items-center">
        <div className="skeleton h-12 w-12 rounded-full"></div>
        <div className="ml-4 flex-1">
          <div className="skeleton h-5 w-32 mb-2"></div>
          <div className="skeleton h-4 w-48"></div>
        </div>
        <div className="skeleton h-6 w-20"></div>
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <div className="skeleton h-4 w-20 mb-2"></div>
        <div className="skeleton h-11 w-full"></div>
      </div>
      <div>
        <div className="skeleton h-4 w-16 mb-2"></div>
        <div className="skeleton h-11 w-full"></div>
      </div>
      <div>
        <div className="skeleton h-4 w-24 mb-2"></div>
        <div className="skeleton h-11 w-full"></div>
      </div>
      <div className="flex gap-3 justify-end pt-4">
        <div className="skeleton h-11 w-20"></div>
        <div className="skeleton h-11 w-24"></div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="skeleton h-8 w-64 mb-2"></div>
        <div className="skeleton h-4 w-96"></div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Gráfico largo */}
      <ChartSkeleton height={300} />

      {/* Cards inferiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="skeleton h-6 w-32 mb-4"></div>
          <div className="skeleton h-8 w-16 mb-1"></div>
          <div className="skeleton h-4 w-48"></div>
        </div>
        <div className="card">
          <div className="skeleton h-6 w-24 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="skeleton h-4 w-20"></div>
                <div className="skeleton h-6 w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}