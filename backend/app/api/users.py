from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash
from app.models.user import User
from app.schemas.user_management import (
    ManagedUserCreate,
    ManagedUserListResponse,
    ManagedUserResponse,
    ManagedUserUpdate,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=ManagedUserListResponse)
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(select(User).order_by(User.id))
    return ManagedUserListResponse(items=result.scalars().all())


@router.post("", response_model=ManagedUserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: ManagedUserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        department=payload.department,
        is_active=payload.is_active,
        is_superuser=payload.role == "admin",
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/{user_id}", response_model=ManagedUserResponse)
async def update_user(
    user_id: int,
    payload: ManagedUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = payload.model_dump(exclude_unset=True)
    password = updates.pop("password", None)
    if password:
        user.hashed_password = get_password_hash(password)

    for field, value in updates.items():
        setattr(user, field, value)

    if "role" in updates:
        user.is_superuser = user.role == "admin"

    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()
