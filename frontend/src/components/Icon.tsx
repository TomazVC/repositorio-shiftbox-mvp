export type IconName = 
  // Navigation
  | 'home' | 'user' | 'users' | 'building' | 'credit-card' | 'pie-chart' | 'bar-chart' | 'trending-up'
  // Actions
  | 'plus' | 'edit' | 'trash' | 'eye' | 'download' | 'upload' | 'copy' | 'check' | 'x' | 'search'
  // Status
  | 'check-circle' | 'x-circle' | 'alert-circle' | 'info' | 'alert-triangle'
  // Arrows
  | 'arrow-up' | 'arrow-down' | 'arrow-left' | 'arrow-right' | 'chevron-up' | 'chevron-down' | 'chevron-right'
  // Finance
  | 'dollar-sign' | 'trending-up' | 'trending-down' | 'calculator' | 'wallet'
  // Menu/Navigation
  | 'menu' | 'settings' | 'log-out' | 'external-link'
  // File operations
  | 'file' | 'file-text' | 'folder' | 'image' | 'paperclip'
  // Time and notifications
  | 'clock' | 'bell' | 'calendar' | 'timer'
  // Security and protection
  | 'lock' | 'unlock' | 'shield' | 'key'
  // Technology and web
  | 'qr-code' | 'wifi' | 'smartphone' | 'monitor'
  // Business and finance specific
  | 'chart-bar' | 'chart-line' | 'percent' | 'payment' | 'minus' | 'activity'
  // Communication
  | 'mail' | 'phone' | 'message-circle'
  // General UI
  | 'refresh' | 'filter' | 'sort' | 'warning'

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
  'chevron-right': 'M9 18l6-6-6-6',
  
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
  'paperclip': 'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49',

  // Time and notifications
  'clock': 'M12 2a10 10 0 1010 10A10 10 0 0012 2zM12 6v6l4 2',
  'bell': 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  'calendar': 'M3 9h18M7 3v4M17 3v4M6 11h.01M10 11h.01M14 11h.01M18 11h.01M6 15h.01M10 15h.01M14 15h.01M18 15h.01M6 19h.01M10 19h.01M14 19h.01M18 19h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  'timer': 'M12 2a10 10 0 1010 10A10 10 0 0012 2zM12 6v6l3 3',

  // Security and protection
  'lock': 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4',
  'unlock': 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 019.9-.8',
  'shield': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'key': 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',

  // Technology and web
  'qr-code': 'M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 7h.01M17 7h.01M7 17h.01M17 17h.01',
  'wifi': 'M1.42 9a16 16 0 0121.16 0M5 12.859a10 10 0 0114.5 0M8.5 16.429a5 5 0 017 0M12 20h.01',
  'smartphone': 'M5 2h10a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2zM12 18h.01',
  'monitor': 'M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2zM4 14h8M8 21l2-3h2l2 3',

  // Business and finance specific
  'chart-bar': 'M12 20V10M18 20V4M6 20v-6',
  'chart-line': 'M3 3v18h18M18.5 9l-4-4-2 2-3.5-3.5',
  'percent': 'M19 5L5 19M6.5 6.5a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0zM14.5 14.5a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z',
  'payment': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H5a3 3 0 00-3 3v8a3 3 0 003 3z',
  'minus': 'M5 12h14',
  'activity': 'M22 12h-4l-3 9L9 3l-3 9H2',

  // Communication
  'mail': 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  'phone': 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
  'message-circle': 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',

  // General UI
  'refresh': 'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15',
  'filter': 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  'sort': 'M3 6h18M7 12h10M12 18h4',
  'warning': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01'
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