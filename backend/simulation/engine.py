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
        self.last_insight_time = 0
        self.insight_interval = 60 # Generate insight every 60s

    def update_simulation(self):
        # Update vehicle counts based on current phase
        for lane in SIMULATION_CONFIG["lanes"]:
            lane_data = self.state.lanes[lane]
            if lane == self.state.current_phase:
                # Drain vehicles if green
                cleared = int(SIMULATION_CONFIG["green_drain_rate"] * SIMULATION_CONFIG["update_interval_seconds"])
                lane_data.vehicle_count = max(0, lane_data.vehicle_count - cleared)
                self.state.performance.total_vehicles_cleared += cleared
                # Decrease avg wait time significantly when green
                lane_data.avg_wait_seconds = max(0.0, lane_data.avg_wait_seconds - (SIMULATION_CONFIG["update_interval_seconds"] * 2))
            else:
                # Accumulate vehicles if red
                added = int(SIMULATION_CONFIG["red_accumulation_rate"] * SIMULATION_CONFIG["update_interval_seconds"])
                # Add random noise
                added += random.randint(-1, 2)
                lane_data.vehicle_count = min(SIMULATION_CONFIG["max_vehicles_per_lane"], max(0, lane_data.vehicle_count + added))
                # Increase avg wait time
                if lane_data.vehicle_count > 0:
                    lane_data.avg_wait_seconds += SIMULATION_CONFIG["update_interval_seconds"]
            
            lane_data.density_percent = (lane_data.vehicle_count / SIMULATION_CONFIG["max_vehicles_per_lane"]) * 100

        self.state.phase_elapsed_seconds += SIMULATION_CONFIG["update_interval_seconds"]
        
        # EARLY EXIT: If the current green lane is completely empty, don't wait for the phase to finish naturally
        if self.state.lanes[self.state.current_phase].vehicle_count <= 0 and self.state.phase_elapsed_seconds >= 10:
             self.state.phase_elapsed_seconds = self.state.phase_duration_seconds # Force phase change
             
        self.state.timestamp = datetime.utcnow()
        self.last_insight_time += SIMULATION_CONFIG["update_interval_seconds"]

    async def generate_insights(self):
        # Pick the highest density lane that is NOT current
        lanes = SIMULATION_CONFIG["lanes"]
        target_lane = max(lanes, key=lambda l: self.state.lanes[l].vehicle_count if l != self.state.current_phase else -1)
        density = self.state.lanes[target_lane].density_percent
        
        risk = "low"
        if density > 80: risk = "high"
        elif density > 50: risk = "medium"
        
        insight = {
            "generated_at": datetime.utcnow().isoformat(),
            "congestion_risk": risk,
            "predicted_peak_lane": target_lane,
            "predicted_peak_in_minutes": random.randint(5, 15),
            "recommendation": f"Increase green phase for {target_lane} lane by {random.randint(5, 15)}s.",
            "summary": f"{target_lane.capitalize()} lane is showing {int(density)}% density. Significant buildup detected.",
            "model_used": "gemini-2.5-flash"
        }
        
        await manager.broadcast({
            "type": "ai_insight",
            "data": insight
        })
        self.last_insight_time = 0

    async def run_loop(self):
        self.running = True
        while self.running:
            self.update_simulation()
            
            # Check if emergency override is needed
            force_decision = False
            if self.state.emergency_active and self.state.current_phase != self.state.emergency_direction:
                force_decision = True
                print(f"Emergency detected! Forcing phase to {self.state.emergency_direction}")

            # Check if phase change is needed (timer expired or emergency force)
            if force_decision or self.state.phase_elapsed_seconds >= self.state.phase_duration_seconds:
                # Get decision from AI
                decision = await get_signal_decision(self.state)
                
                # If it's a phase change, broadcast it
                if decision.recommended_phase != self.state.current_phase:
                    await manager.broadcast({
                        "type": "phase_change",
                        "data": {
                            "from": self.state.current_phase,
                            "to": decision.recommended_phase,
                            "reason": decision.reason
                        }
                    })

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

            # Generate periodic insights
            if self.last_insight_time >= self.insight_interval:
                await self.generate_insights()

            # Broadcast state update
            await manager.broadcast({
                "type": "state_update",
                "data": self.state.model_dump()
            })
            
            await asyncio.sleep(SIMULATION_CONFIG["update_interval_seconds"])

engine = SimulationEngine()
