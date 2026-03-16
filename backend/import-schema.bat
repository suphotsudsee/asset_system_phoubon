@echo off
echo Importing schema.sql to MySQL...
echo Database: asset_db
echo Host: localhost:3333
echo.

python -c "import asyncio; from aiomysql import create_pool; asyncio.run(import_schema())"

pause
