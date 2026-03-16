import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

// Mock data
const mockCategories = [
  { id: 1, name: 'คอมพิวเตอร์', code: 'CAT-001', asset_count: 1, description: 'คอมพิวเตอร์และอุปกรณ์ที่เกี่ยวข้อง' },
  { id: 2, name: 'เครื่องพิมพ์', code: 'CAT-002', asset_count: 1, description: 'เครื่องพิมพ์และอุปกรณ์พิมพ์' },
  { id: 3, name: 'เฟอร์นิเจอร์', code: 'CAT-003', asset_count: 2, description: 'โต๊ะ เก้าอี้ และเฟอร์นิเจอร์สำนักงาน' },
  { id: 4, name: 'เครื่องใช้ไฟฟ้า', code: 'CAT-004', asset_count: 1, description: 'เครื่องใช้ไฟฟ้าต่างๆ' },
  { id: 5, name: 'ยานพาหนะ', code: 'CAT-005', asset_count: 0, description: 'รถยนต์ รถจักรยานยนต์' },
  { id: 6, name: 'อุปกรณ์สำนักงาน', code: 'CAT-006', asset_count: 0, description: 'อุปกรณ์สำนักงานทั่วไป' },
]

const mockDepartments = [
  { id: 1, name: 'IT', code: 'DEPT-001', asset_count: 2, head: 'John Doe', description: 'ฝ่ายเทคโนโลยีสารสนเทศ' },
  { id: 2, name: 'Admin', code: 'DEPT-002', asset_count: 1, head: 'Jane Smith', description: 'ฝ่ายบริหารทั่วไป' },
  { id: 3, name: 'HR', code: 'DEPT-003', asset_count: 1, head: 'Bob Wilson', description: 'ฝ่ายทรัพยากรมนุษย์' },
  { id: 4, name: 'Finance', code: 'DEPT-004', asset_count: 1, head: 'Alice Brown', description: 'ฝ่ายการเงินและบัญชี' },
  { id: 5, name: 'Operations', code: 'DEPT-005', asset_count: 0, head: 'Charlie Davis', description: 'ฝ่ายปฏิบัติการ' },
]

const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', full_name: 'System Administrator', role: 'admin', department: 'IT', is_active: true, created_at: '2024-01-01' },
  { id: 2, username: 'user1', email: 'user1@example.com', full_name: 'John Doe', role: 'asset_manager', department: 'IT', is_active: true, created_at: '2024-01-15' },
  { id: 3, username: 'user2', email: 'user2@example.com', full_name: 'Jane Smith', role: 'staff', department: 'Admin', is_active: true, created_at: '2024-02-01' },
  { id: 4, username: 'user3', email: 'user3@example.com', full_name: 'Bob Wilson', role: 'viewer', department: 'HR', is_active: false, created_at: '2024-02-15' },
  { id: 5, username: 'user4', email: 'user4@example.com', full_name: 'Alice Brown', role: 'agency_admin', department: 'Finance', is_active: true, created_at: '2024-03-01' },
]

