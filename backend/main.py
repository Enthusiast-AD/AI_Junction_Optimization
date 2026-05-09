from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from config import settings
from database.db import Base, engine as db_engine
from database import models as db_models  # Import to ensure metadata registers tables
from simulation.engine import engine as sim_engine
from websocket.manager import manager
from routes import junction, emergency, analytics, ai
import uvicorn

# Create DB tables
Base.metadata.create_all(bind=db_engine)

app = FastAPI(title="AI Junction Optimization API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(junction.router, prefix="/api/junction", tags=["junction"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["emergency"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai insights"])

@app.on_event("startup")
async def startup_event():
    # Use create_task directly to ensure it runs continuously
    asyncio.create_task(sim_engine.run_loop())

@app.on_event("shutdown")
async def shutdown_event():
    sim_engine.running = False

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
            except:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
