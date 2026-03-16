from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.services.maintenance_service import MaintenanceService
from app.services.asset_service import AssetService
from app.schemas.maintenance import (
    MaintenanceRecordCreate,
    MaintenanceRecordUpdate,
    MaintenanceRecordResponse,
    MaintenanceAlert,
)
from app.core.security import get_current_user

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.get("/records", response_model=list[MaintenanceRecordResponse])
async def get_maintenance_records(
    asset_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    maintenance_type: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get maintenance records with filters."""
    records = await MaintenanceService.get_maintenance_records(
        asset_id=asset_id,
        status=status,
        maintenance_type=maintenance_type,
        limit=limit,
    )
    return records


@router.get("/records/{record_id}", response_model=MaintenanceRecordResponse)
async def get_maintenance_record(
    record_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get single maintenance record."""
    record = await MaintenanceService.get_maintenance_record_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record


@router.post("/records", response_model=MaintenanceRecordResponse, status_code=201)
async def create_maintenance_record(
    record_data: MaintenanceRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create new maintenance record."""
    if "create" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Verify asset exists
    asset = await AssetService.get_asset_by_id(record_data.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    record = await MaintenanceService.create_maintenance_record(record_data)
    return record


@router.put("/records/{record_id}", response_model=MaintenanceRecordResponse)
async def update_maintenance_record(
    record_id: int,
    update_data: MaintenanceRecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update maintenance record."""
    if "update" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    record = await MaintenanceService.update_maintenance_record(record_id, update_data)
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record


@router.get("/upcoming", response_model=list[MaintenanceRecordResponse])
async def get_upcoming_maintenance(
    days_ahead: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get upcoming scheduled maintenance."""
    records = await MaintenanceService.get_upcoming_maintenance(days_ahead=days_ahead)
    return records


@router.get("/cost-summary/{asset_id}")
async def get_maintenance_cost_summary(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get maintenance cost summary for an asset."""
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    summary = await MaintenanceService.get_maintenance_cost_summary(asset_id)
    return summary
