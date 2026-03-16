"""
Migrate data from SQLite to MySQL
Usage: python migrate_sqlite_to_mysql.py
"""

import sqlite3
import asyncio
from aiomysql import create_pool
from datetime import datetime

# SQLite path
SQLITE_DB = 'asset_db.sqlite'

# MySQL config
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3333,
    'user': 'root',
    'password': '123456',
    'db': 'asset_db',
    'charset': 'utf8mb4'
}

def read_sqlite_data():
    """Read all data from SQLite"""
    conn = sqlite3.connect(SQLITE_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    data = {
        'users': [],
        'asset_categories': [],
        'assets': [],
        'maintenance_records': [],
        'depreciation_records': [],
    }
    
    try:
        # Read users
        cursor.execute("SELECT * FROM users")
        data['users'] = [dict(row) for row in cursor.fetchall()]
        
        # Read categories
        cursor.execute("SELECT * FROM asset_categories")
        data['asset_categories'] = [dict(row) for row in cursor.fetchall()]
        
        # Read assets
        cursor.execute("SELECT * FROM assets")
        data['assets'] = [dict(row) for row in cursor.fetchall()]
        
        # Read maintenance
        cursor.execute("SELECT * FROM maintenance_records")
        data['maintenance_records'] = [dict(row) for row in cursor.fetchall()]
        
        # Read depreciation
        cursor.execute("SELECT * FROM depreciation_records")
        data['depreciation_records'] = [dict(row) for row in cursor.fetchall()]
        
        print("Read from SQLite:")
        print(f"  - Users: {len(data['users'])} rows")
        print(f"  - Categories: {len(data['asset_categories'])} rows")
        print(f"  - Assets: {len(data['assets'])} rows")
        print(f"  - Maintenance: {len(data['maintenance_records'])} rows")
        print(f"  - Depreciation: {len(data['depreciation_records'])} rows")
        
    except Exception as e:
        print(f"Error reading SQLite: {e}")
    finally:
        conn.close()
    
    return data

async def insert_to_mysql(data):
    """Insert data to MySQL"""
    pool = await create_pool(**MYSQL_CONFIG, minsize=1, maxsize=5)
    
    async with pool.acquire() as conn:
        async with conn.cursor() as cursor:
            try:
                # Insert users
                if data['users']:
                    await cursor.execute("DELETE FROM users WHERE 1=1")
                    for user in data['users']:
                        await cursor.execute("""
                            INSERT INTO users (id, username, email, hashed_password, full_name, role, agency_id, is_active)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """, (user['id'], user['username'], user['email'], user['hashed_password'], 
                              user.get('full_name'), user['role'], user.get('agency_id'), user['is_active']))
                    print(f"Inserted {len(data['users'])} users")
                
                # Insert categories
                if data['asset_categories']:
                    await cursor.execute("DELETE FROM asset_categories WHERE 1=1")
                    for cat in data['asset_categories']:
                        await cursor.execute("""
                            INSERT INTO asset_categories (id, name, code, description)
                            VALUES (%s, %s, %s, %s)
                        """, (cat['id'], cat['name'], cat['code'], cat.get('description')))
                    print(f"Inserted {len(data['asset_categories'])} categories")
                
                # Insert assets
                if data['assets']:
                    await cursor.execute("DELETE FROM assets WHERE 1=1")
                    for asset in data['assets']:
                        await cursor.execute("""
                            INSERT INTO assets (id, asset_code, name, serial_number, category_id, department, location, condition, status, purchase_date, purchase_price, useful_life_years, depreciation_method, description)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (asset['id'], asset['asset_code'], asset['name'], asset.get('serial_number'),
                              asset.get('category_id'), asset.get('department'), asset.get('location'),
                              asset.get('condition', 'good'), asset.get('status', 'active'),
                              asset.get('purchase_date'), asset.get('purchase_price', 0),
                              asset.get('useful_life_years', 5), asset.get('depreciation_method', 'straight_line'),
                              asset.get('description')))
                    print(f"Inserted {len(data['assets'])} assets")
                
                # Insert maintenance
                if data['maintenance_records']:
                    await cursor.execute("DELETE FROM maintenance_records WHERE 1=1")
                    for record in data['maintenance_records']:
                        await cursor.execute("""
                            INSERT INTO maintenance_records (id, asset_id, title, maintenance_type, status, priority, scheduled_date, technician, cost, description)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (record['id'], record['asset_id'], record['title'],
                              record['maintenance_type'], record['status'], record.get('priority', 'medium'),
                              record.get('scheduled_date'), record.get('technician'),
                              record.get('cost', 0), record.get('description')))
                    print(f"Inserted {len(data['maintenance_records'])} maintenance records")
                
                # Insert depreciation
                if data['depreciation_records']:
                    await cursor.execute("DELETE FROM depreciation_records WHERE 1=1")
                    for record in data['depreciation_records']:
                        await cursor.execute("""
                            INSERT INTO depreciation_records (id, asset_id, fiscal_year, beginning_book_value, depreciation_expense, accumulated_depreciation, ending_book_value)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """, (record['id'], record['asset_id'], record['fiscal_year'],
                              record['beginning_book_value'], record['depreciation_expense'],
                              record['accumulated_depreciation'], record['ending_book_value']))
                    print(f"Inserted {len(data['depreciation_records'])} depreciation records")
                
                await conn.commit()
                print("\nMigration completed successfully!")
                
            except Exception as e:
                await conn.rollback()
                print(f"Error inserting to MySQL: {e}")
                raise
            finally:
                await cursor.close()
    
    await pool.close()

async def main():
    print("Starting migration from SQLite to MySQL...")
    print(f"MySQL: {MYSQL_CONFIG['host']}:{MYSQL_CONFIG['port']}/{MYSQL_CONFIG['db']}")
    print(f"SQLite: {SQLITE_DB}")
    print()
    
    # Read SQLite data
    data = read_sqlite_data()
    
    # Insert to MySQL
    await insert_to_mysql(data)
    
    print("\nMigration finished!")

if __name__ == '__main__':
    asyncio.run(main())
