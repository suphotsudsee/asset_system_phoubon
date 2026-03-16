"""
Fix users table schema - add missing columns
"""

import asyncio
from aiomysql import create_pool

async def fix_schema():
    """Add missing columns to users table"""
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
                # Add missing columns
                columns_to_add = [
                    ('department', 'VARCHAR(100)'),
                    ('position', 'VARCHAR(100)'),
                    ('phone', 'VARCHAR(20)'),
                    ('is_superuser', 'BOOLEAN DEFAULT FALSE'),
                    ('permissions', 'TEXT'),
                    ('last_login', 'TIMESTAMP NULL'),
                ]
                
                for col_name, col_type in columns_to_add:
                    try:
                        await cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                        print(f"Added column: {col_name}")
                    except Exception as e:
                        if 'Duplicate' in str(e):
                            print(f"Column {col_name} already exists")
                        else:
                            print(f"Error adding {col_name}: {e}")
                
                await conn.commit()
                
                # Verify
                await cursor.execute("DESCRIBE users")
                columns = await cursor.fetchall()
                print(f"\nUsers table has {len(columns)} columns:")
                for col in columns:
                    print(f"  - {col[0]}: {col[1]}")
        
        pool.close()
        print("\nSchema fixed!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(fix_schema())
