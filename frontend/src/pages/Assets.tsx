import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'
import { assetsApi } from '../lib/api'

export default function Assets() {
  const { token } = useAuthStore()
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editAsset, setEditAsset] = useState<any>(null)
  const [deleteAsset, setDeleteAsset] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    try {
      setLoading(true)
      const response = await assetsApi.getAll()
      setAssets(response.data.items || response.data)
      setLoading(false)
    } catch (error: any) {
      console.error('Failed to load assets:', error)
      // Fallback to mock data if API fails
      const mockAssets = [
        { id: 1, asset_code: 'AST-2024-001', name: 'คอมพิวเตอร์ Dell OptiPlex', category: 'คอมพิวเตอร์', department: 'IT', status: 'active', location: 'ห้อง 101', purchase_date: '2024-01-15', purchase_price: 25000 },
        { id: 2, asset_code: 'AST-2024-002', name: 'เครื่องพิมพ์ Canon', category: 'เครื่องพิมพ์', department: 'Admin', status: 'active', location: 'ห้อง 102', purchase_date: '2024-02-01', purchase_price: 15000 },
        { id: 3, asset_code: 'AST-2024-003', name: 'โต๊ะทำงาน', category: 'เฟอร์นิเจอร์', department: 'HR', status: 'active', location: 'ห้อง 201', purchase_date: '2024-01-20', purchase_price: 8000 },
        { id: 4, asset_code: 'AST-2024-004', name: 'เก้าอี้สำนักงาน', category: 'เฟอร์นิเจอร์', department: 'Finance', status: 'inactive', location: 'ห้อง 301', purchase_date: '2024-03-01', purchase_price: 5000 },
        { id: 5, asset_code: 'AST-2024-005', name: 'เครื่องปรับอากาศ', category: 'เครื่องใช้ไฟฟ้า', department: 'IT', status: 'active', location: 'ห้อง 101', purchase_date: '2024-02-15', purchase_price: 12000 },
      ]
      setAssets(mockAssets)
      toast.error(error.response?.data?.detail || 'Failed to load assets')
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchFilter = !filter || 
      asset.name.toLowerCase().includes(filter.toLowerCase()) ||
      asset.asset_code.toLowerCase().includes(filter.toLowerCase())
    const matchCategory = !categoryFilter || asset.category === categoryFilter
    const matchStatus = !statusFilter || asset.status === statusFilter
    return matchFilter && matchCategory && matchStatus
  })

  const handleEdit = (asset: any) => {
    setEditAsset({ ...asset })
    setShowEditModal(true)
  }

  const handleDelete = (asset: any) => {
    setDeleteAsset(asset)
    setShowDeleteModal(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editAsset) return
    
    try {
      // Try API first, fallback to mock if fails
      try {
        await assetsApi.update(editAsset.id, editAsset)
        toast.success('Asset updated successfully!')
        await loadAssets()
      } catch (apiError: any) {
        // Fallback to mock update
        setAssets(assets.map(a => a.id === editAsset.id ? editAsset : a))
        localStorage.setItem('assets', JSON.stringify(assets.map(a => a.id === editAsset.id ? editAsset : a)))
        toast.success('Asset updated locally')
      }
      setShowEditModal(false)
      setEditAsset(null)
    } catch (error: any) {
      console.error('Failed to update asset:', error)
      toast.error(error.response?.data?.detail || 'Failed to update asset')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setEditAsset({ ...editAsset, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteAsset) return
    
    try {
      await assetsApi.delete(deleteAsset.id)
      toast.success('Asset deleted successfully!')
      await loadAssets()
      setShowDeleteModal(false)
      setDeleteAsset(null)
    } catch (error: any) {
      console.error('Failed to delete asset:', error)
      toast.error(error.response?.data?.detail || 'Failed to delete asset')
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: '#888' }}>Loading assets...</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff' }}>📦 Assets Management</h1>
        <Link to="/assets/add" style={{ background: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', cursor: 'pointer', fontWeight: '500' }}>
          ➕ Add New Asset
        </Link>
      </div>

      {/* Filters */}
      <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Search</label>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name or code..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          >
            <option value="">All Categories</option>
            <option value="คอมพิวเตอร์">คอมพิวเตอร์</option>
            <option value="เครื่องพิมพ์">เครื่องพิมพ์</option>
            <option value="เฟอร์นิเจอร์">เฟอร์นิเจอร์</option>
            <option value="เครื่องใช้ไฟฟ้า">เครื่องใช้ไฟฟ้า</option>
            <option value="ยานพาหนะ">ยานพาหนะ</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#2a2a2a' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Asset Code</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Category</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Department</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right', color: '#888', fontSize: '0.875rem' }}>Price</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset, index) => (
              <tr key={asset.id} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                <td style={{ padding: '1rem', color: '#646cff', fontFamily: 'monospace' }}>{asset.asset_code}</td>
                <td style={{ padding: '1rem', color: '#fff', fontWeight: '500' }}>{asset.name}</td>
                <td style={{ padding: '1rem', color: '#888' }}>{asset.category}</td>
                <td style={{ padding: '1rem', color: '#888' }}>{asset.department}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '500', background: asset.status === 'active' ? '#22c55e20' : asset.status === 'inactive' ? '#66620' : '#f59e0b20', color: asset.status === 'active' ? '#22c55e' : asset.status === 'inactive' ? '#666' : '#f59e0b' }}>
                    {asset.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#22c55e', fontWeight: 'bold' }}>{asset.purchase_price?.toLocaleString() || asset.price?.toLocaleString()} ฿</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <Link to={`/assets/${asset.id}`} style={{ color: '#646cff', marginRight: '1rem', textDecoration: 'none' }}>View</Link>
                  <button onClick={() => handleEdit(asset)} style={{ color: '#646cff', background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                  <button onClick={() => handleDelete(asset)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && editAsset && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Edit Asset</h3>
            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Asset Code</label>
                  <input
                    type="text"
                    value={editAsset.asset_code}
                    onChange={(e) => setEditAsset({ ...editAsset, asset_code: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Name</label>
                  <input
                    type="text"
                    value={editAsset.name}
                    onChange={(e) => setEditAsset({ ...editAsset, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Category</label>
                  <input
                    type="text"
                    value={editAsset.category}
                    onChange={(e) => setEditAsset({ ...editAsset, category: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Department</label>
                  <input
                    type="text"
                    value={editAsset.department}
                    onChange={(e) => setEditAsset({ ...editAsset, department: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Status</label>
                  <select
                    value={editAsset.status}
                    onChange={(e) => setEditAsset({ ...editAsset, status: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Price</label>
                  <input
                    type="number"
                    value={editAsset.purchase_price || editAsset.price}
                    onChange={(e) => setEditAsset({ ...editAsset, purchase_price: parseInt(e.target.value), price: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Image</label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '0.5rem' }} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setEditAsset(null); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: '#646cff', color: 'white', cursor: 'pointer', fontWeight: '500' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deleteAsset && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Confirm Delete</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteAsset.name}</strong> ({deleteAsset.asset_code})?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowDeleteModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirmDelete} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '500' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
