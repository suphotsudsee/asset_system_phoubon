from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection


async def _column_exists(conn: AsyncConnection, table_name: str, column_name: str) -> bool:
    query = text(
        """
        SELECT 1
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = :table_name
          AND COLUMN_NAME = :column_name
        LIMIT 1
        """
    )
    result = await conn.execute(query, {"table_name": table_name, "column_name": column_name})
    return result.scalar_one_or_none() is not None


async def _index_exists(conn: AsyncConnection, table_name: str, index_name: str) -> bool:
    query = text(
        """
        SELECT 1
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = :table_name
          AND INDEX_NAME = :index_name
        LIMIT 1
        """
    )
    result = await conn.execute(query, {"table_name": table_name, "index_name": index_name})
    return result.scalar_one_or_none() is not None


async def reconcile_mysql_schema(conn: AsyncConnection) -> None:
    """Apply minimal schema fixes for legacy MySQL tables used by the app."""
    if conn.dialect.name != "mysql":
        return

    if await _column_exists(conn, "assets", "asset_condition") and not await _column_exists(conn, "assets", "condition"):
        await conn.execute(text("ALTER TABLE assets CHANGE COLUMN asset_condition `condition` VARCHAR(50) NULL"))

    if not await _column_exists(conn, "assets", "category"):
        await conn.execute(text("ALTER TABLE assets ADD COLUMN category VARCHAR(100) NULL"))
    if not await _index_exists(conn, "assets", "ix_assets_category"):
        await conn.execute(text("CREATE INDEX ix_assets_category ON assets (category)"))

    if not await _column_exists(conn, "assets", "agency_id"):
        await conn.execute(text("ALTER TABLE assets ADD COLUMN agency_id INT NULL"))

    if not await _column_exists(conn, "assets", "salvage_value"):
        await conn.execute(text("ALTER TABLE assets ADD COLUMN salvage_value DOUBLE NOT NULL DEFAULT 0"))

    if not await _column_exists(conn, "assets", "useful_life_years"):
        await conn.execute(text("ALTER TABLE assets ADD COLUMN useful_life_years INT NOT NULL DEFAULT 5"))

    if not await _column_exists(conn, "assets", "depreciation_method"):
        await conn.execute(
            text("ALTER TABLE assets ADD COLUMN depreciation_method VARCHAR(50) NOT NULL DEFAULT 'straight_line'")
        )

    if not await _column_exists(conn, "assets", "serial_number"):
        await conn.execute(text("ALTER TABLE assets ADD COLUMN serial_number VARCHAR(100) NULL"))

    if not await _column_exists(conn, "assets", "location"):
        await conn.execute(text("ALTER TABLE assets ADD COLUMN location VARCHAR(200) NULL"))

    if not await _column_exists(conn, "assets", "qr_code_path"):
        await conn.execute(text("ALTER TABLE assets ADD COLUMN qr_code_path VARCHAR(500) NULL"))
