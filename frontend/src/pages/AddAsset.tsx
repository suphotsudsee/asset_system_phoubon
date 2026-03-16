import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const categories = ['คอมพิวเตอร์', 'เครื่องพิมพ์', 'เฟอร์นิเจอร์', 'เครื่องใช้ไฟฟ้า', 'ยานพาหนะ', 'อุปกรณ์สำนักงาน', 'อื่นๆ']
const departments = ['IT', 'Admin', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing']
const conditions = ['excellent', 'good', 'fair', 'poor']
const depreciationMethods = ['straight_line', 'declining_balance']

export default function AddAsset() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    serial_number: '',
    category: '',
    department: '',
    location: '',
    condition: 'good',
    purchase_date: '',
    purchase_price: '',
    useful_life_years: '',
    depreciation_method: 'straight_line',
    description: '',
    image: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate
    if (!formData.asset_code || !formData.name || !formData.category) {
      toast.error('Please fill required fields')
      setLoading(false)
      return
    }

    // Mock success (API not ready)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success('Asset created successfully! (Demo mode)')
      navigate('/assets')
    } catch (error) {
      toast.error('Failed to create asset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/assets')} style={{ background: 'none', border: 'none', color: '#646cff', cursor: 'pointer', fontSize: '1rem', padding: '0', marginBottom: '1rem' }}>
          ← Back to Assets
        </button>
        <h1 style={{ color: '#fff' }}>➕ Add New Asset</h1>
        <p style={{ color: '#888' }}>Create a new asset record in the system</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px' }}>
        {/* Basic Info */}
        <h3 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Basic Information</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
              Asset Code <span style={{ color: '#f59e0b' }}>*</span>
            </label>
            <input
              type="text"
              name="asset_code"
              value={formData.asset_code}
              onChange={handleChange}
              placeholder="e.g., AST-2024-001"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
              Serial Number
            </label>
            <input
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              placeholder="Manufacturer serial number"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
            Asset Name <span style={{ color: '#f59e0b' }}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., คอมพิวเตอร์ Dell OptiPlex"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
              Category <span style={{ color: '#f59e0b' }}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
              Department <span style={{ color: '#f59e0b' }}>*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
              required
            >
              <option value="">Select department</option>
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., ห้อง 101, อาคาร A"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          />
        </div>

        {/* Asset Details */}
        <h3 style={{ color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Asset Details</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
            >
              {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
              Purchase Date
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
              Purchase Price (฿) <span style={{ color: '#f59e0b' }}>*</span>
            </label>
            <input
              type="number"
              name="purchase_price"
              value={formData.purchase_price}
              onChange={handleChange}
              placeholder="e.g., 25000"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
              Useful Life (years)
            </label>
            <input
              type="number"
              name="useful_life_years"
              value={formData.useful_life_years}
              onChange={handleChange}
              placeholder="e.g., 5"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
            Depreciation Method
          </label>
          <select
            name="depreciation_method"
            value={formData.depreciation_method}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff' }}
          >
            {depreciationMethods.map(method => <option key={method} value={method}>{method.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
            Image
          </label>
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
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#888' }}>
            Upload image from your computer (JPG, PNG, GIF - max 5MB)
          </p>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888', fontSize: '0.875rem' }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Additional notes about the asset..."
            rows={4}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', resize: 'vertical' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/assets')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '4px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: '0.75rem 2rem', borderRadius: '4px', border: 'none', background: loading ? '#666' : '#22c55e', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}
          >
            {loading ? 'Creating...' : 'Create Asset'}
          </button>
        </div>
      </form>

      {/* Info */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #646cff' }}>
        <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>ℹ️ Demo Mode</h4>
        <p style={{ color: '#888', fontSize: '0.875rem' }}>
          Form validation is working. Asset creation will be saved to database when backend API is connected.
        </p>
      </div>
    </div>
  )
}