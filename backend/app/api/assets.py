from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.core.database import get_db
from app.services.asset_service import AssetService
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse, AssetListResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/assets", tags=["Assets"])


@router.get("", response_model=AssetListResponse)
async def get_assets(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    category: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get paginated list of assets with optional filters."""
    assets, total = await AssetService.get_assets(
        page=page,
        page_size=page_size,
        category=category,
        department=department,
        status=status,
    )
    
    return AssetListResponse(
        items=assets,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{asset_id}", response_model=AssetResponse)
async def get_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get single asset by ID."""
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.get("/code/{asset_code}", response_model=AssetResponse)
async def get_asset_by_code(
    asset_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get asset by asset code."""
    asset = await AssetService.get_asset_by_code(asset_code)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.post("", response_model=AssetResponse, status_code=201)
async def create_asset(
    asset_data: AssetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create new asset."""
    # Check permissions
    if "create" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    asset = await AssetService.create_asset(asset_data)
    return asset


@router.put("/{asset_id}", response_model=AssetResponse)
async def update_asset(
    asset_id: int,
    asset_data: AssetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update existing asset."""
    if "update" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    asset = await AssetService.update_asset(asset_id, asset_data)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.delete("/{asset_id}", status_code=204)
async def delete_asset(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete asset."""
    if "delete" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    success = await AssetService.delete_asset(asset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset not found")
