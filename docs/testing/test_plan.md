# Test Plan - ระบบงานทะเบียนครุภัณฑ์

**วันที่:** 16 มีนาคม 2026  
**ผู้จัดทำ:** Test Case Designer Team  
**โปรเจกต์:** Asset Management System v1.0.0  
**Test Coverage Target:** 80%+

---

## 📋 Executive Summary

### สถานะปัจจุบัน
ระบบอยู่ในระยะเริ่มต้น development มีเฉพาะ basic models และ configuration เท่านั้น **ยังไม่มี test suite** และ **ยังไม่มี core implementation** (APIs, services, frontend)

### Test Strategy
ใช้ testing pyramid approach:
- **Unit Tests:** 70% (backend logic, models, services)
- **Integration Tests:** 20% (API endpoints, database)
- **E2E Tests:** 10% (user workflows)

### Test Coverage Goals

| Component | Target | Priority |
|-----------|--------|----------|
| Backend (API) | 85% | 🔴 Critical |
| Backend (Models) | 90% | 🔴 Critical |
| Backend (Services) | 85% | 🔴 Critical |
| Backend (Security) | 95% | 🔴 Critical |
| Frontend (Components) | 80% | 🟠 High |
| Frontend (Pages) | 75% | 🟠 High |
| Frontend (Utils) | 85% | 🟡 Medium |

---

## 🧪 Test Types & Scope

### 1. Unit Tests

#### 1.1 Backend Unit Tests

**Models Tests** (`tests/unit/models/`)

| Test File | Coverage | Priority |
|-----------|----------|----------|
| `test_asset.py` | 90% | 🔴 Critical |
| `test_depreciation.py` | 90% | 🔴 Critical |
| `test_maintenance.py` | 90% | 🔴 Critical |
| `test_user.py` | 95% | 🔴 Critical |
| `test_audit_log.py` | 95% | 🔴 Critical |

**Test Cases - Asset Model:**
```python
def test_asset_creation():
    """Test creating asset with valid data"""
    asset = Asset(
        asset_code="AST-2026-001",
        name="Computer Dell OptiPlex",
        purchase_price=25000.00,
        purchase_date=datetime(2026, 1, 1),
        useful_life_years=5,
        depreciation_method="straight_line"
    )
    assert asset.asset_code == "AST-2026-001"
    assert asset.status == "active"
    assert asset.condition == "good"

def test_asset_validation():
    """Test asset field validation"""
    with pytest.raises(IntegrityError):
        Asset(name="")  # name cannot be empty
    
    with pytest.raises(IntegrityError):
        Asset(asset_code="AST-2026-001", purchase_price=-100)  # price must be positive

def test_asset_relationships():
    """Test asset relationships"""
    asset = Asset(...)
    depreciation = DepreciationRecord(asset=asset, ...)
    assert asset.depreciation_records[0] == depreciation
```

**Services Tests** (`tests/unit/services/`)

| Test File | Coverage | Priority |
|-----------|----------|----------|
| `test_depreciation_service.py` | 90% | 🔴 Critical |
| `test_asset_service.py` | 85% | 🔴 Critical |
| `test_auth_service.py` | 95% | 🔴 Critical |
| `test_qr_service.py` | 85% | 🟠 High |
| `test_ai_prediction.py` | 80% | 🟡 Medium |

