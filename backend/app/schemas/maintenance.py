from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, date
from typing import Optional
from enum import Enum


class MaintenanceType(str, Enum):
    preventive = "preventive"
    corrective = "corrective"
    predictive = "predictive"
    emergency = "emergency"


class MaintenanceStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class MaintenanceRecordBase(BaseModel):
    """Base schema for maintenance record."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    maintenance_type: MaintenanceType = MaintenanceType.preventive
    priority: Priority = Priority.medium
    scheduled_date: Optional[date] = None
    due_date: Optional[date] = None
    technician_name: Optional[str] = None
    vendor: Optional[str] = None


class MaintenanceRecordCreate(MaintenanceRecordBase):
    """Schema for creating maintenance record."""
    asset_id: int
    labor_cost: float = 0.0
    parts_cost: float = 0.0


class MaintenanceRecordUpdate(BaseModel):
    """Schema for updating maintenance record."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[MaintenanceStatus] = None
    priority: Optional[Priority] = None
    completed_date: Optional[datetime] = None
    labor_cost: Optional[float] = None
    parts_cost: Optional[float] = None
    technician_name: Optional[str] = None


class MaintenanceRecordResponse(MaintenanceRecordBase):
    """Schema for maintenance record response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    asset_id: int
    status: MaintenanceStatus
    completed_date: Optional[datetime] = None
    total_cost: float
    is_predicted: bool = False
    prediction_confidence: Optional[float] = None
    created_at: datetime
    updated_at: datetime


class MaintenanceAlert(BaseModel):
    """Schema for AI-generated maintenance alert."""
    asset_id: int
    asset_name: str
    predicted_failure_date: date
    confidence: float
    recommended_action: str
    estimated_cost: float