export default function Settings() {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<'categories' | 'departments' | 'users'>('categories')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [deleteItem, setDeleteItem] = useState<any>(null)
  const [newItem, setNewItem] = useState({ name: '', code: '', description: '', head: '' })
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'staff',
    department: '',
    is_active: true,
  })

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.name) {
      toast.error('Please enter category name')
      return
    }
    toast.success('Category created! (Demo mode)')
    setShowCategoryModal(false)
    setNewItem({ name: '', code: '', description: '', head: '' })
  }

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.name) {
      toast.error('Please enter department name')
      return
    }
    toast.success('Department created! (Demo mode)')
    setShowDeptModal(false)
    setNewItem({ name: '', code: '', description: '', head: '' })
  }

  const handleEdit = (item: any, type: 'category' | 'department') => {
    setEditItem({ ...item, type })
    setShowEditModal(true)
  }

  const handleDelete = (item: any, type: 'category' | 'department') => {
    setDeleteItem({ ...item, type })
    setShowDeleteModal(true)
  }

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editItem) {
      toast.success(`${editItem.type} updated! (Demo mode)`)
      setShowEditModal(false)
      setEditItem(null)
    }
  }

  const handleConfirmDelete = () => {
    if (deleteItem) {
      toast.success(`${deleteItem.type} deleted! (Demo mode)`)
      setShowDeleteModal(false)
      setDeleteItem(null)
    }
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.username || !newUser.email || !newUser.full_name) {
      toast.error('Please fill required fields')
      return
    }
    toast.success('User created! (Demo mode)')
    setShowUserModal(false)
    setNewUser({
      username: '',
      email: '',
      full_name: '',
      role: 'staff',
      department: '',
      is_active: true,
    })
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff' }}>⚙️ Settings & Configuration</h1>
        {user?.role === 'admin' && (
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Manage categories and departments</p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #333', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('categories')}
          style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'categories' ? '#646cff' : '#888', cursor: 'pointer', borderBottom: activeTab === 'categories' ? '2px solid #646cff' : 'none', fontSize: '1rem' }}
        >
          📦 Categories ({mockCategories.length})
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'departments' ? '#646cff' : '#888', cursor: 'pointer', borderBottom: activeTab === 'departments' ? '2px solid #646cff' : 'none', fontSize: '1rem' }}
        >
          🏢 Departments ({mockDepartments.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: activeTab === 'users' ? '#646cff' : '#888', cursor: 'pointer', borderBottom: activeTab === 'users' ? '2px solid #646cff' : 'none', fontSize: '1rem' }}
        >
          👥 Users ({mockUsers.length})
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#fff' }}>Asset Categories</h2>
            <button
              onClick={() => setShowCategoryModal(true)}
              style={{ background: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              ➕ Add Category
            </button>
          </div>

          <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#2a2a2a' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Code</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Description</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>Assets</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCategories.map((cat, index) => (
                  <tr key={cat.id} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                    <td style={{ padding: '1rem', color: '#646cff', fontFamily: 'monospace' }}>{cat.code}</td>
                    <td style={{ padding: '1rem', color: '#fff', fontWeight: '500' }}>{cat.name}</td>
                    <td style={{ padding: '1rem', color: '#888' }}>{cat.description}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', background: '#2a2a2a', color: '#fff' }}>
                        {cat.asset_count}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button onClick={() => handleEdit(cat, 'category')} style={{ color: '#646cff', background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                      <button onClick={() => handleDelete(cat, 'category')} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#fff' }}>Departments</h2>
            <button
              onClick={() => setShowDeptModal(true)}
              style={{ background: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              ➕ Add Department
            </button>
          </div>

          <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#2a2a2a' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Code</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Head</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Description</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>Assets</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockDepartments.map((dept, index) => (
                  <tr key={dept.id} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                    <td style={{ padding: '1rem', color: '#646cff', fontFamily: 'monospace' }}>{dept.code}</td>
                    <td style={{ padding: '1rem', color: '#fff', fontWeight: '500' }}>{dept.name}</td>
                    <td style={{ padding: '1rem', color: '#888' }}>{dept.head}</td>
                    <td style={{ padding: '1rem', color: '#888' }}>{dept.description}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.875rem', background: '#2a2a2a', color: '#fff' }}>
                        {dept.asset_count}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button onClick={() => handleEdit(dept, 'department')} style={{ color: '#646cff', background: 'none', border: 'none', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
                      <button onClick={() => handleDelete(dept, 'department')} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#fff' }}>Users Management</h2>
            <button
              onClick={() => setShowUserModal(true)}
              style={{ background: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
            >
              ➕ Add User
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Total Users</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{mockUsers.length}</p>
            </div>
            <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Active</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{mockUsers.filter(u => u.is_active).length}</p>
            </div>
            <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Inactive</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#666' }}>{mockUsers.filter(u => !u.is_active).length}</p>
            </div>
            <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Admins</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>{mockUsers.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>

          <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#2a2a2a' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Username</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#888', fontSize: '0.875rem' }}>Department</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888', fontSize: '0.875rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((u, index) => (
                  <tr key={u.id} style={{ borderTop: index > 0 ? '1px solid #2a2a2a' : 'none' }}>
                    <td style={{ padding: '1rem', color: '#646cff', fontFamily: 'monospace' }}>{u.username}</td>
                    <td style={{ padding: '1rem', color: '#fff', fontWeight: '500' }}>{u.full_name}</td>
                    <td style={{ padding: '1rem', color: '#888' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', background: u.role === 'admin' ? '#646cff20' : u.role === 'agency_admin' ? '#22c55e20' : '#2a2a2a', color: u.role === 'admin' ? '#646cff' : u.role === 'agency_admin' ? '#22c55e' : '#888' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#888' }}>{u.department}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '500', background: u.is_active ? '#22c55e20' : '#66620', color: u.is_active ? '#22c55e' : '#666' }}>
                        {u.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button onClick={() => handleEdit(u, 'user')} style={{ color: '#646cff', background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}>Edit</button>
                      <button onClick={() => handleDelete(u, 'user')} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Add New Category</h3>
            <form onSubmit={handleAddCategory}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., คอมพิวเตอร์"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Code</label>
                <input
                  type="text"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                  placeholder="e.g., CAT-001"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Category description..."
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCategoryModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: '#22c55e', color: 'white', cursor: 'pointer', fontWeight: '500' }}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showDeptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Add New Department</h3>
            <form onSubmit={handleAddDepartment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., IT"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Code</label>
                <input
                  type="text"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                  placeholder="e.g., DEPT-001"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Department Head</label>
                <input
                  type="text"
                  value={newItem.head}
                  onChange={(e) => setNewItem({ ...newItem, head: e.target.value })}
                  placeholder="e.g., John Doe"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Department description..."
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowDeptModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: '#22c55e', color: 'white', cursor: 'pointer', fontWeight: '500' }}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Edit {editItem.type}</h3>
            <form onSubmit={handleConfirmEdit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Name *</label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Code</label>
                <input
                  type="text"
                  value={editItem.code}
                  onChange={(e) => setEditItem({ ...editItem, code: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>
              {editItem.type === 'department' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Head</label>
                  <input
                    type="text"
                    value={editItem.head}
                    onChange={(e) => setEditItem({ ...editItem, head: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  />
                </div>
              )}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Description</label>
                <textarea
                  value={editItem.description}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>
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
      {showDeleteModal && deleteItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Confirm Delete</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteItem.name}</strong>?
              {deleteItem.asset_count > 0 && (
                <span style={{ display: 'block', marginTop: '0.5rem', color: '#f59e0b' }}>
                  ⚠️ This {deleteItem.type} has {deleteItem.asset_count} asset(s) assigned.
                </span>
              )}
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

      {/* Add User Modal */}
      {showUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>➕ Add New User</h3>
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Username *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="e.g., jsmith"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Full Name *</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="e.g., John Smith"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g., john@example.com"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="viewer">Viewer</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="agency_admin">Agency Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Department</label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    <option value="">Select Department</option>
                    {mockDepartments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={newUser.is_active}
                    onChange={(e) => setNewUser({ ...newUser, is_active: e.target.checked })}
                    style={{ accentColor: '#22c55e' }}
                  />
                  Active User
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowUserModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', background: '#22c55e', color: 'white', cursor: 'pointer', fontWeight: '500' }}>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #646cff' }}>
        <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>ℹ️ Demo Mode</h4>
        <p style={{ color: '#888', fontSize: '0.875rem' }}>
          Category and department management. Changes will be saved to database when backend API is connected.
        </p>
      </div>
    </div>
  )
}