**Test Cases - Depreciation Service:**
```python
def test_straight_line_depreciation():
    """Test straight-line depreciation calculation"""
    asset = Asset(
        purchase_price=100000,
        salvage_value=10000,
        useful_life_years=5
    )
    expense = depreciation_service.calculate(
        asset, 
        method="straight_line",
        periods=12
    )
    expected_annual = (100000 - 10000) / 5  # 18000
    expected_monthly = expected_annual / 12  # 1500
    assert expense.annual == expected_annual
    assert expense.monthly == expected_monthly

def test_declining_balance_depreciation():
    """Test declining balance depreciation"""
    asset = Asset(
        purchase_price=100000,
        useful_life_years=5,
        depreciation_method="declining_balance"
    )
    # Double declining balance rate = 2/5 = 40%
    year1 = depreciation_service.calculate_year(asset, year=1)
    assert year1.expense == 40000  # 100000 * 40%
    year2 = depreciation_service.calculate_year(asset, year=2)
    assert year2.expense == 24000  # (100000-40000) * 40%

def test_depreciation_edge_cases():
    """Test edge cases"""
    # Fully depreciated asset
    asset = Asset(purchase_price=100000, useful_life_years=5)
    for year in range(1, 6):
        depreciation_service.calculate_year(asset, year)
    assert asset.book_value == asset.salvage_value
    
    # Asset with zero salvage value
    asset = Asset(purchase_price=50000, salvage_value=0)
    # Should depreciate to zero
```

**Security Tests** (`tests/unit/security/`)

| Test File | Coverage | Priority |
|-----------|----------|----------|
| `test_password_hashing.py` | 95% | 🔴 Critical |
| `test_jwt_tokens.py` | 95% | 🔴 Critical |
| `test_permissions.py` | 90% | 🔴 Critical |
| `test_rate_limiting.py` | 85% | 🟠 High |
| `test_input_validation.py` | 90% | 🔴 Critical |

**Test Cases - Security:**
```python
def test_password_hashing():
    """Test password hashing"""
    password = "SecurePassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("WrongPassword", hashed)

def test_password_strength_validation():
    """Test password strength requirements"""
    assert validate_password_strength("Short1!") == False  # Too short
    assert validate_password_strength("NoSpecial1") == False  # No special char
    assert validate_password_strength("nouppercase1!") == False  # No uppercase
    assert validate_password_strength("SecurePassword123!") == True

def test_jwt_token_creation():
    """Test JWT token creation"""
    user_data = {"sub": "user123", "role": "admin"}
    token = create_access_token(user_data)
    assert token is not None
    assert len(token) > 100
    
    payload = decode_access_token(token)
    assert payload["sub"] == "user123"
    assert payload["role"] == "admin"

def test_jwt_token_expiration():
    """Test JWT token expiration"""
    user_data = {"sub": "user123"}
    token = create_access_token(user_data, expires_delta=timedelta(minutes=-1))
    payload = decode_access_token(token)
    assert payload is None  # Expired token

def test_rbac_permissions():
    """Test RBAC permission checks"""
    admin_user = User(role="admin", agency_id=1)
    manager_user = User(role="manager", agency_id=1)
    staff_user = User(role="staff", agency_id=1)
    
    assert can_create_asset(admin_user) == True
    assert can_create_asset(manager_user) == True
    assert can_create_asset(staff_user) == False
    
    assert can_delete_asset(admin_user) == True
    assert can_delete_asset(manager_user) == False
```

---

### 2. Integration Tests

#### 2.1 API Integration Tests

**Test File:** `tests/integration/test_api.py`

**Test Cases:**

