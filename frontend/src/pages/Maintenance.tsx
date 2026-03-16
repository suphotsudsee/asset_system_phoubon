import { useState } from 'react'

// Mock data
const mockMaintenance = [
  { id: 1, asset_code: 'AST-2024-001', asset_name: 'คอมพิวเตอร์ Dell OptiPlex', type: 'preventive', status: 'pending', scheduled_date: '2024-03-20', cost: 500, technician: 'John Doe', description: 'Regular maintenance check' },
  { id: 2, asset_code: 'AST-2024-002', asset_name: 'เครื่องพิมพ์ Canon', type: 'corrective', status: 'in_progress', scheduled_date: '2024-03-18', cost: 1200, technician: 'Jane Smith', description: 'Paper jam fix' },
  { id: 3, asset_code: 'AST-2024-003', asset_name: 'โต๊ะทำงาน', type: 'preventive', status: 'completed', scheduled_date: '2024-03-15', cost: 300, technician: 'Bob Wilson', description: 'Inspection' },
  { id: 4, asset_code: 'AST-2024-005', asset_name: 'เครื่องปรับอากาศ', type: 'corrective', status: 'pending', scheduled_date: '2024-03-22', cost: 2500, technician: 'Alice Brown', description: 'Not cooling properly' },
  { id: 5, asset_code: 'AST-2024-004', asset_name: 'เก้าอี้สำนักงาน', type: 'preventive', status: 'completed', scheduled_date: '2024-03-10', cost: 200, technician: 'John Doe', description: 'Lubrication' },
]

const statuses = ['pending', 'in_progress', 'completed', 'cancelled']
const types = ['preventive', 'corrective', 'emergency']

export default function Maintenance() {
  const [data, setData] = useState(mockMaintenance)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [newMaintenance, setNewMaintenance] = useState({
    asset_code: '',
    asset_name: '',
    type: 'preventive',
    status: 'pending',
    scheduled_date: '',
    cost: '',
    technician: '',
    description: '',
  })

  const filteredData = data.filter(item => {
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchType = !typeFilter || item.type === typeFilter
    return matchStatus && matchType
  })

  const totalCost = data.reduce((sum, d) => sum + d.cost, 0)
  const pendingCount = data.filter(d => d.status === 'pending').length

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMaintenance.asset_code || !newMaintenance.technician) {
      alert('Please fill required fields')
      return
    }
    
    const newId = data.length + 1
    setData([...data, {
      id: newId,
      ...newMaintenance,
      cost: parseInt(newMaintenance.cost) || 0,
    }])
    
    alert('Maintenance scheduled successfully!')
    setShowScheduleModal(false)
    setNewMaintenance({
      asset_code: '',
      asset_name: '',
      type: 'preventive',
      status: 'pending',
      scheduled_date: '',
      cost: '',
      technician: '',
      description: '',
    })
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff' }}>🔧 Maintenance Management</h1>
        <button 
          onClick={() => setShowScheduleModal(true)}
          style={{ background: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
        >
          ➕ Schedule Maintenance
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Total Requests</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{data.length}</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Pending</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{pendingCount}</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>In Progress</p>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>{data.filter(d => d.status === 'in_progress').length}</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Total Cost</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{totalCost.toLocaleString()} ฿</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label style={{ marginRight: '0.5rem', color: '#888' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          >
            <option value="">All</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ marginRight: '0.5rem', color: '#888' }}>Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          >
            <option value="">All</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#2a2a2a' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Asset</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Scheduled Date</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Technician</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ color: '#fff', fontWeight: '500' }}>{item.asset_name}</div>
                  <div style={{ color: '#646cff', fontSize: '0.875rem', fontFamily: 'monospace' }}>{item.asset_code}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', background: item.type === 'preventive' ? '#22c55e20' : item.type === 'corrective' ? '#f59e0b20' : '#ef444420', color: item.type === 'preventive' ? '#22c55e' : item.type === 'corrective' ? '#f59e0b' : '#ef4444' }}>
                    {item.type}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '500', background: item.status === 'pending' ? '#f59e0b20' : item.status === 'in_progress' ? '#646cff20' : item.status === 'completed' ? '#22c55e20' : '#66620', color: item.status === 'pending' ? '#f59e0b' : item.status === 'in_progress' ? '#646cff' : item.status === 'completed' ? '#22c55e' : '#666' }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#888' }}>{item.scheduled_date}</td>
                <td style={{ padding: '1rem', color: '#fff' }}>{item.technician}</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#22c55e', fontWeight: 'bold' }}>{item.cost.toLocaleString()} ฿</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Maintenance Modal */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>➕ Schedule Maintenance</h3>
            <form onSubmit={handleSchedule}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Asset Code *</label>
                <input
                  type="text"
                  value={newMaintenance.asset_code}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, asset_code: e.target.value })}
                  placeholder="e.g., AST-2024-001"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Asset Name</label>
                <input
                  type="text"
                  value={newMaintenance.asset_name}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, asset_name: e.target.value })}
                  placeholder="e.g., คอมพิวเตอร์ Dell"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Type *</label>
                  <select
                    value={newMaintenance.type}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                    required
                  >
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Status</label>
                  <select
                    value={newMaintenance.status}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Scheduled Date *</label>
                  <input
                    type="date"
                    value={newMaintenance.scheduled_date}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduled_date: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Cost (฿)</label>
                  <input
                    type="number"
                    value={newMaintenance.cost}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: e.target.value })}
                    placeholder="e.g., 500"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Technician *</label>
                <input
                  type="text"
                  value={newMaintenance.technician}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, technician: e.target.value })}
                  placeholder="e.g., John Doe"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Description</label>
                <textarea
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                  placeholder="e.g., Regular maintenance check..."
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowScheduleModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: '#22c55e', color: 'white', cursor: 'pointer', fontWeight: '500' }}>
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}