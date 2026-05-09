from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from simulation.engine import engine
from simulation.models import EmergencyTrigger
from websocket.manager import manager
from database.db import get_db
from database.models import EmergencyEvent

router = APIRouter()

@router.post("/trigger")
async def trigger_emergency(trigger: EmergencyTrigger, db: Session = Depends(get_db)):
    engine.state.emergency_active = True
    engine.state.emergency_direction = trigger.direction
    
    # Save to db
    event = EmergencyEvent(
        direction=trigger.direction,
        vehicle_type=trigger.vehicle_type,
        duration_seconds=trigger.duration_override_seconds
    )
    db.add(event)
    db.commit()

    
    # Broadcast emergency
    await manager.broadcast({
        "type": "emergency_activated",
        "data": {
            "direction": trigger.direction,
            "vehicle_type": trigger.vehicle_type
        }
    })
    
    return {
        "status": "activated",
        "green_corridor": [trigger.direction],
        "all_other_phases": "red",
        "estimated_clearance_seconds": 45,
        "message": f"Emergency corridor active. {trigger.direction} lane green. All other phases held red."
    }

@router.post("/cancel")
async def cancel_emergency():
    engine.state.emergency_active = False
    old_direction = engine.state.emergency_direction
    engine.state.emergency_direction = None
    
    return {
        "status": "cancelled",
        "resuming_phase": "east",
        "reason": "Highest density lane after emergency clearance"
    }

@router.get("/log")
async def get_emergency_log():
    return {
        "events": []
    }
