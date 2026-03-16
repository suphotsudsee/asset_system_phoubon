import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

// Mock asset data
const mockAssets = [
  { id: 1, asset_code: 'AST-2024-001', name: 'คอมพิวเตอร์ Dell OptiPlex', category: 'คอมพิวเตอร์', department: 'IT', status: 'active', location: 'ห้อง 101', purchase_date: '2024-01-15', price: 25000, qr_data: 'ASSET:AST-2024-001' },
  { id: 2, asset_code: 'AST-2024-002', name: 'เครื่องพิมพ์ Canon', category: 'เครื่องพิมพ์', department: 'Admin', status: 'active', location: 'ห้อง 102', purchase_date: '2024-02-01', price: 15000, qr_data: 'ASSET:AST-2024-002' },
  { id: 3, asset_code: 'AST-2024-003', name: 'โต๊ะทำงาน', category: 'เฟอร์นิเจอร์', department: 'HR', status: 'active', location: 'ห้อง 201', purchase_date: '2024-01-20', price: 8000, qr_data: 'ASSET:AST-2024-003' },
]

export default function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [asset, setAsset] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null

    if (scanning && !scanResult) {
      scanner = new Html5QrcodeScanner('reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      })

      scanner.render(
        (decodedText: string) => {
          handleScan(decodedText)
          scanner?.clear()
          setScanning(false)
        },
        (error: any) => {
          console.error('QR Scanner Error:', error)
        }
      )
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error)
      }
    }
  }, [scanning])

  const handleScan = async (data: string) => {
    const code = data
    setScanResult(code)
    
    // Extract asset code from QR data
    if (code && code.startsWith('ASSET:')) {
      const assetCode = code.replace('ASSET:', '')
      await lookupAssetByCode(assetCode)
    } else {
      // Try direct lookup
      await lookupAssetByCode(code)
    }
  }

  const lookupAssetByCode = async (code: string) => {
    setLoading(true)
    // Mock lookup
    const found = mockAssets.find(a => a.asset_code === code || a.qr_data === code)
    if (found) {
      setAsset(found)
      toast.success('Asset found!')
    } else {
      toast.error('Asset not found')
      setAsset(null)
    }
    setLoading(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode) {
      lookupAssetByCode(manualCode)
    }
  }

  const resetScan = () => {
    setScanResult(null)
    setAsset(null)
    setScanning(true)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>📷 QR Scanner</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>Scan asset QR codes to quickly access information</p>

      {!scanResult ? (
        <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
          <button
            onClick={() => setScanning(true)}
            style={{ background: '#22c55e', color: 'white', padding: '1rem 2rem', borderRadius: '8px', border: 'none', fontSize: '1.25rem', cursor: 'pointer', marginBottom: '1rem' }}
          >
            📷 Start Scanning
          </button>
          
          {scanning && (
            <div style={{ marginTop: '1rem' }}>
              <div id="reader" style={{ maxWidth: '400px', margin: '0 auto' }}></div>
              <p style={{ marginTop: '1rem', color: '#888' }}>Point camera at QR code</p>
              <button onClick={() => setScanning(false)} style={{ marginTop: '1rem', background: '#666', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                Stop Scanning
              </button>
            </div>
          )}

          <div style={{ marginTop: '2rem', borderTop: '1px solid #333', paddingTop: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Or enter code manually</h3>
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter asset code (e.g., AST-2024-001)"
                style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
              />
              <button type="submit" style={{ background: '#646cff', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                Lookup
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Scan Result</h3>
          <p style={{ fontFamily: 'monospace', background: '#2a2a2a', padding: '1rem', borderRadius: '4px', marginTop: '0.5rem', wordBreak: 'break-all', color: '#646cff' }}>
            {scanResult}
          </p>

          {loading && <p style={{ marginTop: '1rem', color: '#888' }}>Looking up asset...</p>}

          {asset && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ color: '#fff', marginBottom: '1rem' }}>✅ Asset Found</h4>
              <div style={{ background: '#2a2a2a', padding: '1.5rem', borderRadius: '4px' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Asset Code</span>
                  <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{asset.asset_code}</p>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ color: '#888', fontSize: '0.875rem' }}>Name</span>
                  <p style={{ color: '#fff', fontSize: '1.125rem' }}>{asset.name}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.875rem' }}>Category</span>
                    <p style={{ color: '#fff' }}>{asset.category}</p>
                  </div>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.875rem' }}>Department</span>
                    <p style={{ color: '#fff' }}>{asset.department}</p>
                  </div>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.875rem' }}>Status</span>
                    <p style={{ color: asset.status === 'active' ? '#22c55e' : '#666' }}>{asset.status}</p>
                  </div>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.875rem' }}>Location</span>
                    <p style={{ color: '#fff' }}>{asset.location}</p>
                  </div>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.875rem' }}>Purchase Date</span>
                    <p style={{ color: '#fff' }}>{asset.purchase_date}</p>
                  </div>
                  <div>
                    <span style={{ color: '#888', fontSize: '0.875rem' }}>Price</span>
                    <p style={{ color: '#22c55e', fontWeight: 'bold' }}>{asset.price.toLocaleString()} ฿</p>
                  </div>
                </div>
              </div>
              <button onClick={() => {}} style={{ marginTop: '1rem', background: '#646cff', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%' }}>
                View Full Details →
              </button>
            </div>
          )}

          <button onClick={resetScan} style={{ marginTop: '1rem', background: '#666', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%' }}>
            Scan Another
          </button>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #646cff' }}>
        <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>ℹ️ How to use:</h4>
        <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: '#888', lineHeight: '1.8' }}>
          <li>Click "Start Scanning" to activate camera</li>
          <li>Point camera at asset QR code</li>
          <li>Asset information will be displayed automatically</li>
          <li>Or enter asset code manually if QR is unavailable</li>
        </ol>
      </div>
    </div>
  )
}