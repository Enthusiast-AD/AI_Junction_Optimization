from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

class VehicleEntity(BaseModel):
    id: str
    lane: str # "north", "south", "east", "west"
    vehicle_type: str # "car", "bus", "truck", "ambulance"
    position: float # 0.0 (entry) to 1.0 (stop line) to 2.0 (cleared)
    speed: float
    wait_time_seconds: float
    is_emergency: bool = False

class LaneData(BaseModel):
    vehicle_count: int
    density_percent: float
    avg_wait_seconds: float
    throughput_last_minute: int
    inflow_rate_per_minute: float = 12.0
    queue_length_meters: float = 0.0

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
    fuel_saved_liters: float = 0.0
    co2_reduced_kg: float = 0.0
    fixed_timer_comparative_delay: float = 0.0
    delay_reduction_percent: float = 0.0

class SignalStateDetails(BaseModel):
    current_phase: str # "north", "south", "east", "west"
    signal_color: str # "green", "yellow", "all_red"
    phase_elapsed_seconds: int
    phase_duration_seconds: int
    yellow_duration_seconds: int = 3
    all_red_duration_seconds: int = 2
    next_phase: Optional[str] = None

class JunctionState(BaseModel):
    timestamp: datetime
    lanes: Dict[str, LaneData]
    current_phase: str
    signal_color: str = "green" # "green", "yellow", "all_red"
    phase_elapsed_seconds: int = 0
    phase_duration_seconds: int = 30
    emergency_active: bool = False
    emergency_direction: Optional[str] = None
    active_scenario: str = "normal"
    is_paused: bool = False
    simulation_speed: float = 1.0
    ai_decision: Optional[AIDecision] = None
    performance: Optional[PerformanceMetrics] = None
    neural_activations: Optional[Dict[str, Any]] = None

class EmergencyTrigger(BaseModel):
    direction: str
    vehicle_type: str = "ambulance"
    duration_override_seconds: int = 60

class ScenarioTrigger(BaseModel):
    scenario_name: str # "normal", "morning_rush", "evening_rush", "gridlock", "storm"

class CongestionPrediction(BaseModel):
    generated_at: datetime
    congestion_risk: str
    predicted_peak_lane: str
    predicted_peak_in_minutes: int
    recommendation: str
    summary: str
    model_used: str
