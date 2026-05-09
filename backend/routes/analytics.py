from fastapi import APIRouter

router = APIRouter()

@router.get("/summary")
async def get_summary():
    return {
      "session_duration_minutes": 87,
      "total_decisions": 1044,
      "ai_decisions": 1021,
      "fallback_decisions": 23,
      "emergency_events": 2,
      "avg_ai_latency_ms": 203,
      "busiest_lane": "north",
      "quietest_lane": "west",
      "peak_density_recorded": { "lane": "north", "count": 28, "at": "2026-05-09T14:31:00Z" }
    }

@router.get("/phase-distribution")
async def get_phase_distribution():
    return {
      "north": { "total_green_seconds": 1840, "percent": 42.1 },
      "south": { "total_green_seconds": 820,  "percent": 18.8 },
      "east":  { "total_green_seconds": 1260, "percent": 28.8 },
      "west":  { "total_green_seconds": 450,  "percent": 10.3 }
    }

