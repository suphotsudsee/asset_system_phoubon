from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.asset_service import AssetService
from app.core.security import get_current_user
import qrcode
import io
import base64
from pathlib import Path

router = APIRouter(prefix="/qr", tags=["QR Codes"])


def generate_qr_code(data: str) -> bytes:
    """Generate QR code as PNG bytes."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


@router.get("/{asset_id}")
async def get_qr_code(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get QR code for an asset as PNG image."""
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Generate QR with asset code
    qr_data = f"ASSET:{asset.asset_code}"
    qr_bytes = generate_qr_code(qr_data)
    
    return Response(
        content=qr_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename={asset.asset_code}_qr.png"}
    )


@router.get("/{asset_id}/base64")
async def get_qr_code_base64(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get QR code as base64 string for embedding."""
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    qr_data = f"ASSET:{asset.asset_code}"
    qr_bytes = generate_qr_code(qr_data)
    qr_base64 = base64.b64encode(qr_bytes).decode('utf-8')
    
    return {
        "asset_id": asset_id,
        "asset_code": asset.asset_code,
        "qr_base64": qr_base64,
        "data_uri": f"data:image/png;base64,{qr_base64}",
    }


@router.get("/{asset_id}/data")
async def get_qr_data(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get QR code data content for an asset."""
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {
        "asset_id": asset_id,
        "asset_code": asset.asset_code,
        "qr_content": f"ASSET:{asset.asset_code}",
        "asset_name": asset.name,
        "category": asset.category,
        "department": asset.department,
    }
