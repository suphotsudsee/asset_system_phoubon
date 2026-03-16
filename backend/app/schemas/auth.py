from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data."""
    username: Optional[str] = None
    role: Optional[str] = None


class UserBase(BaseModel):
    """Base user schema."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None
    department: Optional[str] = None
    role: str = "staff"


class UserCreate(UserBase):
    """Schema for creating user."""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """Schema for updating user."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6)


class UserResponse(UserBase):
    """Schema for user response."""
    model_config = {"from_attributes": True}
    
    id: int
    is_active: bool
    is_superuser: bool
    last_login: Optional[datetime] = None
    created_at: datetime


class LoginRequest(BaseModel):
    """Schema for login request."""
    username: str
    password: str
