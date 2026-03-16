"""
Import schema.sql to MySQL - Execute each CREATE TABLE separately
"""

import asyncio
from aiomysql import create_pool

async def import_schema():
    """Create tables from schema.sql"""
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
        
        # Read schema file
        with open('sql/schema.sql', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract CREATE TABLE statements
        import re
        create_tables = re.findall(r'CREATE TABLE[^;]+;', content, re.IGNORECASE)
        
        print(f"Found {len(create_tables)} CREATE TABLE statements")
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                for i, stmt in enumerate(create_tables, 1):
                    try:
                        await cursor.execute(stmt)
                        # Extract table name
                        match = re.search(r'CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?', stmt, re.IGNORECASE)
                        if match:
                            print(f"  [{i}] Created: {match.group(1)}")
                        else:
                            print(f"  [{i}] Executed")
                    except Exception as e:
                        print(f"  [{i}] Warning: {e}")
                
                await conn.commit()
                print("\nSchema imported!")
                
                # Verify tables
                await cursor.execute("SHOW TABLES")
                tables = await cursor.fetchall()
                print(f"\nTables in asset_db: {len(tables)}")
                for table in tables:
                    print(f"  - {table[0]}")
        
        pool.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(import_schema())
