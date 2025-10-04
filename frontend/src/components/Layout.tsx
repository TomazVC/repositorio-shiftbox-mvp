import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Usuários', icon: '👥' },
  { path: '/investments', label: 'Investimentos', icon: '💰' },
  { path: '/loans', label: 'Empréstimos', icon: '🏦' },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_email')
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Sidebar */}
      <aside 
        className="w-64 fixed h-full" 
        style={{ 
          backgroundColor: 'var(--bg-page)', 
          borderRight: '1px solid var(--border)',
          boxShadow: 'var(--shadow-base)'
        }}
      >
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              S
            </div>
            <div>
              <h1 className="text-h2 font-bold" style={{ color: 'var(--text-primary)' }}>
                ShiftBox
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'font-semibold'
                      : ''
                  }`}
                  style={{
                    backgroundColor: isActive(item.path) ? 'var(--color-primary-light)' : 'transparent',
                    color: isActive(item.path) ? 'var(--color-primary)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elev-2)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-body">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-64 p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-sm rounded-lg transition-all flex items-center justify-center gap-2"
            style={{ 
              color: 'var(--color-red)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-red-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header 
          className="sticky top-0 z-10" 
          style={{ 
            backgroundColor: 'var(--bg-page)', 
            borderBottom: '1px solid var(--border)',
            boxShadow: 'var(--shadow-base)'
          }}
        >
          <div className="px-8 py-5 flex justify-between items-center">
            <h2 className="text-h1" style={{ color: 'var(--text-primary)' }}>
              {navItems.find(item => item.path === location.pathname)?.label || 'ShiftBox'}
            </h2>
            <div className="flex items-center gap-3">
              <div 
                className="px-4 py-2 rounded-lg text-caption font-medium"
                style={{ 
                  backgroundColor: 'var(--bg-elev-2)',
                  color: 'var(--text-secondary)'
                }}
              >
                {localStorage.getItem('user_email') || 'admin@shiftbox.com'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

