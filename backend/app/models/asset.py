from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Asset(Base):
    """Asset model for fixed assets management."""
    
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(100), index=True)
    serial_number = Column(String(100))
    
    # Financial info
    purchase_price = Column(Float, nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    useful_life_years = Column(Integer, default=5)
    salvage_value = Column(Float, default=0.0)
    depreciation_method = Column(String(50), default="straight_line")
    
    # Location & status
    location = Column(String(200))
    department = Column(String(100), index=True)
    status = Column(String(50), default="active")  # active, inactive, disposed, maintenance
    condition = Column(String(50), default="good")  # excellent, good, fair, poor
    
    # QR code
    qr_code_path = Column(String(500))
    
    # Relationships
    depreciation_records = relationship("DepreciationRecord", back_populates="asset", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceRecord", back_populates="asset", cascade="all, delete-orphan")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

