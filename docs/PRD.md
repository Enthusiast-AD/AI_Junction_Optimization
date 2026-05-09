# AI Junction Optimization System — Product Requirements Document

**Version:** 1.0  
**Hackathon Duration:** 24 hours  
**Team Size:** 3–4 people  
**Last Updated:** May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [System Architecture](#3-system-architecture)
4. [Tech Stack](#4-tech-stack)
5. [AI & API Strategy](#5-ai--api-strategy)
6. [Data Layer — Traffic Simulation Engine](#6-data-layer--traffic-simulation-engine)
7. [Backend — FastAPI Service](#7-backend--fastapi-service)
8. [API Endpoints Reference](#8-api-endpoints-reference)
9. [Frontend — Dashboard](#9-frontend--dashboard)
10. [Frontend Pages & Components](#10-frontend-pages--components)
11. [ML Modules](#11-ml-modules)
12. [Emergency Vehicle Priority System](#12-emergency-vehicle-priority-system)
13. [Work Breakdown & Timeline](#13-work-breakdown--timeline)
14. [Team Responsibilities](#14-team-responsibilities)
15. [Environment Variables & Setup](#15-environment-variables--setup)


---

## 1. Project Overview

### Problem Statement

Traffic signals at road junctions operate on fixed pre-programmed timing cycles, regardless of real-time vehicle density. This causes:

- Unnecessary waiting on low-density lanes while high-density lanes are held red
- Emergency vehicle delays — ambulances stuck behind red signals
- Cascading congestion when one junction backs up into adjacent roads
- No predictive capability — congestion is only addressed after it forms

### Solution

An AI-based junction management system that:

- **Simulates** real-time vehicle density per lane (replacing physical sensors for the hackathon)
- **Optimizes** signal phase and duration dynamically using an LLM-powered decision engine (Groq)
- **Predicts** congestion 5–15 minutes ahead using pattern analysis (Gemini)
- **Prioritizes** emergency vehicles with an instant green-corridor override
- **Displays** everything on a live dashboard with animated signals, density charts, and AI insights

### Scope (24-hour build)

In scope: simulation engine, adaptive signal optimizer, emergency preemption, congestion predictor, live dashboard, AI decision explainer, performance comparison (fixed vs AI timing).

Out of scope: real camera feeds, physical hardware integration, multi-junction coordination (stretch goal only), mobile app.

---

## 2. Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Reduce average wait time | Simulated avg wait: AI vs fixed | ≥ 30% reduction |
| Emergency response | Time from trigger to green corridor | < 2 seconds |
| Congestion prediction | Forecast shown before peak | ≥ 5 min lead time |
| Dashboard liveness | Signal state update frequency | Every 5 seconds |
| AI explainability | Every signal decision has a reason string | 100% of decisions |
| Demo stability | No crashes during 5-min live demo | Zero crashes |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │ Simulation Engine│  │ Emergency Trigger│  │Historical Data│  │
│  │ (Python thread)  │  │ (Manual / Auto)  │  │ (SQLite logs) │  │
│  └────────┬─────────┘  └────────┬────────┘  └───────┬───────┘  │
└───────────┼────────────────────┼───────────────────┼───────────┘
            │                    │                   │
┌───────────┼────────────────────┼───────────────────┼───────────┐
│                          AI CORE                               │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌───────▼───────┐  │
│  │ Signal Optimizer│  │ Emergency       │  │ Congestion    │  │
│  │ (Groq/Llama)    │  │ Preemption      │  │ Predictor     │  │
│  │                 │  │ Logic           │  │ (Gemini Flash)│  │
│  └────────┬────────┘  └────────┬────────┘  └───────┬───────┘  │
│           └──────────────┬─────┘                   │           │
│                  ┌───────▼─────────────────────┐   │           │
│                  │   FastAPI + WebSocket Server │◄──┘           │
│                  └───────┬─────────────────────┘               │
└──────────────────────────┼─────────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────────┐
│                       OUTPUT LAYER                              │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │  Live Dashboard  │  │  Signal Commands │  │  Alert Feed   │  │
│  │  (React + Vite)  │  │  (Phase/Duration)│  │  + AI Logs    │  │
│  └──────────────────┘  └─────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Tech Stack

### Backend

| Layer | Technology | Why |
|---|---|---|
| API framework | FastAPI (Python 3.11+) | Async support, auto docs at `/docs`, fast to build |
| WebSocket | FastAPI WebSocket / `websockets` | Real-time push to frontend |
| Database | SQLite + SQLAlchemy | Zero setup, sufficient for 24hr demo |
| Task scheduling | `asyncio` background tasks | Runs simulation loop every 5s |
| AI client | `groq` Python SDK + `google-genai` | Official SDKs, simple auth |

### Frontend

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 + Vite | Fast dev server, component model |
| Styling | Tailwind CSS | Rapid UI, no custom CSS needed |
| Charts | Recharts | Easy real-time line/bar charts |
| State | Zustand | Lightweight, no boilerplate |
| WebSocket | Native browser WebSocket API | No extra library needed |
| Icons | Lucide React | Clean icon set |
| HTTP client | Axios | Simple REST calls |

### ML / AI

| Module | Approach | Library |
|---|---|---|
| Signal optimizer | LLM prompt-based decision | Groq API (Llama 3.1 8B) |
| Congestion predictor | Moving average + LLM narrative | Gemini 2.5 Flash |
| Traffic simulation | Rule-based synthetic data generator | Pure Python |
| Performance comparison | In-memory stats calculation | NumPy |

---

## 5. AI & API Strategy

### Primary: Groq (Signal Optimizer)

- **Model:** `llama-3.1-8b-instant` for low-latency decisions; `llama-3.3-70b-versatile` for detailed analysis
- **Use case:** Every 5 seconds, feed current lane densities → receive JSON decision (phase, duration, reason)
- **Free tier:** 30 req/min, 1,000 req/day — sufficient for demo
- **Sign up:** console.groq.com (no credit card)

```python
# Example call pattern
{
  "model": "llama-3.1-8b-instant",
  "messages": [{
    "role": "system",
    "content": "You are a traffic signal controller. Always respond with valid JSON only."
  }, {
    "role": "user", 
    "content": "N:14 S:3 E:9 W:2 vehicles. Emergency:false. Current:N. Respond: {phase, duration_seconds, reason}"
  }],
  "temperature": 0.1,
  "max_tokens": 80
}
```

### Secondary: Google AI Studio / Gemini 2.5 Flash (Congestion Predictor)

- **Model:** `gemini-2.5-flash`
- **Use case:** Every 2 minutes, analyze last 30-minute traffic history → generate congestion forecast + recommendation
- **Free tier:** 15 req/min, 500 req/day — ample for periodic analysis
- **Sign up:** aistudio.google.com (no credit card)

```python
# Example call pattern — feed entire session history
prompt = f"""
You are a traffic analyst. Analyze this 30-minute traffic history and predict congestion.
History (vehicle counts per lane, every 5s): {json.dumps(history_data)}
Return JSON: {{
  "congestion_risk": "low|medium|high",
  "predicted_peak_lane": "N|S|E|W",
  "predicted_peak_in_minutes": int,
  "recommendation": str,
  "summary": str  
}}
"""
```

### Fallback: OpenRouter (Free Models)

- **Models:** `deepseek/deepseek-chat:free`, `meta-llama/llama-3.3-70b:free`
- **Use case:** If Groq quota exhausted during demo, auto-fallback
- **Sign up:** openrouter.ai

### Optional: Anthropic Claude (Haiku)

- **Model:** `claude-haiku-4-5-20251001`
- **Use case:** Rich explanation cards, detailed incident reports
- **Note:** New accounts get $5 free credits — enough for a hackathon
- **Cost:** ~$0.001 per explanation call

### API Priority Waterfall

```
Signal decision request
       │
       ▼
  Groq available? ──Yes──► Groq (llama-3.1-8b-instant)
       │
       No
       ▼
  OpenRouter free? ──Yes──► OpenRouter (deepseek:free)
       │
       No
       ▼
  Rule-based fallback (deterministic greedy algorithm)
```

---

## 6. Data Layer — Traffic Simulation Engine

The simulation engine runs as an `asyncio` background task, generating synthetic but realistic traffic data. It replaces physical sensors and camera feeds for the hackathon.

### Simulation Parameters

```python
SIMULATION_CONFIG = {
    "update_interval_seconds": 5,
    "lanes": ["north", "south", "east", "west"],
    "base_density": {          # vehicles at idle
        "north": 3, "south": 2, "east": 4, "west": 1
    },
    "peak_hours": [            # rush hour multipliers
        {"start": 800, "end": 1000, "multiplier": 3.5},   # morning rush
        {"start": 1700, "end": 1930, "multiplier": 4.0},  # evening rush
        {"start": 1200, "end": 1400, "multiplier": 2.0},  # lunch
    ],
    "random_variance": 0.25,   # ±25% random noise
    "max_vehicles_per_lane": 30,
    "green_drain_rate": 0.6,   # vehicles cleared per second of green
    "red_accumulation_rate": 0.8,  # vehicles added per second of red
}
```

### Junction State Object

```python
@dataclass
class JunctionState:
    timestamp: datetime
    lanes: dict[str, LaneData]       # N, S, E, W
    current_phase: str               # which lane has green
    phase_elapsed_seconds: int       # how long current phase has been active
    phase_duration_seconds: int      # total duration of current phase
    emergency_active: bool
    emergency_direction: str | None  # which lane emergency vehicle is on
    ai_decision: AIDecision | None
    performance: PerformanceMetrics

@dataclass  
class LaneData:
    vehicle_count: int
    density_percent: float           # 0-100
    avg_wait_seconds: float
    throughput_last_minute: int      # vehicles that cleared

@dataclass
class AIDecision:
    recommended_phase: str
    duration_seconds: int
    reason: str
    confidence: float
    model_used: str
    latency_ms: int
```

---

## 7. Backend — FastAPI Service

### Project Structure

```
backend/
├── main.py                  # FastAPI app entry point
├── simulation/
│   ├── engine.py            # Traffic simulation loop
│   └── models.py            # Pydantic data models
├── ai/
│   ├── signal_optimizer.py  # Groq integration
│   ├── predictor.py         # Gemini integration
│   └── fallback.py          # Rule-based greedy algorithm
├── routes/
│   ├── junction.py          # Junction REST endpoints
│   ├── emergency.py         # Emergency control endpoints
│   └── analytics.py        # Historical data endpoints
├── websocket/
│   └── manager.py           # WebSocket connection manager
├── database/
│   ├── db.py                # SQLite connection
│   └── models.py            # SQLAlchemy models
├── config.py                # Env vars, constants
└── requirements.txt
```

### Key Backend Logic: Signal Optimizer

```python
# ai/signal_optimizer.py

async def get_signal_decision(state: JunctionState) -> AIDecision:
    # 1. Check cache — don't call API if nothing changed significantly
    cache_key = hash(frozenset(state.lane_counts.items()))
    if cached := decision_cache.get(cache_key):
        return cached
    
    # 2. Try Groq first
    try:
        decision = await _call_groq(state)
        decision_cache[cache_key] = decision
        return decision
    except RateLimitError:
        pass
    
    # 3. Fallback to OpenRouter
    try:
        return await _call_openrouter(state)
    except Exception:
        pass
    
    # 4. Deterministic greedy fallback
    return _greedy_fallback(state)

def _greedy_fallback(state: JunctionState) -> AIDecision:
    """Density-weighted greedy: pick lane with most vehicles"""
    best_lane = max(state.lanes, key=lambda l: state.lanes[l].vehicle_count)
    density = state.lanes[best_lane].vehicle_count
    duration = min(15 + density * 1.5, 60)  # 15–60 seconds
    return AIDecision(
        recommended_phase=best_lane,
        duration_seconds=int(duration),
        reason=f"Greedy: {best_lane} lane has highest density ({density} vehicles)",
        confidence=0.7,
        model_used="rule-based-greedy",
        latency_ms=0
    )
```

---

## 8. API Endpoints Reference

### Base URL

```
Development:  http://localhost:8000
WebSocket:    ws://localhost:8000/ws
API Docs:     http://localhost:8000/docs
```

---

### Junction Endpoints

#### `GET /api/junction/state`

Returns the current complete state of the junction.

**Response:**
```json
{
  "timestamp": "2026-05-09T14:23:11Z",
  "lanes": {
    "north": { "vehicle_count": 12, "density_percent": 40, "avg_wait_seconds": 28.5, "throughput_last_minute": 18 },
    "south": { "vehicle_count": 3,  "density_percent": 10, "avg_wait_seconds": 8.2,  "throughput_last_minute": 24 },
    "east":  { "vehicle_count": 9,  "density_percent": 30, "avg_wait_seconds": 19.1, "throughput_last_minute": 15 },
    "west":  { "vehicle_count": 2,  "density_percent": 6,  "avg_wait_seconds": 5.0,  "throughput_last_minute": 20 }
  },
  "current_phase": "north",
  "phase_elapsed_seconds": 12,
  "phase_duration_seconds": 35,
  "emergency_active": false,
  "emergency_direction": null,
  "ai_decision": {
    "recommended_phase": "north",
    "duration_seconds": 35,
    "reason": "North lane has highest density (12 vehicles). Extended green to clear backlog.",
    "confidence": 0.91,
    "model_used": "llama-3.1-8b-instant",
    "latency_ms": 187
  }
}
```

---

#### `GET /api/junction/history?minutes=30`

Returns lane density history for charting.

**Query params:** `minutes` (int, default 30), `lane` (str, optional — filter to one lane)

**Response:**
```json
{
  "duration_minutes": 30,
  "data_points": [
    {
      "timestamp": "2026-05-09T13:53:00Z",
      "north": 8, "south": 2, "east": 5, "west": 1
    }
    // ... one entry per 5-second interval
  ]
}
```

---

#### `GET /api/junction/performance`

Returns comparative performance: AI adaptive timing vs simulated fixed timing.

**Response:**
```json
{
  "session_start": "2026-05-09T13:00:00Z",
  "ai_adaptive": {
    "avg_wait_seconds": 22.4,
    "max_wait_seconds": 58.1,
    "total_vehicles_cleared": 847,
    "avg_phase_duration_seconds": 28.3,
    "emergency_response_time_seconds": 1.8
  },
  "fixed_timing_simulated": {
    "avg_wait_seconds": 41.7,
    "max_wait_seconds": 120.0,
    "total_vehicles_cleared": 612,
    "avg_phase_duration_seconds": 30.0,
    "emergency_response_time_seconds": 45.0
  },
  "improvement": {
    "wait_time_reduction_percent": 46.3,
    "throughput_increase_percent": 38.4
  }
}
```

---

### Emergency Endpoints

#### `POST /api/emergency/trigger`

Activates emergency vehicle priority mode.

**Request body:**
```json
{
  "direction": "north",          // which lane the emergency vehicle is on
  "vehicle_type": "ambulance",   // ambulance | fire | police
  "duration_override_seconds": 120
}
```

**Response:**
```json
{
  "status": "activated",
  "green_corridor": ["north"],
  "all_other_phases": "red",
  "estimated_clearance_seconds": 45,
  "message": "Emergency corridor active. North lane green. All other phases held red."
}
```

---

#### `POST /api/emergency/cancel`

Cancels emergency mode, resumes normal AI optimization.

**Response:**
```json
{
  "status": "cancelled",
  "resuming_phase": "east",
  "reason": "Highest density lane after emergency clearance"
}
```

---

#### `GET /api/emergency/log`

Returns the history of all emergency events.

**Response:**
```json
{
  "events": [
    {
      "id": "evt_001",
      "triggered_at": "2026-05-09T14:15:33Z",
      "cancelled_at": "2026-05-09T14:16:48Z",
      "direction": "north",
      "vehicle_type": "ambulance",
      "duration_seconds": 75,
      "vehicles_affected": 34
    }
  ]
}
```

---

### AI Insights Endpoints

#### `GET /api/ai/prediction`

Returns the latest congestion prediction from Gemini.

**Response:**
```json
{
  "generated_at": "2026-05-09T14:20:00Z",
  "congestion_risk": "high",
  "predicted_peak_lane": "north",
  "predicted_peak_in_minutes": 8,
  "recommendation": "Pre-extend North green phase to 45s for next 3 cycles to drain backlog before peak.",
  "summary": "Historical pattern shows North lane peaks at 14:30 on weekdays. Current density trending 20% above average. Intervention recommended.",
  "model_used": "gemini-2.5-flash"
}
```

---

#### `GET /api/ai/decision-log?limit=20`

Returns the last N AI signal decisions with reasoning.

**Response:**
```json
{
  "decisions": [
    {
      "id": "dec_0847",
      "timestamp": "2026-05-09T14:23:10Z",
      "input_state": { "north": 12, "south": 3, "east": 9, "west": 2 },
      "decision": { "phase": "north", "duration_seconds": 35 },
      "reason": "North lane has highest density. Extended green to clear backlog before east lane peak.",
      "model_used": "llama-3.1-8b-instant",
      "latency_ms": 187,
      "was_overridden": false
    }
  ]
}
```

---

### Analytics Endpoints

#### `GET /api/analytics/summary`

Returns session-level analytics summary for the stats panel.

**Response:**
```json
{
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
```

---

#### `GET /api/analytics/phase-distribution`

Returns how much time each lane spent on green.

**Response:**
```json
{
  "north": { "total_green_seconds": 1840, "percent": 42.1 },
  "south": { "total_green_seconds": 820,  "percent": 18.8 },
  "east":  { "total_green_seconds": 1260, "percent": 28.8 },
  "west":  { "total_green_seconds": 450,  "percent": 10.3 }
}
```

---

### WebSocket

#### `WS /ws`

Persistent WebSocket connection for real-time state streaming. The server broadcasts a full `JunctionState` JSON object every 5 seconds, and immediately on any emergency event or phase change.

**Message types sent by server:**

```json
// Type 1: regular state update (every 5s)
{ "type": "state_update", "data": { ...JunctionState } }

// Type 2: phase change (immediate)
{ "type": "phase_change", "data": { "from": "north", "to": "east", "reason": "..." } }

// Type 3: emergency activated (immediate)
{ "type": "emergency_activated", "data": { "direction": "north", "vehicle_type": "ambulance" } }

// Type 4: AI insight ready (every 2 min)
{ "type": "ai_insight", "data": { ...CongestionPrediction } }
```

**Client can send:**
```json
{ "type": "trigger_emergency", "direction": "north", "vehicle_type": "ambulance" }
{ "type": "cancel_emergency" }
{ "type": "set_simulation_speed", "multiplier": 2 }  // 1x, 2x, 5x for demo
```

---

## 9. Frontend — Dashboard

### Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  NAVBAR: Logo · Junction ID · Status Dot · Emergency Button      │
├──────────────────────────┬──────────────────────────────────────┤
│                          │  STATS ROW                           │
│   JUNCTION MAP           │  [Avg Wait] [Vehicles/min] [AI Calls]│
│   (Animated SVG)         ├──────────────────────────────────────┤
│                          │  DENSITY CHART (Recharts line chart) │
│   4 lanes with           │  Live 30-min rolling window          │
│   animated signals       ├──────────────────────────────────────┤
│   and vehicle            │  AI DECISION FEED                    │
│   density bars           │  Last 5 decisions with reasons       │
│                          │                                      │
├──────────────────────────┴──────────────────────────────────────┤
│  BOTTOM ROW: Performance Comparison | AI Insight Card | Log     │
└─────────────────────────────────────────────────────────────────┘
```

### Color System

| Signal State | Color | Tailwind |
|---|---|---|
| Green (active) | `#22c55e` | `bg-green-500` |
| Red (stopped) | `#ef4444` | `bg-red-500` |
| Yellow (transitioning) | `#f59e0b` | `bg-amber-400` |
| Emergency active | `#f97316` pulsing | `bg-orange-500 animate-pulse` |
| High density lane | `#ef4444` bar | `bg-red-400` |
| Medium density | `#f59e0b` bar | `bg-amber-400` |
| Low density | `#22c55e` bar | `bg-green-400` |

---

## 10. Frontend Pages & Components

### Page 1: Live Dashboard (`/`) — PRIMARY VIEW

This is the main screen shown during the demo.

#### Component: `JunctionMap`

The centrepiece of the dashboard. An SVG-based top-down view of a 4-way intersection with:

- Animated traffic signal circles (green/amber/red) for each lane direction
- Vehicle density bars alongside each lane (height = vehicle count)
- Animated moving dots representing vehicles when lane is green
- Emergency overlay: flashing orange border + siren icon when active
- Phase countdown ring showing seconds remaining on current green phase

```
         ┌─────┐
         │  N  │  ← Signal light + density bar
         │ 🟢  │
    ─────┼─────┼─────
 W  🔴   │     │  🔴  E
    ─────┼─────┼─────
         │ 🔴  │
         │  S  │
         └─────┘
```

**Props:**
```typescript
interface JunctionMapProps {
  state: JunctionState;
  onEmergencyTrigger: (direction: string) => void;
}
```

---

#### Component: `StatsRow`

Four metric cards at the top right:

| Card | Value | Notes |
|---|---|---|
| Avg Wait Time | `22.4s` with trend arrow | Compares to last 5 min |
| Vehicles Cleared | `847 / min` | Rolling 1-min count |
| AI Response Time | `187ms` | Last Groq call latency |
| AI Model Active | `Llama 3.1 8B` | Current model in use |

---

#### Component: `DensityChart`

A Recharts `LineChart` with 4 lines (one per lane), rolling 30-minute window. Updates every 5 seconds via WebSocket. Features:

- Real-time streaming — new data point appended, oldest dropped
- Hover tooltip showing exact vehicle count per lane at that timestamp
- Shaded area under the currently-active (green) lane's line
- Reference line marking current time

---

#### Component: `AIDecisionFeed`

A scrolling feed of the last 5–10 AI signal decisions. Each entry shows:

- Timestamp and which phase was selected
- Duration assigned
- The AI's `reason` string in plain English
- Model used (Groq/Gemini/rule-based) with a color badge
- Latency in ms

---

#### Component: `EmergencyPanel`

A collapsible panel (or modal) with:

- Lane selector (North / South / East / West)
- Vehicle type selector (Ambulance / Fire / Police)
- Large "Activate Emergency Priority" button (red, prominent)
- Live status: shows "ACTIVE — North corridor open" when triggered
- Cancel button when active

---

### Page 2: Analytics (`/analytics`)

Deeper performance analytics. Shown during post-demo Q&A.

#### Section: Performance Comparison

Side-by-side comparison cards: AI Adaptive vs Fixed Timing (simulated).

| Metric | Fixed Timing | AI Adaptive | Improvement |
|---|---|---|---|
| Avg wait time | 41.7s | 22.4s | **↓ 46%** |
| Peak wait time | 120.0s | 58.1s | **↓ 52%** |
| Vehicles cleared/hr | 612 | 847 | **↑ 38%** |
| Emergency clearance | 45.0s | 1.8s | **↓ 96%** |

#### Section: Phase Distribution Donut Chart

How much of total session time each lane spent with a green signal.

#### Section: Congestion Heatmap

A time-vs-lane heatmap (x = time, y = lane, color = density). Shows at a glance which lanes were congested and when.

#### Section: AI Decision Log

Full scrollable table of all AI decisions, filterable by model, lane, and time range.

---

### Page 3: AI Insights (`/insights`)

Dedicated view for the Gemini-generated predictions and recommendations.

#### Component: `PredictionCard`

The latest congestion forecast from Gemini 2.5 Flash:

- Risk level badge (Low / Medium / High) with color
- "Peak expected in X minutes on [lane] lane"
- Full recommendation text
- Timestamp of when prediction was generated
- Refresh button (triggers a new Gemini call)

#### Component: `InsightHistory`

Timeline of past predictions, showing whether they were accurate (post-hoc comparison with actual data).

---

### Page 4: Settings (`/settings`) — optional, low priority

- Simulation speed: 1x / 2x / 5x slider
- Toggle: use AI optimization vs fixed timing (for comparison demo)
- API key status indicators (Groq ✓ / Gemini ✓ / OpenRouter ✓)
- Reset simulation button

---

### Frontend State Management (Zustand)

```typescript
interface JunctionStore {
  // Live state
  junctionState: JunctionState | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  
  // History
  densityHistory: DensityDataPoint[];  // last 360 points = 30 min at 5s
  decisionLog: AIDecision[];           // last 100 decisions
  insightLog: CongestionPrediction[];  // last 10 predictions
  
  // Emergency
  emergencyActive: boolean;
  emergencyDirection: string | null;
  
  // Analytics
  performanceStats: PerformanceMetrics | null;
  
  // Actions
  setJunctionState: (state: JunctionState) => void;
  appendDensityPoint: (point: DensityDataPoint) => void;
  triggerEmergency: (direction: string, vehicleType: string) => void;
  cancelEmergency: () => void;
}
```

---

### WebSocket Hook

```typescript
// hooks/useJunctionWebSocket.ts
export function useJunctionWebSocket() {
  const store = useJunctionStore();
  
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case 'state_update':
          store.setJunctionState(msg.data);
          store.appendDensityPoint(extractDensityPoint(msg.data));
          break;
        case 'emergency_activated':
          store.setEmergencyActive(true, msg.data.direction);
          toast.error(`🚨 Emergency: ${msg.data.vehicle_type} on ${msg.data.direction} lane`);
          break;
        case 'ai_insight':
          store.addInsight(msg.data);
          break;
      }
    };
    
    return () => ws.close();
  }, []);
}
```

---

## 11. ML Modules

### Module 1: Signal Optimizer (Groq)

**Input:** Current lane vehicle counts, current phase, elapsed time, emergency flag  
**Output:** Next phase, duration in seconds, reason string  
**Call frequency:** Every 5 seconds (cached for 5s if state unchanged)  
**Fallback:** Density-weighted greedy algorithm (pure Python, zero latency)

**Prompt template:**
```
System: You are a traffic signal controller AI. Always respond with valid JSON only. No explanation outside the JSON.

User: Junction state:
- North lane: {n} vehicles ({n_pct}% density)
- South lane: {s} vehicles ({s_pct}% density)
- East lane:  {e} vehicles ({e_pct}% density)
- West lane:  {w} vehicles ({w_pct}% density)
- Current green phase: {current_phase} (active for {elapsed}s)
- Emergency vehicle: {emergency}
- Time of day: {time}

Decide the next signal phase. Respond with JSON:
{{"phase": "north|south|east|west", "duration_seconds": <15-60>, "reason": "<one sentence>"}}
```

---

### Module 2: Congestion Predictor (Gemini)

**Input:** 30-minute density history array  
**Output:** Risk level, predicted peak, recommendation, summary  
**Call frequency:** Every 2 minutes (not time-critical)  
**Model:** `gemini-2.5-flash`

---

### Module 3: Traffic Simulation Engine

The simulation generates realistic data without real sensors. Key behaviors:

- **Rush hour peaks:** Vehicle counts spike 3–4x at 08:00–10:00 and 17:00–19:30
- **Lane asymmetry:** Different lanes have different base loads (e.g., north heavier in morning)
- **Green drain:** When a lane has green, its count decreases at `green_drain_rate`
- **Red accumulation:** When a lane is red, its count increases at `red_accumulation_rate`
- **Random events:** Occasional spike (simulates an accident or large vehicle group)

---

## 12. Emergency Vehicle Priority System

### Trigger Flow

```
Emergency triggered (UI button or API call)
         │
         ▼
  Set emergency_active = True
  Set emergency_direction = "north"
         │
         ▼
  Override signal optimizer — bypass AI decision
         │
         ▼
  Force current phase = emergency_direction (GREEN)
  Force all other phases = RED
         │
         ▼
  Broadcast "emergency_activated" via WebSocket
         │
         ▼
  Dashboard: orange pulsing overlay, siren icon
         │
         ▼
  After duration_override_seconds (default: 120s)
  OR manual cancel:
         │
         ▼
  Resume AI-optimized control
  Resume from highest-density lane
```

### Green Corridor Logic

For multi-junction demo (stretch goal): if a vehicle is travelling North through multiple junctions, all North signals along the route turn green preemptively, creating a "green wave."

---

## 13. Work Breakdown & Timeline

### Hour-by-hour breakdown

| Hours | Milestone | Owner |
|---|---|---|
| 0–1 | Repo setup, project scaffold, env vars, agree on data contracts | All |
| 1–4 | Simulation engine running, FastAPI skeleton up, WebSocket working | Backend 1 |
| 1–4 | React app, Tailwind, Zustand store, WebSocket hook wired | Frontend 1 |
| 4–8 | Groq signal optimizer integrated, `/api/junction/state` working | Backend 1 |
| 4–8 | Junction SVG map component with animated signals | Frontend 1 |
| 8–12 | Gemini predictor, `/api/ai/prediction`, analytics endpoints | Backend 2 |
| 8–12 | DensityChart live, StatsRow, AIDecisionFeed components | Frontend 2 |
| 12–16 | Emergency preemption API + WebSocket events | Backend 2 |
| 12–16 | EmergencyPanel UI, performance comparison section | Frontend 2 |
| 16–19 | SQLite logging, decision log endpoint, OpenRouter fallback | Backend 1+2 |
| 16–19 | Analytics page, AI insights page, phase distribution chart | Frontend 1+2 |
| 19–22 | Full integration testing, bug fixes, demo data seeding | All |
| 22–23 | Demo script rehearsal, talking points, edge case fixes | All |
| 23–24 | Slides, final polish, backup plan if API goes down | All |

---

## 14. Team Responsibilities

### Person 1 — ML + Backend Core

- `simulation/engine.py` — traffic simulation loop
- `ai/signal_optimizer.py` — Groq integration + fallback
- `routes/junction.py` — state and history endpoints
- WebSocket broadcaster
- Performance metrics calculation

### Person 2 — Backend Integration + AI

- `ai/predictor.py` — Gemini congestion predictor
- `routes/emergency.py` — emergency preemption endpoints
- `routes/analytics.py` — analytics endpoints
- `database/` — SQLite schema + logging
- OpenRouter fallback integration

### Person 3 — Frontend Core

- App scaffold (Vite + React + Tailwind setup)
- `JunctionMap` SVG component with animations
- `DensityChart` (Recharts) with WebSocket feed
- Zustand store + WebSocket hook
- Routing (React Router: `/`, `/analytics`, `/insights`)

### Person 4 — Frontend UX + Integration

- `StatsRow`, `AIDecisionFeed`, `EmergencyPanel`
- Analytics page components
- AI Insights page
- REST API integration (Axios calls to all endpoints)
- Demo polish: toast notifications, loading states, error handling
- Demo script and presentation slides

---

## 15. Environment Variables & Setup

### Backend `.env`

```bash
# AI APIs
GROQ_API_KEY=gsk_...              # console.groq.com — free, no card
GOOGLE_AI_API_KEY=AIza...         # aistudio.google.com — free, no card  
OPENROUTER_API_KEY=sk-or-...      # openrouter.ai — free, no card
ANTHROPIC_API_KEY=sk-ant-...      # optional — $5 free credit on signup

# Models
GROQ_PRIMARY_MODEL=llama-3.1-8b-instant
GROQ_ANALYSIS_MODEL=llama-3.3-70b-versatile
GEMINI_MODEL=gemini-2.5-flash
OPENROUTER_FALLBACK_MODEL=deepseek/deepseek-chat:free

# Config
SIMULATION_SPEED_MULTIPLIER=1
DATABASE_URL=sqlite:///./junction.db
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

### Frontend `.env`

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

### Quick Start

```bash
# Backend
cd backend
pip install fastapi uvicorn groq google-generativeai openai sqlalchemy python-dotenv
cp .env.example .env  # fill in API keys
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install tailwindcss recharts zustand axios lucide-react react-router-dom
npm run dev
```

---

