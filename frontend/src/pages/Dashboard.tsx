import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState({
    totalAssets: 0,
    activeAssets: 0,
    maintenancePending: 0,
    totalValue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data for demo
    setStats({
      totalAssets: 5,
      activeAssets: 4,
      maintenancePending: 2,
      totalValue: 65000,
    })
    setLoading(false)
  }, [])

  if (loading) {
    return <div style={{ padding: '2rem', color: '#888' }}>Loading dashboard...</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', color: '#fff' }}>Dashboard</h1>
      
      {/* Welcome message */}
      <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>
          สวัสดี, {user?.full_name || user?.username || 'Admin'}!
        </h2>
        <p style={{ color: '#888' }}>Role: {user?.role || 'admin'}</p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
          <h3 style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Assets</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{stats.totalAssets.toLocaleString()}</p>
        </div>

        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <h3 style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Active Assets</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>{stats.activeAssets.toLocaleString()}</p>
        </div>

        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔧</div>
          <h3 style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Maintenance Pending</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.maintenancePending.toLocaleString()}</p>
        </div>

        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <h3 style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Value</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>{stats.totalValue.toLocaleString()} ฿</p>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px' }}>
        <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/assets" style={{ padding: '1rem', background: '#2a2a2a', borderRadius: '8px', textDecoration: 'none', color: '#fff', display: 'block' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>➕</div>
            <div style={{ fontWeight: '500' }}>Add Asset</div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Create new asset</div>
          </Link>

          <Link to="/assets" style={{ padding: '1rem', background: '#2a2a2a', borderRadius: '8px', textDecoration: 'none', color: '#fff', display: 'block' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
            <div style={{ fontWeight: '500' }}>View Assets</div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Browse all assets</div>
          </Link>

          <Link to="/qr-scanner" style={{ padding: '1rem', background: '#2a2a2a', borderRadius: '8px', textDecoration: 'none', color: '#fff', display: 'block' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📷</div>
            <div style={{ fontWeight: '500' }}>Scan QR</div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>Scan asset QR code</div>
          </Link>

          <Link to="/reports" style={{ padding: '1rem', background: '#2a2a2a', borderRadius: '8px', textDecoration: 'none', color: '#fff', display: 'block' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontWeight: '500' }}>Reports</div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>View analytics</div>
          </Link>
        </div>
      </div>

      {/* Info message */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #646cff' }}>
        <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>ℹ️ Demo Mode</h4>
        <p style={{ color: '#888', fontSize: '0.875rem' }}>
          Dashboard currently showing demo data. Connect backend API to load real asset data from database.
        </p>
      </div>
    </div>
  )
}