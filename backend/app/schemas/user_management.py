from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ManagedUserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "staff"
    department: Optional[str] = None
    is_active: bool = True


class ManagedUserCreate(ManagedUserBase):
    password: str = Field(default="password123", min_length=6)


class ManagedUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6)


class ManagedUserResponse(ManagedUserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_superuser: bool
    created_at: datetime
    last_login: Optional[datetime] = None


class ManagedUserListResponse(BaseModel):
    items: list[ManagedUserResponse]
