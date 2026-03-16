"""
Verify MySQL data
"""

import asyncio
from aiomysql import create_pool

async def verify_data():
    """Check data in MySQL"""
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
                # Count tables
                tables = ['users', 'asset_categories', 'assets', 'maintenance_records', 'depreciation_records']
                
                print("Data in MySQL:")
                for table in tables:
                    await cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    result = await cursor.fetchone()
                    print(f"  {table}: {result[0]} rows")
                
                # Show sample data
                print("\nSample data:")
                
                # Users
                await cursor.execute("SELECT id, username, email, role FROM users")
                users = await cursor.fetchall()
                print(f"\nUsers ({len(users)}):")
                for u in users:
                    print(f"  {u[0]}. {u[1]} ({u[3]})")
                
                # Assets
                await cursor.execute("SELECT id, asset_code, name, category_id, status FROM assets")
                assets = await cursor.fetchall()
                print(f"\nAssets ({len(assets)}):")
                for a in assets:
                    print(f"  {a[0]}. {a[1]} - {a[2]} (status: {a[3]})")
        
        pool.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(verify_data())
