interface CardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'blue' | 'green' | 'yellow' | 'purple'
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function Card({ title, value, subtitle, color = 'blue' }: CardProps) {
  return (
    <div className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium opacity-80 mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs opacity-70">{subtitle}</p>
      )}
    </div>
  )
}