```python
@pytest.mark.asyncio
async def test_asset_crud_operations():
    """Test full asset CRUD workflow"""
    # Create
    asset_data = {"name": "Test Asset", "purchase_price": 10000}
    response = await client.post("/api/v1/assets", json=asset_data)
    assert response.status_code == 201
    asset_id = response.json()["id"]
    
    # Read
    response = await client.get(f"/api/v1/assets/{asset_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test Asset"
    
    # Update
    update_data = {"name": "Updated Asset"}
    response = await client.put(f"/api/v1/assets/{asset_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Asset"
    
    # Delete
    response = await client.delete(f"/api/v1/assets/{asset_id}")
    assert response.status_code == 204
    
    # Verify deletion
    response = await client.get(f"/api/v1/assets/{asset_id}")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_authentication_flow():
    """Test authentication workflow"""
    # Register
    register_data = {"email": "test@example.com", "password": "SecurePass123!"}
    response = await client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 201
    
    # Login
    login_data = {"email": "test@example.com", "password": "SecurePass123!"}
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    
    # Access protected endpoint
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/api/v1/assets", headers=headers)
    assert response.status_code == 200
    
    # Access without token
    response = await client.get("/api/v1/assets")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_rbac_authorization():
    """Test RBAC authorization"""
    # Admin can do everything
    admin_token = await get_token("admin@agency1.com")
    response = await client.post("/api/v1/assets", 
                                  json={"name": "Asset"}, 
                                  headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 201
    
    # Staff can only read
    staff_token = await get_token("staff@agency1.com")
    response = await client.post("/api/v1/assets", 
                                  json={"name": "Asset"}, 
                                  headers={"Authorization": f"Bearer {staff_token}"})
    assert response.status_code == 403
    
    # Staff can read
    response = await client.get("/api/v1/assets", 
                                 headers={"Authorization": f"Bearer {staff_token}"})
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_agency_data_isolation():
    """Test agency data isolation"""
    agency1_token = await get_token("user@agency1.com")
    agency2_token = await get_token("user@agency2.com")
    
    # Create asset in agency 1
    response = await client.post("/api/v1/assets", 
                                  json={"name": "Agency1 Asset"}, 
                                  headers={"Authorization": f"Bearer {agency1_token}"})
    asset1_id = response.json()["id"]
    
    # Agency 2 should not see agency 1's asset
    response = await client.get(f"/api/v1/assets/{asset1_id}", 
                                 headers={"Authorization": f"Bearer {agency2_token}"})
    assert response.status_code == 404  # Not found or forbidden

@pytest.mark.asyncio
async def test_depreciation_calculation_api():
    """Test depreciation calculation endpoint"""
    # Create asset
    asset_data = {
        "name": "Depreciation Test Asset",
        "purchase_price": 100000,
        "purchase_date": "2026-01-01",
        "useful_life_years": 5,
        "depreciation_method": "straight_line"
    }
    response = await client.post("/api/v1/assets", json=asset_data)
    asset_id = response.json()["id"]
    
    # Calculate depreciation
    response = await client.post(f"/api/v1/assets/{asset_id}/depreciation/calculate")
    assert response.status_code == 200
    assert "depreciation_records" in response.json()
    
    # Get depreciation report
    response = await client.get(f"/api/v1/assets/{asset_id}/depreciation/report")
    assert response.status_code == 200
    assert len(response.json()["records"]) > 0
```

#### 2.2 Database Integration Tests

**Test File:** `tests/integration/test_database.py`

```python
@pytest.mark.asyncio
async def test_database_transactions():
    """Test database transaction handling"""
    async with get_db() as session:
        try:
            asset = Asset(name="Test", purchase_price=10000)
            session.add(asset)
            await session.commit()
            assert asset.id is not None
        except Exception:
            await session.rollback()
            raise

@pytest.mark.asyncio
async def test_database_relationships():
    """Test database relationships"""
    async with get_db() as session:
        asset = Asset(name="Parent Asset", purchase_price=50000)
        session.add(asset)
        await session.commit()
        
        depreciation = DepreciationRecord(
            asset=asset,
            fiscal_year=2026,
            beginning_book_value=50000,
            depreciation_expense=10000
        )
        session.add(depreciation)
        await session.commit()
        
        # Verify relationship
        assert asset.depreciation_records[0].id == depreciation.id

@pytest.mark.asyncio
async def test_database_indexes():
    """Test database index performance"""
    # Create 1000 assets
    async with get_db() as session:
        for i in range(1000):
            asset = Asset(
                asset_code=f"AST-2026-{i:04d}",
                name=f"Asset {i}",
                purchase_price=10000
            )
            session.add(asset)
        await session.commit()
    
    # Query by indexed field
    start = time.time()
    async with get_db() as session:
        result = await session.execute(
            select(Asset).where(Asset.department == "IT")
        )
    end = time.time()
    assert (end - start) < 0.1  # Should be fast with index
```

