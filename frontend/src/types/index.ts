export interface Asset {
  id: number
  asset_code: string
  name: string
  description?: string
  category?: string
  serial_number?: string
  purchase_price: number
  purchase_date: string
  useful_life_years: number
  salvage_value: number
  depreciation_method: string
  location?: string
  department?: string
  status: 'active' | 'inactive' | 'disposed' | 'maintenance'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  qr_code_path?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  department?: string
  role: 'admin' | 'manager' | 'staff'
  is_active: boolean
  is_superuser: boolean
  last_login?: string
  created_at: string
}

export interface MaintenanceRecord {
  id: number
  asset_id: number
  title: string
  description?: string
  maintenance_type: 'preventive' | 'corrective' | 'predictive' | 'emergency'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_date?: string
  completed_date?: string
  due_date?: string
  labor_cost: number
  parts_cost: number
  total_cost: number
  technician_name?: string
  vendor?: string
  is_predicted: boolean
  prediction_confidence?: number
  created_at: string
  updated_at: string
}

export interface DepreciationRecord {
  id: number
  asset_id: number
  fiscal_year: number
  fiscal_period: string
  beginning_book_value: number
  depreciation_expense: number
  accumulated_depreciation: number
  ending_book_value: number
  depreciation_method: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MaintenanceAlert {
  asset_id: number
  asset_name: string
  predicted_failure_date: string
  confidence: number
  recommended_action: string
  estimated_cost: number
}

export interface ApiResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface LoginCredentials {
  username: string
  password: string
}
