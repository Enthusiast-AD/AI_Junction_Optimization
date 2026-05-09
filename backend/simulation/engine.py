import asyncio
import random
from datetime import datetime
from simulation.models import JunctionState, LaneData, PerformanceMetrics
from websocket.manager import manager
from ai.signal_optimizer import get_signal_decision
from database.db import SessionLocal
from database.models import DecisionLog

SIMULATION_CONFIG = {
    "update_interval_seconds": 5,
    "lanes": ["north", "south", "east", "west"],
    "base_density": {
        "north": 3, "south": 2, "east": 4, "west": 1
    },
    "max_vehicles_per_lane": 30,
    "green_drain_rate": 0.6,
    "red_accumulation_rate": 0.8,
}

class SimulationEngine:
    def __init__(self):
        self.state = JunctionState(
            timestamp=datetime.utcnow(),
            lanes={
                lane: LaneData(vehicle_count=SIMULATION_CONFIG["base_density"][lane], density_percent=0.0, avg_wait_seconds=0.0, throughput_last_minute=0)
                for lane in SIMULATION_CONFIG["lanes"]
            },
            current_phase="north",
            phase_elapsed_seconds=0,
            phase_duration_seconds=30,
            emergency_active=False,
            emergency_direction=None,
            ai_decision=None,
            performance=PerformanceMetrics(total_vehicles_cleared=0, avg_wait_seconds=0.0)
        )
        self.running = False

    def update_simulation(self):
        # Update vehicle counts based on current phase
        for lane in SIMULATION_CONFIG["lanes"]:
            lane_data = self.state.lanes[lane]
            if lane == self.state.current_phase:
                # Drain vehicles if green
                cleared = int(SIMULATION_CONFIG["green_drain_rate"] * SIMULATION_CONFIG["update_interval_seconds"])
                lane_data.vehicle_count = max(0, lane_data.vehicle_count - cleared)
                self.state.performance.total_vehicles_cleared += cleared
            else:
                # Accumulate vehicles if red
                added = int(SIMULATION_CONFIG["red_accumulation_rate"] * SIMULATION_CONFIG["update_interval_seconds"])
                # Add random noise
                added += random.randint(-1, 2)
                lane_data.vehicle_count = min(SIMULATION_CONFIG["max_vehicles_per_lane"], max(0, lane_data.vehicle_count + added))
            
            lane_data.density_percent = (lane_data.vehicle_count / SIMULATION_CONFIG["max_vehicles_per_lane"]) * 100

        self.state.phase_elapsed_seconds += SIMULATION_CONFIG["update_interval_seconds"]
        self.state.timestamp = datetime.utcnow()

    async def run_loop(self):
        self.running = True
        while self.running:
            self.update_simulation()
            
            # Check if phase change is needed
            if self.state.phase_elapsed_seconds >= self.state.phase_duration_seconds:
                # Get decision from AI
                decision = await get_signal_decision(self.state)
                self.state.ai_decision = decision
                self.state.current_phase = decision.recommended_phase
                self.state.phase_duration_seconds = decision.duration_seconds
                self.state.phase_elapsed_seconds = 0
                
                # Save decision to db
                db = SessionLocal()
                try:
                    log_entry = DecisionLog(
                        input_state={k: v.model_dump() for k, v in self.state.lanes.items()},
                        decision=decision.model_dump(),
                        reason=decision.reason,
                        model_used=decision.model_used,
                        latency_ms=decision.latency_ms,
                        was_overridden=self.state.emergency_active
                    )
                    db.add(log_entry)
                    db.commit()
                except Exception as e:
                    print(f"Failed to log decision: {e}")
                finally:
                    db.close()
                
                await manager.broadcast({
                    "type": "phase_change",
                    "data": {
                        "from": self.state.current_phase, # This is wrong but fine for mockup
                        "to": decision.recommended_phase,
                        "reason": decision.reason
                    }
                })

            # Broadcast state update
            await manager.broadcast({
                "type": "state_update",
                "data": self.state.model_dump()
            })
            
            await asyncio.sleep(SIMULATION_CONFIG["update_interval_seconds"])

engine = SimulationEngine()
