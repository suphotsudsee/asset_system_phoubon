from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime, date, timedelta
from app.models.maintenance import MaintenanceRecord
from app.models.asset import Asset
from app.schemas.maintenance import MaintenanceRecordCreate, MaintenanceRecordUpdate, MaintenanceAlert
from app.core.database import async_session_maker


class MaintenanceService:
    """Service layer for maintenance operations."""
    
    @staticmethod
    async def create_maintenance_record(record_data: MaintenanceRecordCreate) -> MaintenanceRecord:
        """Create new maintenance record."""
        async with async_session_maker() as session:
            record = MaintenanceRecord(
                total_cost=record_data.labor_cost + record_data.parts_cost,
                **record_data.model_dump(exclude={'labor_cost', 'parts_cost'})
            )
            session.add(record)
            await session.commit()
            await session.refresh(record)
            return record
    
    @staticmethod
    async def get_maintenance_records(
        asset_id: Optional[int] = None,
        status: Optional[str] = None,
        maintenance_type: Optional[str] = None,
        limit: int = 100
    ) -> List[MaintenanceRecord]:
        """Get maintenance records with filters."""
        async with async_session_maker() as session:
            query = select(MaintenanceRecord)
            
            if asset_id:
                query = query.filter(MaintenanceRecord.asset_id == asset_id)
            if status:
                query = query.filter(MaintenanceRecord.status == status)
            if maintenance_type:
                query = query.filter(MaintenanceRecord.maintenance_type == maintenance_type)
            
            query = query.order_by(MaintenanceRecord.created_at.desc()).limit(limit)
            result = await session.execute(query)
            return result.scalars().all()
    
    @staticmethod
    async def get_maintenance_record_by_id(record_id: int) -> Optional[MaintenanceRecord]:
        """Get single maintenance record by ID."""
        async with async_session_maker() as session:
            return await session.get(MaintenanceRecord, record_id)
    
    @staticmethod
    async def update_maintenance_record(
        record_id: int,
        update_data: MaintenanceRecordUpdate
    ) -> Optional[MaintenanceRecord]:
        """Update maintenance record."""
        async with async_session_maker() as session:
            record = await session.get(MaintenanceRecord, record_id)
            if not record:
                return None
            
            update_dict = update_data.model_dump(exclude_unset=True)
            if 'labor_cost' in update_dict or 'parts_cost' in update_dict:
                labor = update_dict.get('labor_cost', record.labor_cost)
                parts = update_dict.get('parts_cost', record.parts_cost)
                update_dict['total_cost'] = labor + parts
            
            for field, value in update_dict.items():
                setattr(record, field, value)
            
            await session.commit()
            await session.refresh(record)
            return record
    
    @staticmethod
    async def get_upcoming_maintenance(days_ahead: int = 30) -> List[MaintenanceRecord]:
        """Get upcoming scheduled maintenance."""
        async with async_session_maker() as session:
            cutoff_date = date.today() + timedelta(days=days_ahead)
            query = select(MaintenanceRecord).filter(
                MaintenanceRecord.scheduled_date <= cutoff_date,
                MaintenanceRecord.status == "pending"
            ).order_by(MaintenanceRecord.scheduled_date)
            result = await session.execute(query)
            return result.scalars().all()
    
    @staticmethod
    async def get_maintenance_cost_summary(asset_id: int) -> dict:
        """Get maintenance cost summary for an asset."""
        async with async_session_maker() as session:
            query = select(MaintenanceRecord).filter(
                MaintenanceRecord.asset_id == asset_id,
                MaintenanceRecord.status == "completed"
            )
            result = await session.execute(query)
            records = result.scalars().all()
            
            total_labor = sum(r.labor_cost for r in records)
            total_parts = sum(r.parts_cost for r in records)
            total_cost = sum(r.total_cost for r in records)
            
            return {
                "asset_id": asset_id,
                "total_maintenance_records": len(records),
                "total_labor_cost": total_labor,
                "total_parts_cost": total_parts,
                "total_maintenance_cost": total_cost,
                "average_cost_per_record": total_cost / len(records) if records else 0,
            }
