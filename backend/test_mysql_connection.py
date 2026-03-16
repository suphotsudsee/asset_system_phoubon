"""
Test MySQL connection and verify tables
"""

import asyncio
from aiomysql import create_pool

async def test_connection():
    """Test MySQL connection"""
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
                # Show tables
                await cursor.execute("SHOW TABLES")
                result = await cursor.fetchone()
                tables = result if isinstance(result, tuple) else ()
                
                if tables:
                    print("Tables in asset_db:")
                    # Re-execute to get all tables
                    await cursor.execute("SHOW TABLES")
                    all_tables = await cursor.fetchall()
                    for table in all_tables:
                        print(f"  - {table[0]}")
                else:
                    print("No tables found.")
                
                # Count rows
                await cursor.execute("SELECT COUNT(*) FROM users")
                result = await cursor.fetchone()
                print(f"\nUsers: {result[0]} rows")
        
        pool.close()
        print("\nConnection test successful!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(test_connection())
