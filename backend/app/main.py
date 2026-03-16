from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import get_settings
from app.core.migrations import reconcile_mysql_schema
from app.core.seed import seed_reference_data
from app.core.database import engine, Base, async_session_maker
from app.api import assets, depreciation, maintenance, qr, auth, ai, categories, departments, users
from app.core.security import get_password_hash
from app.models.user import User
from sqlalchemy import select
from app import models  # noqa: F401

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup: Create database tables
    logger.info("Starting up - creating database tables")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await reconcile_mysql_schema(conn)
    
    # Create default admin user if not exists
    async with async_session_maker() as session:
        query = select(User).filter(User.username == "admin")
        result = await session.execute(query)
        admin = result.scalar_one_or_none()

        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                full_name="System Administrator",
                role="admin",
                is_superuser=True,
                hashed_password=get_password_hash("admin123"),
            )
            session.add(admin)
            await session.commit()
            logger.info("Created default admin user (username: admin, password: admin123)")

    async with async_session_maker() as session:
        await seed_reference_data(session)
        logger.info("Seeded reference data")
    
    yield
    
    # Shutdown
    logger.info("Shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Asset Management System with QR code tracking, depreciation calculation, and AI-powered maintenance prediction",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Include routers
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(assets.router, prefix=API_PREFIX)
app.include_router(depreciation.router, prefix=API_PREFIX)
app.include_router(maintenance.router, prefix=API_PREFIX)
app.include_router(qr.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(categories.router, prefix=API_PREFIX)
app.include_router(departments.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)


@app.get("/")
async def root():
    """Root endpoint - API info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.APP_VERSION}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
