from datetime import datetime, date, timedelta
from typing import List, Optional, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.asset import Asset
from app.models.maintenance import MaintenanceRecord
from app.ai.prediction import MaintenancePredictor
from app.core.database import async_session_maker
from app.schemas.maintenance import MaintenanceAlert
import logging

logger = logging.getLogger(__name__)


class AlertSystem:
    """
    AI-powered alert system for maintenance predictions.
    Monitors assets and generates proactive maintenance alerts.
    """
    
    def __init__(self):
        self.predictor = MaintenancePredictor()
    
    async def generate_alerts(
        self,
        days_ahead: int = 90,
        min_confidence: float = 0.6
    ) -> List[MaintenanceAlert]:
        """
        Generate maintenance alerts for assets needing attention.
        """
        async with async_session_maker() as session:
            # Get all active assets
            query = select(Asset).filter(Asset.status == "active")
            result = await session.execute(query)
            assets = result.scalars().all()
            
            alerts = []
            
            for asset in assets:
                # Get maintenance history
                maint_query = select(MaintenanceRecord).filter(
                    MaintenanceRecord.asset_id == asset.id
                )
                maint_result = await session.execute(maint_query)
                maintenance_history = maint_result.scalars().all()
                
                # Generate prediction
                prediction = self.predictor.predict_failure_date(
                    asset=asset,
                    maintenance_history=maintenance_history,
                    confidence_threshold=min_confidence
                )
                
                if prediction and prediction["confidence"] >= min_confidence:
                    predicted_date = prediction["predicted_date"]
                    
                    # Only alert if within the lookahead window
                    if isinstance(predicted_date, date):
                        days_until = (predicted_date - date.today()).days
                    else:
                        days_until = prediction.get("days_until_maintenance", 999)
                    
                    if 0 <= days_until <= days_ahead:
                        alert = MaintenanceAlert(
                            asset_id=asset.id,
                            asset_name=asset.name,
                            predicted_failure_date=predicted_date,
                            confidence=prediction["confidence"],
                            recommended_action=prediction["recommended_action"],
                            estimated_cost=prediction["estimated_cost"],
                        )
                        alerts.append(alert)
            
            # Sort by confidence and urgency
            alerts.sort(key=lambda x: (-x.confidence, x.predicted_failure_date))
            
            return alerts
    
    async def get_critical_alerts(self) -> List[MaintenanceAlert]:
        """Get high-priority alerts (confidence > 0.8, within 30 days)."""
        return await self.generate_alerts(days_ahead=30, min_confidence=0.8)
    
    async def create_predicted_maintenance_record(
        self,
        alert: MaintenanceAlert,
        technician_name: Optional[str] = None
    ) -> Optional[MaintenanceRecord]:
        """
        Create a maintenance record from an AI prediction.
        """
        async with async_session_maker() as session:
            # Verify asset exists
            asset = await session.get(Asset, alert.asset_id)
            if not asset:
                return None
            
            record = MaintenanceRecord(
                asset_id=alert.asset_id,
                title=f"Predictive Maintenance: {alert.asset_name}",
                description=f"AI-predicted maintenance need. Recommended action: {alert.recommended_action}",
                maintenance_type="predictive",
                priority="high" if alert.confidence > 0.8 else "medium",
                scheduled_date=alert.predicted_failure_date,
                due_date=alert.predicted_failure_date + timedelta(days=7),
                status="pending",
                is_predicted=True,
                prediction_confidence=alert.confidence,
                technician_name=technician_name,
            )
            
            session.add(record)
            await session.commit()
            await session.refresh(record)
            
            logger.info(f"Created predicted maintenance record for asset {alert.asset_id}")
            return record
    
    async def get_alert_summary(self) -> Dict:
        """Get summary of all current alerts."""
        all_alerts = await self.generate_alerts(days_ahead=90, min_confidence=0.5)
        
        critical = [a for a in all_alerts if a.confidence > 0.8]
        high = [a for a in all_alerts if 0.7 < a.confidence <= 0.8]
        medium = [a for a in all_alerts if 0.6 <= a.confidence <= 0.7]
        
        total_estimated_cost = sum(a.estimated_cost for a in all_alerts)
        
        return {
            "total_alerts": len(all_alerts),
            "critical_alerts": len(critical),
            "high_priority_alerts": len(high),
            "medium_priority_alerts": len(medium),
            "total_estimated_cost": round(total_estimated_cost, 2),
            "alerts_by_priority": {
                "critical": critical,
                "high": high,
                "medium": medium,
            }
        }


# Singleton instance
alert_system = AlertSystem()
