import { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: ReactNode
  icon?: ReactNode
}

export default function Badge({ variant = 'neutral', children, icon }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  )
}

