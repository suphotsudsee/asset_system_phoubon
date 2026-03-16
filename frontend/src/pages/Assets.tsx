import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

// Mock data
const mockAssets = [
  { id: 1, asset_code: 'AST-2024-001', name: 'คอมพิวเตอร์ Dell OptiPlex', category: 'คอมพิวเตอร์', department: 'IT', status: 'active', location: 'ห้อง 101', purchase_date: '2024-01-15', price: 25000 },
  { id: 2, asset_code: 'AST-2024-002', name: 'เครื่องพิมพ์ Canon', category: 'เครื่องพิมพ์', department: 'Admin', status: 'active', location: 'ห้อง 102', purchase_date: '2024-02-01', price: 15000 },
  { id: 3, asset_code: 'AST-2024-003', name: 'โต๊ะทำงาน', category: 'เฟอร์นิเจอร์', department: 'HR', status: 'active', location: 'ห้อง 201', purchase_date: '2024-01-20', price: 8000 },
  { id: 4, asset_code: 'AST-2024-004', name: 'เก้าอี้สำนักงาน', category: 'เฟอร์นิเจอร์', department: 'Finance', status: 'inactive', location: 'ห้อง 301', purchase_date: '2024-03-01', price: 5000 },
  { id: 5, asset_code: 'AST-2024-005', name: 'เครื่องปรับอากาศ', category: 'เครื่องใช้ไฟฟ้า', department: 'IT', status: 'active', location: 'ห้อง 101', purchase_date: '2024-02-15', price: 12000 },
]

const categories = ['คอมพิวเตอร์', 'เครื่องพิมพ์', 'เฟอร์นิเจอร์', 'เครื่องใช้ไฟฟ้า', 'ยานพาหนะ']
const departments = ['IT', 'Admin', 'HR', 'Finance', 'Operations']
const statuses = ['active', 'inactive', 'maintenance']

export default function Assets() {
  const [assets, setAssets] = useState(mockAssets)
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editAsset, setEditAsset] = useState<any>(null)
  const [deleteAsset, setDeleteAsset] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

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

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editAsset) {
      setAssets(assets.map(a => a.id === editAsset.id ? editAsset : a))
      // Save to localStorage
      localStorage.setItem('assets', JSON.stringify(assets.map(a => a.id === editAsset.id ? editAsset : a)))
      toast.success('Asset updated successfully!')
      setShowEditModal(false)
      setEditAsset(null)
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

  const handleConfirmDelete = () => {
    if (deleteAsset) {
      setAssets(assets.filter(a => a.id !== deleteAsset.id))
      setShowDeleteModal(false)
      setDeleteAsset(null)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff' }}>📦 Assets Management</h1>
        <a href="/assets/add" style={{ background: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', textDecoration: 'none', cursor: 'pointer', fontWeight: '500' }}>
          ➕ Add New Asset
        </a>
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
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Total</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{assets.length}</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Active</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{assets.filter(a => a.status === 'active').length}</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Inactive</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#666' }}>{assets.filter(a => a.status === 'inactive').length}</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Maintenance</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{assets.filter(a => a.status === 'maintenance').length}</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#2a2a2a' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Code</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Category</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Department</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Status</th>
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
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '500', background: asset.status === 'active' ? '#22c55e20' : asset.status === 'inactive' ? '#66620' : '#f59e0b20', color: asset.status === 'active' ? '#22c55e' : asset.status === 'inactive' ? '#666' : '#f59e0b' }}>
                    {asset.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#fff', fontWeight: '500' }}>{asset.price.toLocaleString()} ฿</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <Link to={`/assets/${asset.id}`} style={{ color: '#646cff', textDecoration: 'none', marginRight: '1rem' }}>View</Link>
                  <button onClick={() => handleEdit(asset)} style={{ color: '#646cff', background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                  <button onClick={() => handleDelete(asset)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAssets.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
          <p>No assets found matching your filters</p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editAsset && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Edit Asset</h3>
            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Asset Code</label>
                  <input
                    type="text"
                    value={editAsset.asset_code}
                    onChange={(e) => setEditAsset({ ...editAsset, asset_code: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Name</label>
                  <input
                    type="text"
                    value={editAsset.name}
                    onChange={(e) => setEditAsset({ ...editAsset, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Category</label>
                  <select
                    value={editAsset.category}
                    onChange={(e) => setEditAsset({ ...editAsset, category: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Department</label>
                  <select
                    value={editAsset.department}
                    onChange={(e) => setEditAsset({ ...editAsset, department: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Status</label>
                  <select
                    value={editAsset.status}
                    onChange={(e) => setEditAsset({ ...editAsset, status: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Location</label>
                  <input
                    type="text"
                    value={editAsset.location}
                    onChange={(e) => setEditAsset({ ...editAsset, location: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Purchase Date</label>
                  <input
                    type="date"
                    value={editAsset.purchase_date}
                    onChange={(e) => setEditAsset({ ...editAsset, purchase_date: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Price</label>
                  <input
                    type="number"
                    value={editAsset.price}
                    onChange={(e) => setEditAsset({ ...editAsset, price: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Image</label>
                <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '4px', border: '1px dashed #333' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ marginBottom: '1rem' }}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#888' }}>
                        {imageFile?.name} ({(imageFile?.size || 0 / 1024).toFixed(0)} KB)
                      </p>
                    </div>
                  )}
                  {!imagePreview && editAsset.image && (
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                      <img 
                        src={editAsset.image} 
                        alt="Current" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
                      />
                      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#888' }}>Current image</p>
                    </div>
                  )}
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#888' }}>
                  Upload image from your computer (JPG, PNG, GIF - max 5MB)
                </p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteAsset && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Confirm Delete</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteAsset.name}</strong> ({deleteAsset.asset_code})?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeleteAsset(null); }} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>
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