---

### 3. E2E Tests

#### 3.1 User Workflow Tests

**Test File:** `tests/e2e/test_user_workflows.py`

**Test Cases:**

```python
@pytest.mark.asyncio
async def test_complete_asset_lifecycle():
    """Test complete asset lifecycle from creation to disposal"""
    # 1. Login as asset manager
    token = await get_token("manager@agency1.com")
    
    # 2. Create new asset
    asset_data = {
        "name": "Dell Server PowerEdge",
        "category": "Computer Equipment",
        "purchase_price": 150000,
        "purchase_date": "2026-01-15",
        "useful_life_years": 5
    }
    response = await client.post("/api/v1/assets", json=asset_data, 
                                  headers={"Authorization": f"Bearer {token}"})
    asset_id = response.json()["id"]
    
    # 3. Generate QR code
    response = await client.post(f"/api/v1/assets/{asset_id}/qr-generate", 
                                  headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "qr_code_path" in response.json()
    
    # 4. Record maintenance
    maintenance_data = {
        "title": "Annual Maintenance",
        "maintenance_type": "preventive",
        "scheduled_date": "2026-06-01",
        "priority": "medium"
    }
    response = await client.post(f"/api/v1/assets/{asset_id}/maintenance", 
                                  json=maintenance_data,
                                  headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    
    # 5. Calculate depreciation
    response = await client.post(f"/api/v1/assets/{asset_id}/depreciation/calculate", 
                                  headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    
    # 6. Transfer asset
    transfer_data = {
        "to_department": "Finance",
        "transfer_date": "2026-07-01",
        "reason": "Department restructuring"
    }
    response = await client.post(f"/api/v1/assets/{asset_id}/transfer", 
                                  json=transfer_data,
                                  headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    
    # 7. Dispose asset
    disposal_data = {
        "disposal_reason": "End of useful life",
        "disposal_date": "2031-01-15",
        "disposal_method": "auction"
    }
    response = await client.post(f"/api/v1/assets/{asset_id}/dispose", 
                                  json=disposal_data,
                                  headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    
    # 8. Verify asset status
    response = await client.get(f"/api/v1/assets/{asset_id}", 
                                 headers={"Authorization": f"Bearer {token}"})
    assert response.json()["status"] == "disposed"

@pytest.mark.asyncio
async def test_monthly_depreciation_report():
    """Test monthly depreciation report generation"""
    # Login
    token = await get_token("admin@agency1.com")
    
    # Create multiple assets
    for i in range(10):
        asset_data = {
            "name": f"Asset {i}",
            "purchase_price": 50000 + (i * 10000),
            "purchase_date": "2026-01-01",
            "useful_life_years": 5
        }
        await client.post("/api/v1/assets", json=asset_data, 
                          headers={"Authorization": f"Bearer {token}"})
    
    # Generate depreciation for all assets
    response = await client.post("/api/v1/depreciation/batch-calculate", 
                                  json={"fiscal_year": 2026, "fiscal_period": "monthly"},
                                  headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    
    # Get report
    response = await client.get("/api/v1/reports/depreciation/monthly?year=2026&month=3", 
                                 headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "total_depreciation" in response.json()
    assert "assets_count" in response.json()
    
    # Export to Excel
    response = await client.get("/api/v1/reports/depreciation/export?format=xlsx", 
                                 headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

@pytest.mark.asyncio
async def test_ai_maintenance_prediction():
    """Test AI maintenance prediction feature"""
    # Login
    token = await get_token("manager@agency1.com")
    
    # Create asset with maintenance history
    asset_data = {
        "name": "HVAC System",
        "category": "Building Equipment",
        "purchase_price": 200000,
        "purchase_date": "2024-01-01",
        "useful_life_years": 10
    }
    response = await client.post("/api/v1/assets", json=asset_data, 
                                  headers={"Authorization": f"Bearer {token}"})
    asset_id = response.json()["id"]
    
    # Add maintenance history
    for i in range(5):
        maintenance_data = {
            "title": f"Maintenance {i+1}",
            "maintenance_type": "corrective",
            "completed_date": f"2024-{(i+1)*2:02d}-01",
            "total_cost": 5000 + (i * 1000)
        }
        await client.post(f"/api/v1/assets/{asset_id}/maintenance", 
                          json=maintenance_data,
                          headers={"Authorization": f"Bearer {token}"})
    
    # Get AI prediction
    response = await client.get(f"/api/v1/assets/{asset_id}/maintenance/prediction", 
                                 headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert "predicted_maintenance_date" in response.json()
    assert "confidence_score" in response.json()
    assert response.json()["confidence_score"] > 0.7
```

