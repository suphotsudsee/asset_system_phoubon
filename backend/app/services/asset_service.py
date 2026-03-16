from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime
import uuid
import os

from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate
from app.core.database import async_session_maker


class AssetService:
    """Service layer for asset operations."""
    
    @staticmethod
    async def get_assets(
        page: int = 1,
        page_size: int = 10,
        category: Optional[str] = None,
        department: Optional[str] = None,
        status: Optional[str] = None,
    ) -> tuple[list[Asset], int]:
        """Get paginated assets with filters."""
        async with async_session_maker() as session:
            query = select(Asset)
            
            if category:
                query = query.filter(Asset.category == category)
            if department:
                query = query.filter(Asset.department == department)
            if status:
                query = query.filter(Asset.status == status)
            
            # Count total
            total_query = select(func.count()).select_from(Asset)
            if category:
                total_query = total_query.filter(Asset.category == category)
            if department:
                total_query = total_query.filter(Asset.department == department)
            if status:
                total_query = total_query.filter(Asset.status == status)
            
            total_result = await session.execute(total_query)
            total = total_result.scalar()
            
            # Apply pagination
            query = query.offset((page - 1) * page_size).limit(page_size)
            result = await session.execute(query)
            assets = result.scalars().all()
            
            return assets, total
    
    @staticmethod
    async def get_asset_by_id(asset_id: int) -> Optional[Asset]:
        """Get single asset by ID."""
        async with async_session_maker() as session:
            query = select(Asset).options(
                selectinload(Asset.depreciation_records),
                selectinload(Asset.maintenance_records)
            ).filter(Asset.id == asset_id)
            result = await session.execute(query)
            return result.scalar_one_or_none()
    
    @staticmethod
    async def get_asset_by_code(asset_code: str) -> Optional[Asset]:
        """Get asset by code."""
        async with async_session_maker() as session:
            query = select(Asset).filter(Asset.asset_code == asset_code)
            result = await session.execute(query)
            return result.scalar_one_or_none()
    
    @staticmethod
    async def create_asset(asset_data: AssetCreate) -> Asset:
        """Create new asset."""
        async with async_session_maker() as session:
            # Generate asset code if not provided
            if not asset_data.asset_code:
                prefix = asset_data.category[:3].upper() if asset_data.category else "AST"
                asset_code = f"{prefix}-{uuid.uuid4().hex[:8].upper()}"
            else:
                asset_code = asset_data.asset_code
            
            asset = Asset(
                asset_code=asset_code,
                **asset_data.model_dump(exclude={'asset_code'})
            )
            
            session.add(asset)
            await session.commit()
            await session.refresh(asset)
            return asset
    
    @staticmethod
    async def update_asset(asset_id: int, asset_data: AssetUpdate) -> Optional[Asset]:
        """Update existing asset."""
        async with async_session_maker() as session:
            asset = await session.get(Asset, asset_id)
            if not asset:
                return None
            
            update_data = asset_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(asset, field, value)
            
            await session.commit()
            await session.refresh(asset)
            return asset
    
    @staticmethod
    async def delete_asset(asset_id: int) -> bool:
        """Delete asset."""
        async with async_session_maker() as session:
            asset = await session.get(Asset, asset_id)
            if not asset:
                return False
            
            await session.delete(asset)
            await session.commit()
            return True
    
    @staticmethod
    async def get_assets_by_department(department: str) -> list[Asset]:
        """Get all assets for a department."""
        async with async_session_maker() as session:
            query = select(Asset).filter(Asset.department == department)
            result = await session.execute(query)
            return result.scalars().all()
