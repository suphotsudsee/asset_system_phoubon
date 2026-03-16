from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class MaintenanceRecord(Base):
    """Maintenance record for tracking asset maintenance history."""
    
    __tablename__ = "maintenance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    
    # Maintenance type
    maintenance_type = Column(String(50))  # preventive, corrective, predictive, emergency
    
    # Details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Scheduling
    scheduled_date = Column(Date)
    completed_date = Column(DateTime)
    due_date = Column(Date)
    
    # Status
    status = Column(String(50), default="pending")  # pending, in_progress, completed, cancelled
    
    # Cost
    labor_cost = Column(Float, default=0.0)
    parts_cost = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    
    # Technician info
    technician_name = Column(String(200))
    technician_id = Column(Integer, ForeignKey("users.id"))
    vendor = Column(String(200))
    
    # AI prediction
    is_predicted = Column(Boolean, default=False)
    prediction_confidence = Column(Float)
    
    # Relationships
    asset = relationship("Asset", back_populates="maintenance_records")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
