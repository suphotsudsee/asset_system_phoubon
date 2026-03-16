from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional


class DepreciationRecordBase(BaseModel):
    """Base schema for depreciation record."""
    fiscal_year: int = Field(..., gt=0)
    fiscal_period: str = "yearly"
    depreciation_method: str = "straight_line"
    notes: Optional[str] = None


class DepreciationRecordCreate(DepreciationRecordBase):
    """Schema for creating depreciation record."""
    asset_id: int
    beginning_book_value: float
    depreciation_expense: float
    accumulated_depreciation: float
    ending_book_value: float


class DepreciationRecordUpdate(BaseModel):
    """Schema for updating depreciation record."""
    notes: Optional[str] = None
    depreciation_method: Optional[str] = None


class DepreciationRecordResponse(DepreciationRecordBase):
    """Schema for depreciation record response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    asset_id: int
    beginning_book_value: float
    depreciation_expense: float
    accumulated_depreciation: float
    ending_book_value: float
    created_at: datetime
    updated_at: datetime


class DepreciationSchedule(BaseModel):
    """Schema for depreciation schedule calculation."""
    asset_id: int
    purchase_price: float
    useful_life_years: int
    salvage_value: float
    method: str = "straight_line"
    schedule: list[dict]
