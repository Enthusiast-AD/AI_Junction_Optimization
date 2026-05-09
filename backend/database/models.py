from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from datetime import datetime
from .db import Base

class DecisionLog(Base):
    __tablename__ = "decision_log"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    input_state = Column(JSON)
    decision = Column(JSON)
    reason = Column(String)
    model_used = Column(String)
    latency_ms = Column(Integer)
    was_overridden = Column(Boolean, default=False)

class EmergencyEvent(Base):
    __tablename__ = "emergency_event"
    id = Column(Integer, primary_key=True, index=True)
    triggered_at = Column(DateTime, default=datetime.utcnow)
    cancelled_at = Column(DateTime, nullable=True)
    direction = Column(String)
    vehicle_type = Column(String)
    duration_seconds = Column(Integer)
    vehicles_affected = Column(Integer, default=0)

class PredictionLog(Base):
    __tablename__ = "prediction_log"
    id = Column(Integer, primary_key=True, index=True)
    generated_at = Column(DateTime, default=datetime.utcnow)
    congestion_risk = Column(String)
    predicted_peak_lane = Column(String)
    predicted_peak_in_minutes = Column(Integer)
    recommendation = Column(String)
    summary = Column(String)
    model_used = Column(String)
