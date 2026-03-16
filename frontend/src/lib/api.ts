import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = 'http://localhost:8001/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (credentials: { username: string; password: string }) => {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    return apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },
  register: (user: any) => apiClient.post('/auth/register', user),
  getCurrentUser: (token?: string) =>
    apiClient.get('/auth/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }),
  updateProfile: (data: any) => apiClient.put('/auth/me', data),
}

export const assetsApi = {
  getAll: (params?: any) => apiClient.get('/assets', { params }),
  getById: (id: number) => apiClient.get(`/assets/${id}`),
  getByCode: (code: string) => apiClient.get(`/assets/code/${code}`),
  create: (data: any) => apiClient.post('/assets', data),
  update: (id: number, data: any) => apiClient.put(`/assets/${id}`, data),
  delete: (id: number) => apiClient.delete(`/assets/${id}`),
  uploadImage: (assetId: number, imageFile: File) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    return apiClient.post(`/assets/${assetId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export const depreciationApi = {
  getSchedule: (assetId: number) => apiClient.get(`/depreciation/schedule/${assetId}`),
  getRecords: (assetId: number) => apiClient.get(`/depreciation/records/${assetId}`),
  createRecord: (data: any) => apiClient.post('/depreciation/records', data),
  getBookValue: (assetId: number) => apiClient.get(`/depreciation/book-value/${assetId}`),
}

export const maintenanceApi = {
  getAll: (params?: any) => apiClient.get('/maintenance/records', { params }),
  getById: (id: number) => apiClient.get(`/maintenance/records/${id}`),
  create: (data: any) => apiClient.post('/maintenance/records', data),
  update: (id: number, data: any) => apiClient.put(`/maintenance/records/${id}`, data),
  getUpcoming: (daysAhead?: number) => apiClient.get('/maintenance/upcoming', { params: { days_ahead: daysAhead } }),
  getCostSummary: (assetId: number) => apiClient.get(`/maintenance/cost-summary/${assetId}`),
}

export const qrApi = {
  getQRCode: (assetId: number) => apiClient.get(`/qr/${assetId}`, { responseType: 'blob' }),
  getQRBase64: (assetId: number) => apiClient.get(`/qr/${assetId}/base64`),
  getQRData: (assetId: number) => apiClient.get(`/qr/${assetId}/data`),
}

export const aiApi = {
  getAlerts: (params?: any) => apiClient.get('/ai/alerts', { params }),
  getAlertSummary: () => apiClient.get('/ai/alerts/summary'),
  getCriticalAlerts: () => apiClient.get('/ai/alerts/critical'),
  createPredictedMaintenance: (assetId: number) => apiClient.post(`/ai/alerts/${assetId}/create-maintenance`),
  getPrediction: (assetId: number) => apiClient.get(`/ai/predictions/${assetId}`),
}

export const categoriesApi = {
  getAll: () => apiClient.get('/categories'),
  getById: (id: number) => apiClient.get(`/categories/${id}`),
  create: (data: any) => apiClient.post('/categories', data),
  update: (id: number, data: any) => apiClient.put(`/categories/${id}`, data),
  delete: (id: number) => apiClient.delete(`/categories/${id}`),
}

export const departmentsApi = {
  getAll: () => apiClient.get('/departments'),
  getById: (id: number) => apiClient.get(`/departments/${id}`),
  create: (data: any) => apiClient.post('/departments', data),
  update: (id: number, data: any) => apiClient.put(`/departments/${id}`, data),
  delete: (id: number) => apiClient.delete(`/departments/${id}`),
}

export const usersApi = {
  getAll: () => apiClient.get('/users'),
  getById: (id: number) => apiClient.get(`/users/${id}`),
  create: (data: any) => apiClient.post('/users', data),
  update: (id: number, data: any) => apiClient.put(`/users/${id}`, data),
  delete: (id: number) => apiClient.delete(`/users/${id}`),
}

export default apiClient
