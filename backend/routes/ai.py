from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ai.predictor import generate_prediction
from database.db import get_db
from database.models import PredictionLog, DecisionLog
import random
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/prediction")
async def get_prediction(db: Session = Depends(get_db)):
    # Mocking recent traffic history to feed the AI (so it's not an empty list)
    mock_history = []
    base_time = datetime.utcnow() - timedelta(minutes=30)
    for i in range(6):  # simulate 6 data points over 30 mins
        mock_history.append({
            "timestamp": (base_time + timedelta(minutes=i*5)).isoformat(),
            "north": random.randint(5, 25),
            "south": random.randint(2, 10),
            "east": random.randint(3, 15),
            "west": random.randint(1, 5)
        })

    # Calling the gemini predictor logic with our mock history instead of []
    prediction = await generate_prediction(mock_history) 
    
    # Save to db
    db_pred = PredictionLog(
        congestion_risk=prediction.congestion_risk,
        predicted_peak_lane=prediction.predicted_peak_lane,
        predicted_peak_in_minutes=prediction.predicted_peak_in_minutes,
        recommendation=prediction.recommendation,
        summary=prediction.summary,
        model_used=prediction.model_used
    )
    db.add(db_pred)
    db.commit()
    
    return prediction

@router.get("/decision-log")
async def get_decision_log(limit: int = 20, db: Session = Depends(get_db)):
    logs = db.query(DecisionLog).order_by(DecisionLog.timestamp.desc()).limit(limit).all()
    return {"decisions": logs}
