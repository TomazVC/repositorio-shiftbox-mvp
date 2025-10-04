export type IconName = 
  // Navigation
  | 'home' | 'user' | 'users' | 'building' | 'credit-card' | 'pie-chart' | 'bar-chart' | 'trending-up'
  // Actions
  | 'plus' | 'edit' | 'trash' | 'eye' | 'download' | 'upload' | 'copy' | 'check' | 'x' | 'search'
  // Status
  | 'check-circle' | 'x-circle' | 'alert-circle' | 'info' | 'alert-triangle'
  // Arrows
  | 'arrow-up' | 'arrow-down' | 'arrow-left' | 'arrow-right' | 'chevron-up' | 'chevron-down'
  // Finance
  | 'dollar-sign' | 'trending-up' | 'trending-down' | 'calculator' | 'wallet'
  // Menu/Navigation
  | 'menu' | 'settings' | 'log-out' | 'external-link'
  // File operations
  | 'file' | 'file-text' | 'folder' | 'image' | 'paperclip'

interface IconProps {
  name: IconName
  size?: number
  color?: string
  className?: string
  strokeWidth?: number
}

// SVG paths for each icon (inspired by Lucide/Heroicons style)
const iconPaths: Record<IconName, string> = {
  // Navigation
  'home': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  'user': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  'users': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  'building': 'M3 21h18M5 21V7l8-4v18M19 21V10l-6-3M9 9v.01M9 12v.01M9 15v.01M9 18v.01',
  'credit-card': 'M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 10h18',
  'pie-chart': 'M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10l8.21 3.89z',
  'bar-chart': 'M12 20V10M18 20V4M6 20v-6',
  'trending-up': 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  
  // Actions
  'plus': 'M12 5v14M5 12h14',
  'edit': 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  'trash': 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6',
  'eye': 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  'download': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  'upload': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
  'copy': 'M20 9H11a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
  'check': 'M20 6L9 17l-5-5',
  'x': 'M18 6L6 18M6 6l12 12',
  'search': 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  
  // Status
  'check-circle': 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  'x-circle': 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  'alert-circle': 'M12 2a10 10 0 1010 10A10 10 0 0012 2zM12 8v4M12 16h.01',
  'info': 'M12 2a10 10 0 1010 10A10 10 0 0012 2zM12 8v4M12 16h.01',
  'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  
  // Arrows
  'arrow-up': 'M7 14l5-5 5 5',
  'arrow-down': 'M17 10l-5 5-5-5',
  'arrow-left': 'M10 17l-5-5 5-5',
  'arrow-right': 'M14 7l5 5-5 5',
  'chevron-up': 'M18 15l-6-6-6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  
  // Finance
  'dollar-sign': 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  'trending-down': 'M23 18l-9.5-9.5-5 5L1 6M17 18h6v-6',
  'calculator': 'M4 3a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V5a2 2 0 00-2-2H4zM8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01',
  'wallet': 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  
  // Menu/Navigation
  'menu': 'M4 6h16M4 12h16M4 18h16',
  'settings': 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z',
  'log-out': 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  'external-link': 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3',
  
  // File operations
  'file': 'M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9zM13 2v7h7',
  'file-text': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'folder': 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
  'image': 'M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM21 15l-5-5L5 21',
  'paperclip': 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49'
}

export default function Icon({ 
  name, 
  size = 24, 
  color = 'currentColor', 
  className = '',
  strokeWidth = 2 
}: IconProps) {
  const path = iconPaths[name]
  
  if (!path) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={`${name} icon`}
    >
      <path d={path} />
    </svg>
  )
}

// Componente especializado para ícones de trend
export function TrendIcon({ direction, size = 16, className = '' }: {
  direction: 'up' | 'down'
  size?: number
  className?: string
}) {
  return (
    <Icon
      name={direction === 'up' ? 'trending-up' : 'trending-down'}
      size={size}
      className={`${direction === 'up' ? 'text-green-600' : 'text-red-600'} ${className}`}
    />
  )
}

// Componente especializado para ícones de status
export function StatusIcon({ type, size = 20 }: {
  type: 'success' | 'error' | 'warning' | 'info'
  size?: number
}) {
  const iconMap = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info'
  } as const

  const colorMap = {
    success: 'text-green-600',
    error: 'text-red-600', 
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }

  return (
    <Icon
      name={iconMap[type]}
      size={size}
      className={colorMap[type]}
    />
  )
}