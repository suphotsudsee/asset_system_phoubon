from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.ai.alerts import alert_system
from app.schemas.maintenance import MaintenanceAlert
from app.services.asset_service import AssetService
from app.services.maintenance_service import MaintenanceService

router = APIRouter(prefix="/ai", tags=["AI Predictions"])


@router.get("/alerts", response_model=List[MaintenanceAlert])
async def get_maintenance_alerts(
    days_ahead: int = Query(90, ge=1, le=365),
    min_confidence: float = Query(0.6, ge=0.0, le=1.0),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get AI-generated maintenance alerts for assets.
    Returns list of predicted maintenance needs with confidence scores.
    """
    alerts = await alert_system.generate_alerts(
        days_ahead=days_ahead,
        min_confidence=min_confidence
    )
    return alerts


@router.get("/alerts/summary")
async def get_alert_summary(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get summary of all current AI alerts."""
    summary = await alert_system.get_alert_summary()
    return summary


@router.get("/alerts/critical", response_model=List[MaintenanceAlert])
async def get_critical_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get high-priority critical alerts (confidence > 0.8, within 30 days)."""
    alerts = await alert_system.get_critical_alerts()
    return alerts


@router.post("/alerts/{asset_id}/create-maintenance")
async def create_predicted_maintenance(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a maintenance record from AI prediction for a specific asset.
    """
    if "create" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Get asset
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Get maintenance history
    maintenance_history = await MaintenanceService.get_maintenance_records(
        asset_id=asset_id,
        limit=100
    )
    
    # Generate prediction
    from app.ai.prediction import MaintenancePredictor
    predictor = MaintenancePredictor()
    prediction = predictor.predict_failure_date(asset, maintenance_history)
    
    if not prediction:
        raise HTTPException(status_code=400, detail="Unable to generate prediction")
    
    # Create alert
    alert = MaintenanceAlert(
        asset_id=asset_id,
        asset_name=asset.name,
        predicted_failure_date=prediction["predicted_date"],
        confidence=prediction["confidence"],
        recommended_action=prediction["recommended_action"],
        estimated_cost=prediction["estimated_cost"],
    )
    
    # Create maintenance record
    record = await alert_system.create_predicted_maintenance_record(
        alert=alert,
        technician_name=current_user.get("username")
    )
    
    if not record:
        raise HTTPException(status_code=500, detail="Failed to create maintenance record")
    
    return {
        "message": "Predictive maintenance record created",
        "record_id": record.id,
        "prediction_confidence": prediction["confidence"],
        "scheduled_date": record.scheduled_date,
    }


@router.get("/predictions/{asset_id}")
async def get_asset_prediction(
    asset_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get AI prediction for a specific asset."""
    # Get asset
    asset = await AssetService.get_asset_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Get maintenance history
    maintenance_history = await MaintenanceService.get_maintenance_records(
        asset_id=asset_id,
        limit=100
    )
    
    # Generate prediction
    from app.ai.prediction import MaintenancePredictor
    predictor = MaintenancePredictor()
    prediction = predictor.predict_failure_date(asset, maintenance_history)
    
    if not prediction:
        return {
            "asset_id": asset_id,
            "message": "Insufficient data for prediction",
            "prediction": None
        }
    
    return {
        "asset_id": asset_id,
        "asset_code": asset.asset_code,
        "asset_name": asset.name,
        "prediction": prediction,
    }
