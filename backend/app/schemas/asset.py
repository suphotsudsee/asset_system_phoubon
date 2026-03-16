from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from enum import Enum


class AssetStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    disposed = "disposed"
    maintenance = "maintenance"


class AssetCondition(str, Enum):
    excellent = "excellent"
    good = "good"
    fair = "fair"
    poor = "poor"


class DepreciationMethod(str, Enum):
    straight_line = "straight_line"
    declining_balance = "declining_balance"
    units_of_production = "units_of_production"


class AssetBase(BaseModel):
    """Base schema for asset."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_price: float = Field(..., gt=0)
    purchase_date: Optional[datetime] = None
    useful_life_years: int = Field(default=5, gt=0)
    salvage_value: float = Field(default=0.0, ge=0)
    depreciation_method: str = "straight_line"
    location: Optional[str] = None
    department: Optional[str] = None
    status: AssetStatus = AssetStatus.active
    condition: AssetCondition = AssetCondition.good


class AssetCreate(AssetBase):
    """Schema for creating asset."""
    asset_code: Optional[str] = None


class AssetUpdate(BaseModel):
    """Schema for updating asset."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    serial_number: Optional[str] = None
    purchase_price: Optional[float] = Field(None, gt=0)
    location: Optional[str] = None
    department: Optional[str] = None
    status: Optional[AssetStatus] = None
    condition: Optional[AssetCondition] = None


class AssetResponse(AssetBase):
    """Schema for asset response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    asset_code: str
    qr_code_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AssetListResponse(BaseModel):
    """Schema for asset list response."""
    items: list[AssetResponse]
    total: int
    page: int
    page_size: int