---

### 4. Performance Tests

#### 4.1 Load Tests

**Test File:** `tests/performance/test_load.py`

```python
import pytest
from locust import HttpUser, task, between

class AssetSystemUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def get_assets(self):
        self.client.get("/api/v1/assets")
    
    @task(2)
    def get_asset_details(self):
        asset_id = random.randint(1, 1000)
        self.client.get(f"/api/v1/assets/{asset_id}")
    
    @task(1)
    def create_asset(self):
        self.client.post("/api/v1/assets", json={
            "name": "Test Asset",
            "purchase_price": 10000
        })

@pytest.mark.performance
async def test_concurrent_asset_queries():
    """Test system under concurrent load"""
    # Simulate 100 concurrent users querying assets
    tasks = []
    for i in range(100):
        task = client.get("/api/v1/assets")
        tasks.append(task)
    
    responses = await asyncio.gather(*tasks)
    assert all(r.status_code == 200 for r in responses)
    # Response time should be < 2s (NFR-001)

@pytest.mark.performance
async def test_large_dataset_performance():
    """Test performance with 10,000 assets"""
    # Setup: Create 10,000 assets
    async with get_db() as session:
        for i in range(10000):
            asset = Asset(
                asset_code=f"AST-2026-{i:05d}",
                name=f"Asset {i}",
                purchase_price=10000,
                department="IT"
            )
            session.add(asset)
        await session.commit()
    
    # Test: Query should complete in < 2s
    start = time.time()
    async with get_db() as session:
        result = await session.execute(
            select(Asset).where(Asset.department == "IT").limit(100)
        )
        assets = result.scalars().all()
    end = time.time()
    
    assert (end - start) < 2.0  # NFR-001 requirement
    assert len(assets) == 100
```

#### 4.2 Stress Tests

```python
@pytest.mark.performance
async def test_memory_usage_under_load():
    """Test memory usage under heavy load"""
    import tracemalloc
    tracemalloc.start()
    
    # Process 1000 asset creation requests
    for i in range(1000):
        asset_data = {
            "name": f"Bulk Asset {i}",
            "purchase_price": 10000
        }
        await client.post("/api/v1/assets", json=asset_data)
    
    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    
    # Peak memory should be < 500MB
    assert peak < 500 * 1024 * 1024

@pytest.mark.performance
async def test_database_connection_pool():
    """Test database connection pool under load"""
    # Simulate 500 concurrent database operations
    tasks = []
    for i in range(500):
        task = get_db_session()
        tasks.append(task)
    
    sessions = await asyncio.gather(*tasks)
    
    # All sessions should be created successfully
    assert len(sessions) == 500
    
    # Cleanup
    for session in sessions:
        await session.close()
```

---

### 5. Security Tests

#### 5.1 OWASP Top 10 Tests

**Test File:** `tests/security/test_owasp.py`

