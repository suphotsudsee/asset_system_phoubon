from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.services.depreciation_service import DepreciationService
from app.services.asset_service import AssetService
from app.schemas.depreciation import (
    DepreciationRecordCreate,
    DepreciationRecordResponse,
    DepreciationSchedule,
)
from app.core.security import get_current_user

router = APIRouter(prefix="/depreciation", tags=["Depreciation"])


@router.get("/schedule/{asset_id}", response_model=DepreciationSchedule)
async def get_depreciation_schedule(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Calculate depreciation schedule for an asset."""
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    schedule = DepreciationService.calculate_depreciation_schedule(
        purchase_price=asset.purchase_price,
        useful_life_years=asset.useful_life_years,
        salvage_value=asset.salvage_value,
        method=asset.depreciation_method,
    )
    
    return DepreciationSchedule(
        asset_id=asset_id,
        purchase_price=asset.purchase_price,
        useful_life_years=asset.useful_life_years,
        salvage_value=asset.salvage_value,
        method=asset.depreciation_method,
        schedule=schedule,
    )


@router.post("/records", response_model=DepreciationRecordResponse, status_code=201)
async def create_depreciation_record(
    record_data: DepreciationRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create new depreciation record."""
    if "create" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Verify asset exists
    asset = await AssetService.get_asset_by_id(record_data.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    record = await DepreciationService.create_depreciation_record(record_data)
    return record


@router.get("/records/{asset_id}", response_model=list[DepreciationRecordResponse])
async def get_depreciation_records(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get all depreciation records for an asset."""
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    records = await DepreciationService.get_depreciation_records(asset_id)
    return records


@router.get("/book-value/{asset_id}")
async def get_current_book_value(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get current book value of an asset."""
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    book_value = await DepreciationService.get_current_book_value(asset_id)
    
    return {
        "asset_id": asset_id,
        "asset_code": asset.asset_code,
        "original_value": asset.purchase_price,
        "current_book_value": book_value if book_value else asset.purchase_price,
        "accumulated_depreciation": asset.purchase_price - (book_value if book_value else asset.purchase_price),
    }
