from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.core.database import Base


class User(Base):
    """User model for authentication and authorization."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(500), nullable=False)
    
    # Profile
    full_name = Column(String(200))
    department = Column(String(100))
    position = Column(String(100))
    phone = Column(String(50))
    
    # RBAC
    role = Column(String(50), default="staff")  # admin, manager, staff
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Permissions (JSON for flexible permissions)
    permissions = Column(String(500))  # JSON string of permissions
    
    # Session
    last_login = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