```python
@pytest.mark.security
async def test_sql_injection_prevention():
    """Test SQL injection prevention"""
    token = await get_token("admin@agency1.com")
    
    # SQL injection attempt in asset code
    malicious_input = "AST-2026-001'; DROP TABLE assets; --"
    response = await client.get(f"/api/v1/assets?asset_code={malicious_input}", 
                                 headers={"Authorization": f"Bearer {token}"})
    
    # Should not error, should return empty or sanitized results
    assert response.status_code == 200
    
    # Verify table still exists
    async with get_db() as session:
        result = await session.execute(select(Asset).limit(1))
        assert result.scalar() is not None

@pytest.mark.security
async def test_xss_prevention():
    """Test XSS prevention"""
    token = await get_token("admin@agency1.com")
    
    # XSS payload in asset name
    xss_payload = "<script>alert('XSS')</script>"
    asset_data = {"name": xss_payload, "purchase_price": 10000}
    
    response = await client.post("/api/v1/assets", json=asset_data, 
                                  headers={"Authorization": f"Bearer {token}"})
    asset_name = response.json()["name"]
    
    # Should be sanitized
    assert "<script>" not in asset_name
    assert "&lt;script&gt;" in asset_name  # HTML escaped

@pytest.mark.security
async def test_csrf_protection():
    """Test CSRF protection"""
    # Try to create asset without CSRF token
    asset_data = {"name": "CSRF Test", "purchase_price": 10000}
    response = await client.post("/api/v1/assets", json=asset_data)
    
    # Should be rejected (403 or 401)
    assert response.status_code in [401, 403]

@pytest.mark.security
async def test_authentication_bypass():
    """Test authentication bypass prevention"""
    # Try to access protected endpoint without token
    response = await client.get("/api/v1/assets")
    assert response.status_code == 401
    
    # Try with invalid token
    headers = {"Authorization": "Bearer invalid_token"}
    response = await client.get("/api/v1/assets", headers=headers)
    assert response.status_code == 401
    
    # Try with expired token
    expired_token = create_access_token({"sub": "user"}, 
                                         expires_delta=timedelta(minutes=-10))
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = await client.get("/api/v1/assets", headers=headers)
    assert response.status_code == 401

@pytest.mark.security
async def test_privilege_escalation():
    """Test privilege escalation prevention"""
    staff_token = await get_token("staff@agency1.com")
    
    # Staff trying to access admin endpoint
    response = await client.post("/api/v1/users/create", 
                                  json={"email": "new@example.com"}, 
                                  headers={"Authorization": f"Bearer {staff_token}"})
    assert response.status_code == 403
    
    # Staff trying to delete asset
    response = await client.delete("/api/v1/assets/1", 
                                    headers={"Authorization": f"Bearer {staff_token}"})
    assert response.status_code == 403

@pytest.mark.security
async def test_data_isolation_bypass():
    """Test data isolation bypass prevention"""
    agency1_token = await get_token("user@agency1.com")
    
    # Try to access another agency's asset by guessing ID
    response = await client.get("/api/v1/assets/99999", 
                                 headers={"Authorization": f"Bearer {agency1_token}"})
    
    # Should return 404 (not found) or 403 (forbidden), not 200
    assert response.status_code in [403, 404]

@pytest.mark.security
async def test_rate_limiting():
    """Test rate limiting"""
    # Try 10 login attempts in 1 minute
    for i in range(10):
        response = await client.post("/api/v1/auth/login", 
                                      json={"email": "test@example.com", "password": "wrong"})
    
    # Should be rate limited
    assert response.status_code == 429  # Too Many Requests

@pytest.mark.security
async def test_password_brute_force():
    """Test brute force protection"""
    # Try 20 login attempts with different passwords
    for i in range(20):
        response = await client.post("/api/v1/auth/login", 
                                      json={"email": "admin@example.com", "password": f"attempt{i}"})
    
    # Account should be locked
    response = await client.post("/api/v1/auth/login", 
                                  json={"email": "admin@example.com", "password": "correct"})
    assert response.status_code == 423  # Locked
```

#### 5.2 Security Compliance Tests

