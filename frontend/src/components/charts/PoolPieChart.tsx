import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import ChartContainer from './ChartContainer'

interface PoolPieChartProps {
  data: Array<{
    name: string
    value: number
    percentage: number
    color: string
    description: string
  }>
  loading?: boolean
}

export default function PoolPieChart({ data, loading = false }: PoolPieChartProps) {
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
          <p className="text-body font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {data.name}
          </p>
          <p className="text-caption mb-1" style={{ color: 'var(--text-secondary)' }}>
            {data.description}
          </p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            ></div>
            <span className="text-body font-medium" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(data.value)} ({data.percentage}%)
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-caption" style={{ color: 'var(--text-secondary)' }}>
              {entry.value}: {formatCurrency(entry.payload.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // Não mostrar label se for menor que 5%

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <ChartContainer
      title="Composição do Pool"
      subtitle="Distribuição do capital disponível"
      loading={loading}
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={2}
            stroke="var(--bg-page)"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}