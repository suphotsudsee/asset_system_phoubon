import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

// Mock data
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', full_name: 'System Administrator', role: 'admin', department: 'IT', is_active: true, created_at: '2024-01-01' },
  { id: 2, username: 'user1', email: 'user1@example.com', full_name: 'John Doe', role: 'asset_manager', department: 'IT', is_active: true, created_at: '2024-01-15' },
  { id: 3, username: 'user2', email: 'user2@example.com', full_name: 'Jane Smith', role: 'staff', department: 'Admin', is_active: true, created_at: '2024-02-01' },
  { id: 4, username: 'user3', email: 'user3@example.com', full_name: 'Bob Wilson', role: 'viewer', department: 'HR', is_active: false, created_at: '2024-02-15' },
  { id: 5, username: 'user4', email: 'user4@example.com', full_name: 'Alice Brown', role: 'agency_admin', department: 'Finance', is_active: true, created_at: '2024-03-01' },
]

const roles = ['admin', 'agency_admin', 'asset_manager', 'staff', 'viewer']
const departments = ['IT', 'Admin', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing']

export default function Users() {
  const user = useAuthStore((state) => state.user)
  const [users, setUsers] = useState(mockUsers)
  const [filter, setFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editUser, setEditUser] = useState<any>(null)
  const [deleteUser, setDeleteUser] = useState<any>(null)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'staff',
    department: '',
    password: '',
  })

  const filteredUsers = users.filter(u => {
    const matchFilter = !filter || 
      u.username.toLowerCase().includes(filter.toLowerCase()) ||
      u.full_name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchFilter && matchRole
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.username || !newUser.email) {
      toast.error('Please fill required fields')
      return
    }
    
    const newId = users.length + 1
    setUsers([...users, {
      id: newId,
      ...newUser,
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
    }])
    
    toast.success('User created successfully!')
    setShowAddModal(false)
    setNewUser({ username: '', email: '', full_name: '', role: 'staff', department: '', password: '' })
  }

  const handleEdit = (u: any) => {
    setEditUser({ ...u })
    setShowEditModal(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editUser) {
      setUsers(users.map(u => u.id === editUser.id ? editUser : u))
      toast.success('User updated successfully!')
      setShowEditModal(false)
      setEditUser(null)
    }
  }

  const handleDelete = (u: any) => {
    setDeleteUser(u)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (deleteUser) {
      setUsers(users.filter(u => u.id !== deleteUser.id))
      toast.success('User deleted successfully!')
      setShowDeleteModal(false)
      setDeleteUser(null)
    }
  }

  const handleToggleStatus = (u: any) => {
    setUsers(users.map(user => 
      user.id === u.id ? { ...user, is_active: !user.is_active } : user
    ))
    toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}`)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff' }}>👥 User Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ background: '#22c55e', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
        >
          ➕ Add User
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Search</label>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by username, name, or email..."
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          >
            <option value="">All Roles</option>
            {roles.map(role => <option key={role} value={role}>{role}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Total Users</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{users.length}</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Active</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{users.filter(u => u.is_active).length}</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Inactive</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#666' }}>{users.filter(u => !u.is_active).length}</p>
        </div>
        <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Admins</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#646cff' }}>{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>

      {/* Table */}
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
            {filteredUsers.map((u, index) => (
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
                  <button onClick={() => handleEdit(u)} style={{ color: '#646cff', background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}>Edit</button>
                  <button onClick={() => handleToggleStatus(u)} style={{ color: u.is_active ? '#f59e0b' : '#22c55e', background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}>
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(u)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
          <p>No users found matching your filters</p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Add New User</h3>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Username *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="e.g., user1"
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
                  placeholder="e.g., user@example.com"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Full Name</label>
                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="e.g., John Doe"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
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
                    {roles.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Department</label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}>
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

      {/* Edit Modal */}
      {showEditModal && editUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Edit User</h3>
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Username</label>
                <input
                  type="text"
                  value={editUser.username}
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  readOnly
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#888', cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Full Name</label>
                <input
                  type="text"
                  value={editUser.full_name}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Role</label>
                  <select
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    {roles.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Department</label>
                  <select
                    value={editUser.department}
                    onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                  >
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>Status</label>
                <select
                  value={editUser.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setEditUser({ ...editUser, is_active: e.target.value === 'active' })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
      {showDeleteModal && deleteUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Confirm Delete</h3>
            <p style={{ color: '#888', marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteUser.full_name}</strong> ({deleteUser.username})?
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
