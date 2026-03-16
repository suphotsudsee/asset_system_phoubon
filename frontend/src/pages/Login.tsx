import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authApi.login({ username, password })
      const { access_token } = response.data
      
      // Get user info
      const userResponse = await authApi.getCurrentUser(access_token)
      
      login(access_token, userResponse.data)
      toast.success('Login successful!')
      navigate('/')
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Error response:', error.response)
      
      let errorMsg = 'Login failed'
      
      if (error.response?.status === 422) {
        // Validation error
        const errors = error.response.data
        if (Array.isArray(errors) && errors.length > 0) {
          errorMsg = errors[0]?.msg || 'Validation error'
        } else if (errors?.detail) {
          errorMsg = Array.isArray(errors.detail) 
            ? errors.detail[0]?.msg 
            : errors.detail
        }
      } else if (error.response?.status === 401) {
        errorMsg = 'Invalid credentials'
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail
      }
      
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Asset Management System</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333' }}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '0.75rem', borderRadius: '4px', background: '#646cff', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#888' }}>
        Default: admin / admin123
      </p>
    </div>
  )
}
