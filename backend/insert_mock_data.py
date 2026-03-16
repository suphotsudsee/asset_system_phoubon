"""
Insert mock data into MySQL
"""

import asyncio
from aiomysql import create_pool
import bcrypt

async def insert_mock_data():
    """Insert sample data"""
    try:
        pool = await create_pool(
            host='localhost',
            port=3333,
            user='root',
            password='123456',
            db='asset_db',
            charset='utf8mb4',
            minsize=1,
            maxsize=1
        )
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Hash password for admin
                hashed_pw = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                
                # Insert admin user
                await cursor.execute("""
                    INSERT INTO users (username, email, hashed_password, full_name, role, is_active)
                    VALUES ('admin', 'admin@example.com', %s, 'System Administrator', 'admin', TRUE)
                """, (hashed_pw,))
                print("Inserted admin user")
                
                # Insert categories
                categories = [
                    ('คอมพิวเตอร์', 'CAT-001', 'คอมพิวเตอร์และอุปกรณ์ที่เกี่ยวข้อง'),
                    ('เครื่องพิมพ์', 'CAT-002', 'เครื่องพิมพ์และอุปกรณ์พิมพ์'),
                    ('เฟอร์นิเจอร์', 'CAT-003', 'โต๊ะ เก้าอี้ และเฟอร์นิเจอร์สำนักงาน'),
                    ('เครื่องใช้ไฟฟ้า', 'CAT-004', 'เครื่องใช้ไฟฟ้าต่างๆ'),
                    ('ยานพาหนะ', 'CAT-005', 'รถยนต์ รถจักรยานยนต์'),
                    ('อุปกรณ์สำนักงาน', 'CAT-006', 'อุปกรณ์สำนักงานทั่วไป'),
                ]
                
                for cat in categories:
                    await cursor.execute("""
                        INSERT INTO asset_categories (name, code, description)
                        VALUES (%s, %s, %s)
                    """, cat)
                print(f"Inserted {len(categories)} categories")
                
                # Insert assets
                assets = [
                    ('AST-2024-001', 'คอมพิวเตอร์ Dell OptiPlex', 'DPX123456', 1, 'IT', 'ห้อง 101', 'good', 'active', '2024-01-15', 25000.00, 5, 'straight_line', 'คอมพิวเตอร์สำนักงานสำหรับพนักงาน IT'),
                    ('AST-2024-002', 'เครื่องพิมพ์ Canon', 'CN789012', 2, 'Admin', 'ห้อง 102', 'excellent', 'active', '2024-02-01', 15000.00, 3, 'straight_line', 'เครื่องพิมพ์เลเซอร์สำหรับเอกสาร'),
                    ('AST-2024-003', 'โต๊ะทำงาน', 'DSK345678', 3, 'HR', 'ห้อง 201', 'good', 'active', '2024-01-20', 8000.00, 10, 'straight_line', 'โต๊ะทำงานไม้ขนาด 120x60 ซม.'),
                    ('AST-2024-004', 'เก้าอี้สำนักงาน', 'CHR901234', 3, 'Finance', 'ห้อง 301', 'fair', 'inactive', '2024-03-01', 5000.00, 7, 'straight_line', 'เก้าอี้สำนักงานปรับระดับได้'),
                    ('AST-2024-005', 'เครื่องปรับอากาศ', 'AC567890', 4, 'IT', 'ห้อง 101', 'excellent', 'active', '2024-02-15', 12000.00, 8, 'straight_line', 'เครื่องปรับอากาศ 12000 BTU'),
                ]
                
                for asset in assets:
                    await cursor.execute("""
                        INSERT INTO assets (asset_code, name, serial_number, category_id, department, location, asset_condition, status, purchase_date, purchase_price, useful_life_years, depreciation_method, description)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, asset)
                print(f"Inserted {len(assets)} assets")
                
                # Insert maintenance records
                maintenance = [
                    (1, 'Regular maintenance check', 'preventive', 'pending', 'medium', '2024-03-20', 'John Doe', 500.00, 'ตรวจสอบระบบเป็นประจำ'),
                    (2, 'Paper jam fix', 'corrective', 'completed', 'low', '2024-03-15', 'Jane Smith', 300.00, 'แก้ไขปัญหากระดาษติด'),
                    (5, 'Filter cleaning', 'preventive', 'in_progress', 'medium', '2024-03-18', 'Bob Wilson', 200.00, 'ทำความสะอาดฟิลเตอร์'),
                ]
                
                for m in maintenance:
                    await cursor.execute("""
                        INSERT INTO maintenance_records (asset_id, title, maintenance_type, status, priority, scheduled_date, technician, cost, description)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, m)
                print(f"Inserted {len(maintenance)} maintenance records")
                
                # Insert depreciation records
                depreciation = [
                    (1, 2024, 25000.00, 5000.00, 5000.00, 20000.00),
                    (1, 2025, 20000.00, 5000.00, 10000.00, 15000.00),
                    (2, 2024, 15000.00, 5000.00, 5000.00, 10000.00),
                ]
                
                for d in depreciation:
                    await cursor.execute("""
                        INSERT INTO depreciation_records (asset_id, fiscal_year, beginning_book_value, depreciation_expense, accumulated_depreciation, ending_book_value)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, d)
                print(f"Inserted {len(depreciation)} depreciation records")
                
                await conn.commit()
                print("\nMock data inserted successfully!")
        
        pool.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(insert_mock_data())