```python
@pytest.mark.security
async def test_audit_logging():
    """Test audit logging functionality"""
    admin_token = await get_token("admin@agency1.com")
    
    # Create asset (should be logged)
    asset_data = {"name": "Audit Test Asset", "purchase_price": 10000}
    response = await client.post("/api/v1/assets", json=asset_data, 
                                  headers={"Authorization": f"Bearer {admin_token}"})
    
    # Check audit log
    response = await client.get("/api/v1/audit-logs?resource_type=asset", 
                                 headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 200
    assert len(response.json()["logs"]) > 0
    assert response.json()["logs"][0]["action"] == "create"
    assert response.json()["logs"][0]["user_email"] == "admin@agency1.com"

@pytest.mark.security
async def test_sensitive_data_encryption():
    """Test sensitive data encryption"""
    async with get_db() as session:
        user = User(email="test@example.com", password="SecurePass123!")
        session.add(user)
        await session.commit()
        
        # Password should be hashed
        assert user.hashed_password != "SecurePass123!"
        assert len(user.hashed_password) > 60  # bcrypt hash length

@pytest.mark.security
async def test_secure_headers():
    """Test security headers"""
    response = await client.get("/api/v1/assets")
    
    # Check security headers
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("Strict-Transport-Security") is not None
    assert response.headers.get("Content-Security-Policy") is not None
```

---

## 📊 Test Coverage Report

### Coverage Targets by Component

| Component | Files | Target Coverage | Priority |
|-----------|-------|-----------------|----------|
| **Models** | 5 | 90% | 🔴 Critical |
| - asset.py | 1 | 90% | 🔴 |
| - depreciation.py | 1 | 90% | 🔴 |
| - maintenance.py | 1 | 90% | 🔴 |
| - user.py | 1 | 95% | 🔴 |
| - audit_log.py | 1 | 95% | 🔴 |
| **Services** | 5 | 85% | 🔴 Critical |
| - depreciation_service.py | 1 | 90% | 🔴 |
| - asset_service.py | 1 | 85% | 🔴 |
| - auth_service.py | 1 | 95% | 🔴 |
| - qr_service.py | 1 | 85% | 🟠 |
| - ai_service.py | 1 | 80% | 🟡 |
| **API Routes** | 8 | 85% | 🔴 Critical |
| - assets.py | 1 | 85% | 🔴 |
| - depreciation.py | 1 | 85% | 🔴 |
| - maintenance.py | 1 | 85% | 🔴 |
| - auth.py | 1 | 95% | 🔴 |
| - users.py | 1 | 85% | 🟠 |
| - reports.py | 1 | 80% | 🟡 |
| - qr.py | 1 | 80% | 🟡 |
| - ai.py | 1 | 75% | 🟡 |
| **Security** | 4 | 95% | 🔴 Critical |
| - security.py | 1 | 95% | 🔴 |
| - permissions.py | 1 | 95% | 🔴 |
| - middleware.py | 1 | 90% | 🟠 |
| - validators.py | 1 | 90% | 🟠 |
| **Frontend** | TBD | 80% | 🟠 High |
| - Components | TBD | 80% | 🟠 |
| - Pages | TBD | 75% | 🟡 |
| - Utils | TBD | 85% | 🟡 |

**Overall Target:** 85%+ coverage

---

## 🧪 Test Execution Strategy

### Phase 1: Unit Tests (Week 1)
```bash
# Run all unit tests
pytest tests/unit/ -v --cov=backend/app --cov-report=html

# Target: 70% coverage
```

### Phase 2: Integration Tests (Week 2)
```bash
# Run integration tests
pytest tests/integration/ -v --cov=backend/app --cov-append

# Target: 80% coverage
```

### Phase 3: E2E Tests (Week 2)
```bash
# Run E2E tests
pytest tests/e2e/ -v --cov=backend/app --cov-append

# Target: 82% coverage
```

### Phase 4: Performance Tests (Week 3)
```bash
# Run performance tests
pytest tests/performance/ -v -m performance

# Target: Meet NFR-001 (< 2s response)
```

