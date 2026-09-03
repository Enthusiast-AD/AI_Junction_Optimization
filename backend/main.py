from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from config import settings
from database.db import Base, engine as db_engine
from database import models as db_models  # Import to ensure metadata registers tables
from simulation.engine import engine as sim_engine
from websocket.manager import manager
from routes import junction, emergency, analytics, ai, ann
import uvicorn

# Create DB tables
Base.metadata.create_all(bind=db_engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Use create_task directly to ensure it runs continuously
    asyncio.create_task(sim_engine.run_loop())
    yield
    # Shutdown
    sim_engine.running = False

app = FastAPI(title="ANN Intelligent Traffic Junction Optimization API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(junction.router, prefix="/api/junction", tags=["junction"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["emergency"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai insights"])
app.include_router(ann.router, prefix="/api/ann", tags=["ann neural network"])



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Simple handling of incoming messages for demo
            import json
            try:
                msg = json.loads(data)
                if msg.get("type") == "trigger_emergency":
                    sim_engine.state.emergency_active = True
                    sim_engine.state.emergency_direction = msg.get("direction")
                    await manager.broadcast({
                        "type": "emergency_activated",
                        "data": {
                            "direction": msg.get("direction"),
                            "vehicle_type": msg.get("vehicle_type")
                        }
                    })
                elif msg.get("type") == "cancel_emergency":
                    sim_engine.state.emergency_active = False
                    sim_engine.state.emergency_direction = None
                    # Force immediate re-evaluation on next tick
                    sim_engine.state.phase_elapsed_seconds = sim_engine.state.phase_duration_seconds
            except:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
