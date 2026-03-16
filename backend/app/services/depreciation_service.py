from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from datetime import datetime
from app.models.depreciation import DepreciationRecord
from app.models.asset import Asset
from app.schemas.depreciation import DepreciationRecordCreate, DepreciationSchedule
from app.core.database import async_session_maker


class DepreciationService:
    """Service layer for depreciation calculations and records."""
    
    @staticmethod
    def calculate_depreciation_schedule(
        purchase_price: float,
        useful_life_years: int,
        salvage_value: float,
        method: str = "straight_line"
    ) -> list[dict]:
        """Calculate depreciation schedule based on method."""
        schedule = []
        depreciable_amount = purchase_price - salvage_value
        
        if method == "straight_line":
            annual_depreciation = depreciable_amount / useful_life_years
            accumulated = 0.0
            
            for year in range(1, useful_life_years + 1):
                accumulated += annual_depreciation
                book_value = purchase_price - accumulated
                schedule.append({
                    "year": year,
                    "beginning_value": purchase_price - (accumulated - annual_depreciation),
                    "depreciation_expense": annual_depreciation,
                    "accumulated_depreciation": accumulated,
                    "ending_book_value": book_value,
                })
        
        elif method == "declining_balance":
            rate = 2.0 / useful_life_years  # Double declining
            book_value = purchase_price
            
            for year in range(1, useful_life_years + 1):
                depreciation = book_value * rate
                if book_value - depreciation < salvage_value:
                    depreciation = book_value - salvage_value
                
                book_value -= depreciation
                accumulated = purchase_price - book_value
                schedule.append({
                    "year": year,
                    "beginning_value": book_value + depreciation,
                    "depreciation_expense": depreciation,
                    "accumulated_depreciation": accumulated,
                    "ending_book_value": book_value,
                })
        
        return schedule
    
    @staticmethod
    async def create_depreciation_record(record_data: DepreciationRecordCreate) -> DepreciationRecord:
        """Create depreciation record."""
        async with async_session_maker() as session:
            record = DepreciationRecord(**record_data.model_dump())
            session.add(record)
            await session.commit()
            await session.refresh(record)
            return record
    
    @staticmethod
    async def get_depreciation_records(asset_id: int) -> list[DepreciationRecord]:
        """Get all depreciation records for an asset."""
        async with async_session_maker() as session:
            query = select(DepreciationRecord).filter(
                DepreciationRecord.asset_id == asset_id
            ).order_by(DepreciationRecord.fiscal_year)
            result = await session.execute(query)
            return result.scalars().all()
    
    @staticmethod
    async def get_current_book_value(asset_id: int) -> Optional[float]:
        """Get current book value of asset."""
        async with async_session_maker() as session:
            query = select(DepreciationRecord).filter(
                DepreciationRecord.asset_id == asset_id
            ).order_by(DepreciationRecord.created_at.desc()).limit(1)
            result = await session.execute(query)
            record = result.scalar_one_or_none()
            return record.ending_book_value if record else None
