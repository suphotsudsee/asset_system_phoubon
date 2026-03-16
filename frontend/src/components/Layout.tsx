import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/assets', label: 'Assets', icon: '📦' },
  { path: '/depreciation', label: 'Depreciation', icon: '📈' },
  { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { path: '/qr-scanner', label: 'QR Scanner', icon: '📷' },
  { path: '/reports', label: 'Reports', icon: '📋' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: '#1a1a1a', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#646cff' }}>🏛️ Asset Mgmt</h2>
          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>ระบบงานทะเบียนครุภัณฑ์</p>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: location.pathname === item.path ? '#646cff' : '#888',
                background: location.pathname === item.path ? '#2a2a2a' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #333' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{user?.full_name || user?.username}</p>
            <p style={{ fontSize: '0.75rem', color: '#888' }}>{user?.role}</p>
          </div>
          <button
            onClick={logout}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: 'transparent', color: '#888', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#242424', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
