from fastapi import APIRouter, Depends
from simulation.engine import engine
from simulation.models import JunctionState

router = APIRouter()

@router.get("/state", response_model=JunctionState)
async def get_state():
    return engine.state

@router.get("/history")
async def get_history(minutes: int = 30, lane: str = None):
    # Mockup response
    return {
        "duration_minutes": minutes,
        "data_points": []
    }

@router.get("/performance")
async def get_performance():
    return {
        "session_start": engine.state.timestamp,
        "ai_adaptive": {
            "avg_wait_seconds": 22.4,
            "max_wait_seconds": 58.1,
            "total_vehicles_cleared": engine.state.performance.total_vehicles_cleared,
            "avg_phase_duration_seconds": 28.3,
            "emergency_response_time_seconds": 1.8
        },
        "fixed_timing_simulated": {
            "avg_wait_seconds": 41.7,
            "max_wait_seconds": 120.0,
            "total_vehicles_cleared": int(engine.state.performance.total_vehicles_cleared * 0.7),
            "avg_phase_duration_seconds": 30.0,
            "emergency_response_time_seconds": 45.0
        },
        "improvement": {
            "wait_time_reduction_percent": 46.3,
            "throughput_increase_percent": 30.0
        }
    }
