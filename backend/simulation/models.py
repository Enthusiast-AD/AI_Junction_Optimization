from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime

class LaneData(BaseModel):
    vehicle_count: int
    density_percent: float
    avg_wait_seconds: float
    throughput_last_minute: int

class AIDecision(BaseModel):
    recommended_phase: str
    duration_seconds: int
    reason: str
    confidence: float
    model_used: str
    latency_ms: int

class PerformanceMetrics(BaseModel):
    total_vehicles_cleared: int
    avg_wait_seconds: float
    
class JunctionState(BaseModel):
    timestamp: datetime
    lanes: Dict[str, LaneData]
    current_phase: str
    phase_elapsed_seconds: int
    phase_duration_seconds: int
    emergency_active: bool
    emergency_direction: Optional[str]
    ai_decision: Optional[AIDecision]
    performance: Optional[PerformanceMetrics]

class EmergencyTrigger(BaseModel):
    direction: str
    vehicle_type: str
    duration_override_seconds: int = 120

class CongestionPrediction(BaseModel):
    generated_at: datetime
    congestion_risk: str
    predicted_peak_lane: str
    predicted_peak_in_minutes: int
    recommendation: str
    summary: str
    model_used: str
