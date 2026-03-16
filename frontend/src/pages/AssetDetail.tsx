import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { QRCodeCanvas } from 'qrcode.react'

// Mock data (fallback if localStorage is empty)
const defaultAssets: Record<number, any> = {
  1: { id: 1, asset_code: 'AST-2024-001', name: 'คอมพิวเตอร์ Dell OptiPlex', category: 'คอมพิวเตอร์', department: 'IT', status: 'active', location: 'ห้อง 101', purchase_date: '2024-01-15', purchase_price: 25000, serial_number: 'DPX123456', condition: 'good', useful_life_years: 5, depreciation_method: 'straight_line', description: 'คอมพิวเตอร์สำนักงานสำหรับพนักงาน IT', image: 'https://images.unsplash.com/photo-1593640408182-31c70c8264f5?w=400&h=300&fit=crop' },
  2: { id: 2, asset_code: 'AST-2024-002', name: 'เครื่องพิมพ์ Canon', category: 'เครื่องพิมพ์', department: 'Admin', status: 'active', location: 'ห้อง 102', purchase_date: '2024-02-01', purchase_price: 15000, serial_number: 'CN789012', condition: 'excellent', useful_life_years: 3, depreciation_method: 'straight_line', description: 'เครื่องพิมพ์เลเซอร์สำหรับเอกสาร', image: 'https://images.unsplash.com/photo-1610444581929-8f2c37a1c006?w=400&h=300&fit=crop' },
  3: { id: 3, asset_code: 'AST-2024-003', name: 'โต๊ะทำงาน', category: 'เฟอร์นิเจอร์', department: 'HR', status: 'active', location: 'ห้อง 201', purchase_date: '2024-01-20', purchase_price: 8000, serial_number: 'DSK345678', condition: 'good', useful_life_years: 10, depreciation_method: 'straight_line', description: 'โต๊ะทำงานไม้ขนาด 120x60 ซม.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop' },
  4: { id: 4, asset_code: 'AST-2024-004', name: 'เก้าอี้สำนักงาน', category: 'เฟอร์นิเจอร์', department: 'Finance', status: 'inactive', location: 'ห้อง 301', purchase_date: '2024-03-01', purchase_price: 5000, serial_number: 'CHR901234', condition: 'fair', useful_life_years: 7, depreciation_method: 'straight_line', description: 'เก้าอี้สำนักงานปรับระดับได้', image: 'https://images.unsplash.com/photo-1580480055273-228756107519?w=400&h=300&fit=crop' },
  5: { id: 5, asset_code: 'AST-2024-005', name: 'เครื่องปรับอากาศ', category: 'เครื่องใช้ไฟฟ้า', department: 'IT', status: 'active', location: 'ห้อง 101', purchase_date: '2024-02-15', purchase_price: 12000, serial_number: 'AC567890', condition: 'excellent', useful_life_years: 8, depreciation_method: 'straight_line', description: 'เครื่องปรับอากาศ 12000 BTU', image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=400&h=300&fit=crop' },
}

const mockMaintenance = [
  { id: 1, asset_id: 1, title: 'Regular maintenance check', maintenance_type: 'preventive', status: 'pending', priority: 'medium', total_cost: 500, scheduled_date: '2024-03-20', technician: 'John Doe' },
  { id: 2, asset_id: 2, title: 'Paper jam fix', maintenance_type: 'corrective', status: 'completed', priority: 'low', total_cost: 300, scheduled_date: '2024-03-15', technician: 'Jane Smith' },
  { id: 3, asset_id: 5, title: 'Filter cleaning', maintenance_type: 'preventive', status: 'in_progress', priority: 'medium', total_cost: 200, scheduled_date: '2024-03-18', technician: 'Bob Wilson' },
]

const mockDepreciation = [
  { id: 1, asset_id: 1, fiscal_year: 2024, beginning_book_value: 25000, depreciation_expense: 5000, accumulated_depreciation: 5000, ending_book_value: 20000 },
  { id: 2, asset_id: 1, fiscal_year: 2025, beginning_book_value: 20000, depreciation_expense: 5000, accumulated_depreciation: 10000, ending_book_value: 15000 },
  { id: 3, asset_id: 2, fiscal_year: 2024, beginning_book_value: 15000, depreciation_expense: 5000, accumulated_depreciation: 5000, ending_book_value: 10000 },
]

const mockPrediction = {
  predicted_date: '2024-06-15',
  confidence: 0.85,
  recommended_action: 'Schedule preventive maintenance',
  priority: 'medium',
  estimated_cost: 1500,
  days_until_maintenance: 45,
}

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const [asset, setAsset] = useState<any | null>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([])
  const [depreciationRecords, setDepreciationRecords] = useState<any[]>([])
  const [prediction, setPrediction] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'maintenance' | 'depreciation' | 'ai'>('info')

  useEffect(() => {
    if (!id) return
    
    // Try to load from localStorage first
    const storedAssets = localStorage.getItem('assets')
    let assets = storedAssets ? JSON.parse(storedAssets) : defaultAssets
    
    // Convert array to object format if needed
    if (Array.isArray(assets)) {
      assets = assets.reduce((acc: any, asset: any) => {
        acc[asset.id] = asset
        return acc
      }, {})
    }
    
    const assetId = parseInt(id)
    const foundAsset = assets[assetId]
    
    if (foundAsset) {
      setAsset(foundAsset)
      setMaintenanceRecords(mockMaintenance.filter(m => m.asset_id === assetId))
      setDepreciationRecords(mockDepreciation.filter(d => d.asset_id === assetId))
      setPrediction(mockPrediction)
    }
    
    setLoading(false)
  }, [id])

  const handleDownloadQR = () => {
    if (!asset) {
      alert('Asset not loaded')
      return
    }
    
    // Get canvas by ID
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
    if (!canvas) {
      alert('QR code not found')
      return
    }
    
    // Convert canvas to PNG and download
    const pngUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = `qr_${asset.asset_code}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (loading || !asset) {
    return <div style={{ padding: '2rem', color: '#888' }}>Loading asset details...</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/assets" style={{ color: '#646cff', marginRight: '1rem', textDecoration: 'none' }}>← Back to Assets</Link>
        <h1 style={{ display: 'inline', color: '#fff' }}>{asset.name}</h1>
        <span style={{ marginLeft: '1rem', padding: '0.25rem 0.75rem', borderRadius: '4px', background: asset.status === 'active' ? '#22c55e' : '#666', color: 'white', fontSize: '0.875rem' }}>
          {asset.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #333', marginBottom: '1rem' }}>
            <button onClick={() => setActiveTab('info')} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'info' ? '#646cff' : '#888', cursor: 'pointer', borderBottom: activeTab === 'info' ? '2px solid #646cff' : 'none', fontSize: '1rem' }}>
              Information
            </button>
            <button onClick={() => setActiveTab('maintenance')} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'maintenance' ? '#646cff' : '#888', cursor: 'pointer', borderBottom: activeTab === 'maintenance' ? '2px solid #646cff' : 'none', fontSize: '1rem' }}>
              Maintenance ({maintenanceRecords.length})
            </button>
            <button onClick={() => setActiveTab('depreciation')} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'depreciation' ? '#646cff' : '#888', cursor: 'pointer', borderBottom: activeTab === 'depreciation' ? '2px solid #646cff' : 'none', fontSize: '1rem' }}>
              Depreciation
            </button>
            <button onClick={() => setActiveTab('ai')} style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'ai' ? '#646cff' : '#888', cursor: 'pointer', borderBottom: activeTab === 'ai' ? '2px solid #646cff' : 'none', fontSize: '1rem' }}>
              AI Prediction
            </button>
          </div>

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Asset Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Asset Code</span>
                  <p style={{ color: '#fff', fontFamily: 'monospace', fontSize: '1rem' }}>{asset.asset_code}</p>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Serial Number</span>
                  <p style={{ color: '#fff' }}>{asset.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Category</span>
                  <p style={{ color: '#fff' }}>{asset.category || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Department</span>
                  <p style={{ color: '#fff' }}>{asset.department || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Location</span>
                  <p style={{ color: '#fff' }}>{asset.location || 'N/A'}</p>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Condition</span>
                  <p style={{ color: '#fff' }}>{asset.condition}</p>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Purchase Date</span>
                  <p style={{ color: '#fff' }}>{new Date(asset.purchase_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Useful Life</span>
                  <p style={{ color: '#fff' }}>{asset.useful_life_years} years</p>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Purchase Price</span>
                  <p style={{ color: '#22c55e', fontWeight: 'bold' }}>{asset.purchase_price ? asset.purchase_price.toLocaleString() : 'N/A'} ฿</p>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Depreciation Method</span>
                  <p style={{ color: '#fff' }}>{asset.depreciation_method ? asset.depreciation_method.replace('_', ' ') : 'straight_line'}</p>
                </div>
              </div>
              {asset.description && (
                <div style={{ marginTop: '1.5rem' }}>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Description</span>
                  <p style={{ color: '#fff', marginTop: '0.5rem' }}>{asset.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div>
              {maintenanceRecords.length > 0 ? (
                <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#2a2a2a' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Title</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Type</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Status</th>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Priority</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceRecords.map((record, index) => (
                        <tr key={record.id} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                          <td style={{ padding: '1rem', color: '#fff' }}>{record.title}</td>
                          <td style={{ padding: '1rem', color: '#888' }}>{record.maintenance_type}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', background: record.status === 'pending' ? '#f59e0b20' : record.status === 'completed' ? '#22c55e20' : '#646cff20', color: record.status === 'pending' ? '#f59e0b' : record.status === 'completed' ? '#22c55e' : '#646cff' }}>
                              {record.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#888' }}>{record.priority}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: '#22c55e' }}>{record.total_cost ? record.total_cost.toLocaleString() : 'N/A'} ฿</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
                  <p>No maintenance records found</p>
                </div>
              )}
            </div>
          )}

          {/* Depreciation Tab */}
          {activeTab === 'depreciation' && (
            <div>
              {depreciationRecords.length > 0 ? (
                <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#2a2a2a' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Year</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Beginning Value</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Depreciation</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Accumulated</th>
                        <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Ending Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depreciationRecords.map((record, index) => (
                        <tr key={record.id} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                          <td style={{ padding: '1rem', color: '#fff' }}>{record.fiscal_year}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: '#fff' }}>{record.beginning_book_value ? record.beginning_book_value.toLocaleString() : 'N/A'} ฿</td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: '#f59e0b' }}>{record.depreciation_expense ? record.depreciation_expense.toLocaleString() : 'N/A'} ฿</td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: '#888' }}>{record.accumulated_depreciation ? record.accumulated_depreciation.toLocaleString() : 'N/A'} ฿</td>
                          <td style={{ padding: '1rem', textAlign: 'right', color: '#22c55e', fontWeight: 'bold' }}>{record.ending_book_value ? record.ending_book_value.toLocaleString() : 'N/A'} ฿</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
                  <p>No depreciation records found</p>
                </div>
              )}
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px' }}>
              {prediction ? (
                <>
                  <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>🤖 AI Maintenance Prediction</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ color: '#888', fontSize: '0.875rem' }}>Predicted Date</span>
                      <p style={{ color: '#fff', fontSize: '1.125rem', marginTop: '0.25rem' }}>{prediction.predicted_date}</p>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ color: '#888', fontSize: '0.875rem' }}>Confidence</span>
                      <p style={{ color: '#22c55e', fontSize: '1.125rem', marginTop: '0.25rem' }}>{(prediction.confidence * 100).toFixed(0)}%</p>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ color: '#888', fontSize: '0.875rem' }}>Recommended Action</span>
                      <p style={{ color: '#fff', fontSize: '1.125rem', marginTop: '0.25rem' }}>{prediction.recommended_action}</p>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ color: '#888', fontSize: '0.875rem' }}>Priority</span>
                      <p style={{ color: '#f59e0b', fontSize: '1.125rem', marginTop: '0.25rem' }}>{prediction.priority}</p>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ color: '#888', fontSize: '0.875rem' }}>Estimated Cost</span>
                      <p style={{ color: '#646cff', fontSize: '1.125rem', marginTop: '0.25rem' }}>{prediction.estimated_cost.toLocaleString()} ฿</p>
                    </div>
                    <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ color: '#888', fontSize: '0.875rem' }}>Days Until Maintenance</span>
                      <p style={{ color: '#fff', fontSize: '1.125rem', marginTop: '0.25rem' }}>{prediction.days_until_maintenance} days</p>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#888' }}>
                  <p>Insufficient data for AI prediction</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Asset Image & QR Code */}
        <div>
          <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>📷 Asset Image</h3>
            {asset.image ? (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={asset.image} 
                  alt={asset.name}
                  style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}
                  onError={(e) => {
                    // Use data URI for placeholder instead of external URL
                    const svg = encodeURIComponent(`
                      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                        <rect width="400" height="300" fill="#2a2a2a"/>
                        <text x="200" y="150" font-family="Arial" font-size="20" fill="#888" text-anchor="middle">No Image</text>
                      </svg>
                    `);
                    (e.target as HTMLImageElement).src = `data:image/svg+xml,${svg}`;
                  }}
                />
                <p style={{ fontSize: '0.875rem', color: '#888' }}>{asset.name}</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#2a2a2a', borderRadius: '8px' }}>
                <p style={{ color: '#888' }}>No image available</p>
              </div>
            )}
          </div>

          <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', position: 'sticky', top: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>📱 QR Code</h3>
            <div style={{ textAlign: 'center' }}>
              <QRCodeCanvas 
                id="qr-canvas"
                value={`${asset.asset_code}:${asset.serial_number}`} 
                size={180}
                level="H"
              />
              <p style={{ marginTop: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#646cff' }}>{asset.asset_code}</p>
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#888' }}>
              <p>Scan this QR code to quickly access asset information or log maintenance.</p>
            </div>
            <button 
              onClick={handleDownloadQR}
              style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#646cff', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              📥 Download QR
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
