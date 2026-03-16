import numpy as np
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict
import json
from pathlib import Path
from app.models.asset import Asset
from app.models.maintenance import MaintenanceRecord


class MaintenancePredictor:
    """
    Simple ML model for predicting maintenance needs.
    In production, this would use scikit-learn or TensorFlow.
    This implementation uses rule-based prediction with statistical analysis.
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or "./app/ai/models"
        Path(self.model_path).mkdir(parents=True, exist_ok=True)
        
        # Failure rate thresholds by category (failures per year)
        self.failure_rates = {
            "electronics": 0.3,
            "mechanical": 0.5,
            "hvac": 0.4,
            "vehicle": 0.6,
            "furniture": 0.1,
            "it_equipment": 0.4,
            "default": 0.3,
        }
        
        # Condition degradation factors
        self.condition_factors = {
            "excellent": 0.5,
            "good": 1.0,
            "fair": 1.5,
            "poor": 2.5,
        }
    
    def predict_failure_date(
        self,
        asset: Asset,
        maintenance_history: List[MaintenanceRecord],
        confidence_threshold: float = 0.7
    ) -> Optional[Dict]:
        """
        Predict next maintenance/failure date based on asset characteristics and history.
        
        Returns dict with:
        - predicted_date: date of predicted failure
        - confidence: prediction confidence (0-1)
        - recommended_action: maintenance recommendation
        - estimated_cost: estimated maintenance cost
        """
        if not asset or not maintenance_history:
            return None
        
        # Calculate average time between failures
        if len(maintenance_history) >= 2:
            completed = [m for m in maintenance_history if m.completed_date]
            if len(completed) >= 2:
                dates = sorted([m.completed_date for m in completed])
                intervals = []
                for i in range(1, len(dates)):
                    delta = (dates[i] - dates[i-1]).days
                    intervals.append(delta)
                
                avg_interval = sum(intervals) / len(intervals) if intervals else 365
            else:
                avg_interval = 365
        else:
            # Use category-based default
            category = (asset.category or "default").lower()
            failure_rate = self.failure_rates.get(category, self.failure_rates["default"])
            avg_interval = int(365 / failure_rate)
        
        # Adjust for condition
        condition_factor = self.condition_factors.get(asset.condition, 1.0)
        adjusted_interval = int(avg_interval / condition_factor)
        
        # Get last maintenance date
        last_maintenance = max(
            [m.completed_date for m in maintenance_history if m.completed_date],
            default=datetime.utcnow()
        )
        
        # Predict next failure date
        predicted_date = last_maintenance + timedelta(days=adjusted_interval)
        
        # Calculate confidence based on data quality
        data_points = len(maintenance_history)
        if data_points >= 5:
            confidence = 0.9
        elif data_points >= 3:
            confidence = 0.75
        elif data_points >= 1:
            confidence = 0.6
        else:
            confidence = 0.4
        
        # Adjust confidence based on asset age
        asset_age_days = (datetime.utcnow() - asset.purchase_date).days if asset.purchase_date else 0
        if asset_age_days > 1825:  # > 5 years
            confidence *= 0.9  # Older assets less predictable
        
        # Generate recommendation
        if adjusted_interval < 90:
            action = "Schedule immediate preventive maintenance"
            priority = "high"
        elif adjusted_interval < 180:
            action = "Plan maintenance within next quarter"
            priority = "medium"
        else:
            action = "Continue regular monitoring"
            priority = "low"
        
        # Estimate cost based on asset value and maintenance type
        base_cost = asset.purchase_price * 0.05  # 5% of asset value
        if asset.category and "vehicle" in asset.category.lower():
            base_cost *= 1.5
        elif asset.category and ("electronics" in asset.category.lower() or "it" in asset.category.lower()):
            base_cost *= 0.8
        
        estimated_cost = base_cost * condition_factor
        
        return {
            "predicted_date": predicted_date.date() if isinstance(predicted_date, datetime) else predicted_date,
            "confidence": min(confidence, 0.95),
            "recommended_action": action,
            "priority": priority,
            "estimated_cost": round(estimated_cost, 2),
            "days_until_maintenance": (predicted_date - datetime.utcnow()).days,
        }
    
    def batch_predict(self, assets: List[Asset], maintenance_data: Dict[int, List[MaintenanceRecord]]) -> List[Dict]:
        """
        Generate predictions for multiple assets.
        """
        predictions = []
        for asset in assets:
            history = maintenance_data.get(asset.id, [])
            prediction = self.predict_failure_date(asset, history)
            
            if prediction:
                predictions.append({
                    "asset_id": asset.id,
                    "asset_code": asset.asset_code,
                    "asset_name": asset.name,
                    **prediction
                })
        
        return predictions
    
    def save_model(self, model_data: Dict):
        """Save model configuration/data."""
        model_file = Path(self.model_path) / "model_config.json"
        with open(model_file, 'w') as f:
            json.dump(model_data, f, indent=2, default=str)
    
    def load_model(self) -> Optional[Dict]:
        """Load saved model configuration."""
        model_file = Path(self.model_path) / "model_config.json"
        if model_file.exists():
            with open(model_file, 'r') as f:
                return json.load(f)
        return None
