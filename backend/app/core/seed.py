from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.asset import Asset
from app.models.category import Category
from app.models.department import Department
from app.models.user import User


MOCK_CATEGORIES = [
    {"name": "Computers", "code": "CAT-001", "description": "Computers and related equipment"},
    {"name": "Printers", "code": "CAT-002", "description": "Printers and print accessories"},
    {"name": "Furniture", "code": "CAT-003", "description": "Office desks, chairs, and furniture"},
    {"name": "Electrical", "code": "CAT-004", "description": "Electrical appliances and equipment"},
    {"name": "Vehicles", "code": "CAT-005", "description": "Cars and motorcycles"},
    {"name": "Office Supplies", "code": "CAT-006", "description": "General office equipment"},
]

MOCK_DEPARTMENTS = [
    {"name": "IT", "code": "DEPT-001", "head": "John Doe", "description": "Information technology"},
    {"name": "Admin", "code": "DEPT-002", "head": "Jane Smith", "description": "Administration"},
    {"name": "HR", "code": "DEPT-003", "head": "Bob Wilson", "description": "Human resources"},
    {"name": "Finance", "code": "DEPT-004", "head": "Alice Brown", "description": "Finance and accounting"},
    {"name": "Operations", "code": "DEPT-005", "head": "Charlie Davis", "description": "Operations"},
]

MOCK_USERS = [
    {"username": "admin", "email": "admin@example.com", "full_name": "System Administrator", "role": "admin", "department": "IT", "is_active": True, "password": "admin123"},
    {"username": "user1", "email": "user1@example.com", "full_name": "John Doe", "role": "asset_manager", "department": "IT", "is_active": True, "password": "password123"},
    {"username": "user2", "email": "user2@example.com", "full_name": "Jane Smith", "role": "staff", "department": "Admin", "is_active": True, "password": "password123"},
    {"username": "user3", "email": "user3@example.com", "full_name": "Bob Wilson", "role": "viewer", "department": "HR", "is_active": False, "password": "password123"},
    {"username": "user4", "email": "user4@example.com", "full_name": "Alice Brown", "role": "agency_admin", "department": "Finance", "is_active": True, "password": "password123"},
]

MOCK_ASSETS = [
    {"asset_code": "AST-2024-001", "name": "Dell OptiPlex Desktop", "category": "Computers", "department": "IT", "status": "active", "location": "Room 101", "purchase_price": 25000, "description": "Office desktop PC"},
    {"asset_code": "AST-2024-002", "name": "Canon Printer", "category": "Printers", "department": "Admin", "status": "active", "location": "Room 102", "purchase_price": 15000, "description": "Office printer"},
    {"asset_code": "AST-2024-003", "name": "Office Desk", "category": "Furniture", "department": "HR", "status": "active", "location": "Room 201", "purchase_price": 8000, "description": "Desk for HR office"},
    {"asset_code": "AST-2024-004", "name": "Office Chair", "category": "Furniture", "department": "Finance", "status": "inactive", "location": "Room 301", "purchase_price": 5000, "description": "Chair for finance office"},
    {"asset_code": "AST-2024-005", "name": "Air Conditioner", "category": "Electrical", "department": "IT", "status": "active", "location": "Room 101", "purchase_price": 12000, "description": "Cooling system"},
]


async def seed_reference_data(session: AsyncSession) -> None:
    for payload in MOCK_CATEGORIES:
        existing = await session.execute(select(Category).filter(Category.code == payload["code"]))
        if not existing.scalar_one_or_none():
            session.add(Category(**payload))

    for payload in MOCK_DEPARTMENTS:
        existing = await session.execute(select(Department).filter(Department.code == payload["code"]))
        if not existing.scalar_one_or_none():
            session.add(Department(**payload))

    for payload in MOCK_USERS:
        existing = await session.execute(select(User).filter(User.username == payload["username"]))
        if not existing.scalar_one_or_none():
            session.add(
                User(
                    username=payload["username"],
                    email=payload["email"],
                    full_name=payload["full_name"],
                    role=payload["role"],
                    department=payload["department"],
                    is_active=payload["is_active"],
                    is_superuser=payload["role"] == "admin",
                    hashed_password=get_password_hash(payload["password"]),
                )
            )

    for payload in MOCK_ASSETS:
        existing = await session.execute(select(Asset).filter(Asset.asset_code == payload["asset_code"]))
        asset = existing.scalar_one_or_none()
        if not asset:
            session.add(Asset(**payload))
        else:
            for field, value in payload.items():
                if getattr(asset, field, None) in (None, ""):
                    setattr(asset, field, value)

    await session.commit()
