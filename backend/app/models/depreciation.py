from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class DepreciationRecord(Base):
    """Depreciation record for tracking asset value over time."""
    
    __tablename__ = "depreciation_records"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    
    # Depreciation details
    fiscal_year = Column(Integer, index=True)
    fiscal_period = Column(String(20))  # monthly, quarterly, yearly
    
    # Values
    beginning_book_value = Column(Float, nullable=False)
    depreciation_expense = Column(Float, nullable=False)
    accumulated_depreciation = Column(Float, nullable=False)
    ending_book_value = Column(Float, nullable=False)
    
    # Method used
    depreciation_method = Column(String(50))  # straight_line, declining_balance, units_of_production
    
    # Notes
    notes = Column(String(500))
    
    # Relationships
    asset = relationship("Asset", back_populates="depreciation_records")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

