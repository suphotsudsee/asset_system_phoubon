# Models package
from app.models.asset import Asset
from app.models.category import Category
from app.models.depreciation import DepreciationRecord
from app.models.department import Department
from app.models.maintenance import MaintenanceRecord
from app.models.user import User

__all__ = ['Asset', 'Category', 'Department', 'DepreciationRecord', 'MaintenanceRecord', 'User']
