import { useState } from 'react'
import toast from 'react-hot-toast'

// Mock data
const mockSummary = {
  totalAssets: 5,
  totalValue: 65000,
  totalDepreciation: 13500,
  netBookValue: 51500,
  byCategory: [
    { category: 'คอมพิวเตอร์', count: 1, value: 25000 },
    { category: 'เครื่องพิมพ์', count: 1, value: 15000 },
    { category: 'เฟอร์นิเจอร์', count: 2, value: 13000 },
    { category: 'เครื่องใช้ไฟฟ้า', count: 1, value: 12000 },
  ],
  byDepartment: [
    { department: 'IT', count: 2, value: 37000 },
    { department: 'Admin', count: 1, value: 15000 },
    { department: 'HR', count: 1, value: 8000 },
    { department: 'Finance', count: 1, value: 5000 },
  ],
  byStatus: [
    { status: 'active', count: 4, percentage: 80 },
    { status: 'inactive', count: 1, percentage: 20 },
  ],
}

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('summary')
  const [exporting, setExporting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString('th-TH'))

  const handleExportCSV = () => {
    setExporting(true)
    // Mock CSV export
    setTimeout(() => {
      const csvContent = 'Asset Code,Name,Category,Department,Status,Price\nAST-2024-001,คอมพิวเตอร์ Dell OptiPlex,คอมพิวเตอร์,IT,active,25000\nAST-2024-002,เครื่องพิมพ์ Canon,เครื่องพิมพ์,Admin,active,15000'
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `assets_report_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('CSV exported successfully!')
      setExporting(false)
      setLastUpdated(new Date().toLocaleString('th-TH'))
    }, 500)
  }

  const handleExportPDF = () => {
    setExporting(true)
    // Create PDF-like content (HTML that can be printed as PDF)
    setTimeout(() => {
      const pdfContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #646cff; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #646cff; color: white; }
              .footer { margin-top: 40px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h1>Asset Management System - Report</h1>
            <p>Generated: ${new Date().toLocaleString('th-TH')}</p>
            <p>Report Type: ${selectedReport}</p>
            <h2>Summary</h2>
            <table>
              <tr><th>Asset Code</th><th>Name</th><th>Category</th><th>Price</th></tr>
              <tr><td>AST-2024-001</td><td>คอมพิวเตอร์ Dell OptiPlex</td><td>คอมพิวเตอร์</td><td>25,000 ฿</td></tr>
              <tr><td>AST-2024-002</td><td>เครื่องพิมพ์ Canon</td><td>เครื่องพิมพ์</td><td>15,000 ฿</td></tr>
              <tr><td>AST-2024-003</td><td>โต๊ะทำงาน</td><td>เฟอร์นิเจอร์</td><td>8,000 ฿</td></tr>
            </table>
            <div class="footer">
              <p>Asset Management System v1.0.0</p>
              <p>Generated on ${new Date().toLocaleString('th-TH')}</p>
            </div>
          </body>
        </html>
      `
      
      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `assets_report_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Report downloaded! Open HTML file and print to PDF')
      setExporting(false)
      setLastUpdated(new Date().toLocaleString('th-TH'))
    }, 500)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    // Mock refresh
    setTimeout(() => {
      toast.success('Data refreshed!')
      setRefreshing(false)
      setLastUpdated(new Date().toLocaleString('th-TH'))
    }, 800)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>📋 Reports & Analytics</h1>

      {/* Report Selection */}
      <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedReport('summary')}
          style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: selectedReport === 'summary' ? '#646cff' : '#2a2a2a', color: '#fff', cursor: 'pointer' }}
        >
          📊 Summary
        </button>
        <button
          onClick={() => setSelectedReport('category')}
          style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: selectedReport === 'category' ? '#646cff' : '#2a2a2a', color: '#fff', cursor: 'pointer' }}
        >
          📦 By Category
        </button>
        <button
          onClick={() => setSelectedReport('department')}
          style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: selectedReport === 'department' ? '#646cff' : '#2a2a2a', color: '#fff', cursor: 'pointer' }}
        >
          🏢 By Department
        </button>
        <button
          onClick={() => setSelectedReport('status')}
          style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: selectedReport === 'status' ? '#646cff' : '#2a2a2a', color: '#fff', cursor: 'pointer' }}
        >
          ✅ By Status
        </button>
        <button
          onClick={() => setSelectedReport('depreciation')}
          style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: selectedReport === 'depreciation' ? '#646cff' : '#2a2a2a', color: '#fff', cursor: 'pointer' }}
        >
          📈 Depreciation
        </button>
      </div>

      {/* Summary Report */}
      {selectedReport === 'summary' && (
        <div>
          <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Executive Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Total Assets</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{mockSummary.totalAssets}</p>
            </div>
            <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Total Value</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>{mockSummary.totalValue.toLocaleString()} ฿</p>
            </div>
            <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Accumulated Depreciation</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{mockSummary.totalDepreciation.toLocaleString()} ฿</p>
            </div>
            <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Net Book Value</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{mockSummary.netBookValue.toLocaleString()} ฿</p>
            </div>
          </div>

          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Asset Distribution</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1rem' }}>By Category</h4>
                {mockSummary.byCategory.map((item, index) => (
                  <div key={index} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#fff' }}>{item.category}</span>
                      <span style={{ color: '#888' }}>{item.count} assets</span>
                    </div>
                    <div style={{ background: '#2a2a2a', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.value / mockSummary.totalValue) * 100}%`, background: '#646cff', height: '100%' }}></div>
                    </div>
                    <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.25rem' }}>{item.value.toLocaleString()} ฿</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1rem' }}>By Department</h4>
                {mockSummary.byDepartment.map((item, index) => (
                  <div key={index} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#fff' }}>{item.department}</span>
                      <span style={{ color: '#888' }}>{item.count} assets</span>
                    </div>
                    <div style={{ background: '#2a2a2a', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.value / mockSummary.totalValue) * 100}%`, background: '#22c55e', height: '100%' }}></div>
                    </div>
                    <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.25rem' }}>{item.value.toLocaleString()} ฿</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Report */}
      {selectedReport === 'category' && (
        <div>
          <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Assets by Category</h2>
          <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#2a2a2a' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#888' }}>Count</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#888' }}>Total Value</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#888' }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {mockSummary.byCategory.map((item, index) => (
                  <tr key={index} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                    <td style={{ padding: '1rem', color: '#fff' }}>{item.category}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#fff' }}>{item.count}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#646cff' }}>{item.value.toLocaleString()} ฿</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#888' }}>{((item.value / mockSummary.totalValue) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Report */}
      {selectedReport === 'department' && (
        <div>
          <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Assets by Department</h2>
          <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#2a2a2a' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888' }}>Department</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#888' }}>Count</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#888' }}>Total Value</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#888' }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {mockSummary.byDepartment.map((item, index) => (
                  <tr key={index} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                    <td style={{ padding: '1rem', color: '#fff' }}>{item.department}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#fff' }}>{item.count}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#22c55e' }}>{item.value.toLocaleString()} ฿</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: '#888' }}>{((item.value / mockSummary.totalValue) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Report */}
      {selectedReport === 'status' && (
        <div>
          <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Assets by Status</h2>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px' }}>
            {mockSummary.byStatus.map((item, index) => (
              <div key={index} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#fff', fontWeight: '500' }}>{item.status}</span>
                  <span style={{ color: '#888' }}>{item.count} assets ({item.percentage}%)</span>
                </div>
                <div style={{ background: '#2a2a2a', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.percentage}%`, background: item.status === 'active' ? '#22c55e' : '#666', height: '100%' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Depreciation Report */}
      {selectedReport === 'depreciation' && (
        <div>
          <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Depreciation Summary</h2>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: '#888', fontSize: '0.875rem' }}>Total Original Value</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>{mockSummary.totalValue.toLocaleString()} ฿</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.875rem' }}>Total Depreciation</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{mockSummary.totalDepreciation.toLocaleString()} ฿</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.875rem' }}>Net Book Value</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{mockSummary.netBookValue.toLocaleString()} ฿</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.875rem' }}>Depreciation Rate</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{((mockSummary.totalDepreciation / mockSummary.totalValue) * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div style={{ padding: '1.5rem', background: '#2a2a2a', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Depreciation is calculated using straight-line method for most assets, as per government accounting standards.</p>
            </div>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={handleExportCSV}
          disabled={exporting}
          style={{ padding: '0.75rem 1.5rem', background: exporting ? '#666' : '#22c55e', color: 'white', borderRadius: '4px', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: exporting ? 0.7 : 1 }}
        >
          {exporting ? '⏳ Exporting...' : '📥 Export CSV'}
        </button>
        <button 
          onClick={handleExportPDF}
          disabled={exporting}
          style={{ padding: '0.75rem 1.5rem', background: exporting ? '#666' : '#646cff', color: 'white', borderRadius: '4px', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: exporting ? 0.7 : 1 }}
        >
          {exporting ? '⏳ Exporting...' : '📄 Export PDF'}
        </button>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ padding: '0.75rem 1.5rem', background: refreshing ? '#666' : '#2a2a2a', color: '#fff', borderRadius: '4px', border: '1px solid #333', cursor: refreshing ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: refreshing ? 0.7 : 1 }}
        >
          {refreshing ? '⏳ Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {/* Last Updated */}
      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#888' }}>
        Last updated: {lastUpdated}
      </div>
    </div>
  )
}
