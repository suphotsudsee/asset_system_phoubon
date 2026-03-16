import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

// Mock data
const mockDepreciation = [
  { id: 1, asset_code: 'AST-2024-001', asset_name: 'คอมพิวเตอร์ Dell OptiPlex', method: 'straight-line', original_value: 25000, accumulated: 5000, net_book: 20000, year: 2024 },
  { id: 2, asset_code: 'AST-2024-002', asset_name: 'เครื่องพิมพ์ Canon', method: 'straight-line', original_value: 15000, accumulated: 3000, net_book: 12000, year: 2024 },
  { id: 3, asset_code: 'AST-2024-003', asset_name: 'โต๊ะทำงาน', method: 'straight-line', original_value: 8000, accumulated: 1600, net_book: 6400, year: 2024 },
  { id: 4, asset_code: 'AST-2024-004', asset_name: 'เก้าอี้สำนักงาน', method: 'declining', original_value: 5000, accumulated: 1500, net_book: 3500, year: 2024 },
  { id: 5, asset_code: 'AST-2024-005', asset_name: 'เครื่องปรับอากาศ', method: 'straight-line', original_value: 12000, accumulated: 2400, net_book: 9600, year: 2024 },
]

export default function Depreciation() {
  const [data, setData] = useState(mockDepreciation)
  const [methodFilter, setMethodFilter] = useState('')

  const filteredData = methodFilter ? data.filter(d => d.method === methodFilter) : data

  const totalOriginal = data.reduce((sum, d) => sum + d.original_value, 0)
  const totalAccumulated = data.reduce((sum, d) => sum + d.accumulated, 0)
  const totalNetBook = data.reduce((sum, d) => sum + d.net_book, 0)

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>📈 Depreciation Management</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Original Value</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>{totalOriginal.toLocaleString()} ฿</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Accumulated Depreciation</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{totalAccumulated.toLocaleString()} ฿</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Net Book Value</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{totalNetBook.toLocaleString()} ฿</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Assets</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{data.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '1rem', color: '#888' }}>Filter by Method:</label>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
        >
          <option value="">All Methods</option>
          <option value="straight-line">Straight-Line</option>
          <option value="declining">Declining Balance</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#2a2a2a' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Asset Code</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Asset Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Method</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Original Value</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Accumulated</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Net Book Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                <td style={{ padding: '1rem', color: '#646cff', fontFamily: 'monospace' }}>{item.asset_code}</td>
                <td style={{ padding: '1rem', color: '#fff', fontWeight: '500' }}>{item.asset_name}</td>
                <td style={{ padding: '1rem', color: '#888' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', background: item.method === 'straight-line' ? '#22c55e20' : '#f59e0b20', color: item.method === 'straight-line' ? '#22c55e' : '#f59e0b' }}>
                    {item.method}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#fff' }}>{item.original_value.toLocaleString()} ฿</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#f59e0b' }}>{item.accumulated.toLocaleString()} ฿</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#22c55e', fontWeight: 'bold' }}>{item.net_book.toLocaleString()} ฿</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #646cff' }}>
        <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>💡 Depreciation Methods</h4>
        <p style={{ color: '#888', fontSize: '0.875rem' }}>
          <strong>Straight-Line:</strong> Equal depreciation each year (recommended for government assets)
          <br />
          <strong>Declining Balance:</strong> Higher depreciation in early years
        </p>
      </div>
    </div>
  )
}