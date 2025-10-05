import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import ChartContainer from './ChartContainer'

interface InvestmentLineChartProps {
  data: Array<{
    month: string
    value: number
    investments: number
    date: string
  }>
  loading?: boolean
}

export default function InvestmentLineChart({ data, loading = false }: InvestmentLineChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
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
            {label} 2024
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                Total Investido: {formatCurrency(data.value)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
                Investimentos: {data.investments}
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

  // Calcular o crescimento percentual
  const firstValue = data[0]?.value || 0
  const lastValue = data[data.length - 1]?.value || 0
  const growthPercentage = firstValue > 0 ? ((lastValue - firstValue) / firstValue * 100).toFixed(1) : '0'

  return (
    <ChartContainer
      title="Evolução dos Investimentos"
      subtitle={`Crescimento de ${growthPercentage}% nos últimos 12 meses`}
      loading={loading}
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--border-light)" 
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: 12, 
              fill: 'var(--text-secondary)' 
            }}
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
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={3}
            fill="url(#colorValue)"
            dot={{ 
              fill: 'var(--color-primary)', 
              strokeWidth: 2, 
              stroke: 'var(--bg-page)',
              r: 4 
            }}
            activeDot={{ 
              r: 6, 
              fill: 'var(--color-primary)',
              stroke: 'var(--bg-page)',
              strokeWidth: 2
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}