### Phase 5: Security Tests (Week 3)
```bash
# Run security tests
pytest tests/security/ -v -m security

# Target: All OWASP Top 10 tests pass
```

---

## 📈 Test Metrics & Reporting

### Coverage Report Generation
```bash
# Generate HTML coverage report
pytest --cov=backend/app --cov-report=html

# Generate XML for CI/CD
pytest --cov=backend/app --cov-report=xml

# Fail if coverage < 80%
pytest --cov=backend/app --cov-fail-under=80
```

### Test Results Dashboard

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Unit Tests Pass Rate | 100% | 0% | ⏳ Pending |
| Integration Tests Pass Rate | 100% | 0% | ⏳ Pending |
| E2E Tests Pass Rate | 100% | 0% | ⏳ Pending |
| Performance Tests Pass Rate | 100% | 0% | ⏳ Pending |
| Security Tests Pass Rate | 100% | 0% | ⏳ Pending |
| Code Coverage | 80%+ | 0% | ⏳ Pending |

---

## ✅ Test Acceptance Criteria

### Definition of Done for Testing

- [ ] Unit tests coverage >= 80%
- [ ] All critical paths tested (auth, CRUD, depreciation)
- [ ] All security tests pass (OWASP Top 10)
- [ ] Performance tests meet NFR requirements (< 2s response)
- [ ] E2E tests cover all user workflows
- [ ] Integration tests cover all API endpoints
- [ ] CI/CD pipeline runs tests on every commit
- [ ] Test documentation complete
- [ ] Mock data/fixtures available
- [ ] Test environment isolated from production

---

## 🛠️ Test Infrastructure Setup

### Required Tools
```
pytest==7.4.0
pytest-asyncio==0.21.0
pytest-cov==4.1.0
httpx==0.24.0  # For API testing
factory-boy==3.3.0  # For test fixtures
faker==20.0.0  # For test data generation
locust==2.17.0  # For load testing
bandit==1.7.5  # For security linting
safety==2.3.5  # For dependency scanning
```

### Test Fixtures
```python
# conftest.py
import pytest
from app.core.database import get_db
from app.models.user import User
from app.core.security import get_password_hash

@pytest.fixture
async def db_session():
    """Create test database session"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with async_session_maker() as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def test_user(db_session):
    """Create test user"""
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("SecurePass123!"),
        role="admin",
        agency_id=1
    )
    db_session.add(user)
    await db_session.commit()
    return user

@pytest.fixture
async def test_asset(db_session, test_user):
    """Create test asset"""
    asset = Asset(
        asset_code="AST-TEST-001",
        name="Test Asset",
        purchase_price=10000,
        agency_id=test_user.agency_id
    )
    db_session.add(asset)
    await db_session.commit()
    return asset
```

---

## 📝 Next Steps

### Immediate Actions
1. **สร้าง test directory structure:**
   ```
   tests/
   ├── unit/
   │   ├── models/
   │   ├── services/
   │   └── security/
   ├── integration/
   │   ├── test_api.py
   │   └── test_database.py
   ├── e2e/
   │   └── test_user_workflows.py
   ├── performance/
   │   └── test_load.py
   └── security/
       └── test_owasp.py
   ```

2. **สร้าง conftest.py:** Test fixtures และ configuration

3. **สร้าง requirements-test.txt:** Test dependencies

4. **สร้าง pytest.ini:** Test configuration

### After Core Implementation
1. เขียน unit tests สำหรับ models
2. เขียน unit tests สำหรับ services
2. เขียน integration tests สำหรับ APIs
3. เขียน E2E tests สำหรับ user workflows
4. เขียน security tests สำหรับ OWASP Top 10
5. เขียน performance tests สำหรับ load testing

---

**จัดทำโดย:** Test Case Designer Team  
**สถานะ:** ⏳ Waiting for core implementation  
**Target Coverage:** 80%+  
**Estimated Effort:** 2-3 weeks (หลัง development เสร็จ)
