import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ChartContainer from './ChartContainer'

interface LoanStatusBarChartProps {
  data: Array<{
    status: string
    count: number
    value: number
    color: string
    description: string
  }>
  loading?: boolean
}

export default function LoanStatusBarChart({ data, loading = false }: LoanStatusBarChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div 
          className="bg-white p-3 rounded-lg shadow-lg border"
          style={{ 
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-elevated)'
          }}
        >
          <p className="text-body font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {data.status}
          </p>
          <p className="text-caption mb-2" style={{ color: 'var(--text-secondary)' }}>
            {data.description}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.color }}
              ></div>
              <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                Quantidade: {data.count} empréstimos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.color }}
              ></div>
              <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                Valor Total: {formatCurrency(data.value)}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const formatYAxisTick = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)
  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <ChartContainer
      title="Status dos Empréstimos"
      subtitle={`${totalCount} empréstimos totalizando ${formatCurrency(totalValue)}`}
      loading={loading}
      height={350}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--border-light)" 
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="status"
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: 11, 
              fill: 'var(--text-secondary)' 
            }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: 12, 
              fill: 'var(--text-secondary)' 
            }}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            stroke="var(--bg-page)"
            strokeWidth={1}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}