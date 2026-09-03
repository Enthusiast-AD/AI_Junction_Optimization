# AI Junction Optimization System

A real-time, interactive, AI-driven traffic simulation and optimization platform designed for 24-hour hackathons. This system dynamically manages a 4-way traffic junction, actively adjusting signal phases based on simulated vehicle density, and utilizes Generative AI to provide smart recommendations and insights.

## Project Overview

Traffic signals at road junctions typically operate on fixed pre-programmed timing cycles, often causing unnecessary waiting, emergency vehicle delays, and cascading congestion.

This project offers an AI-based junction management system that:
- **Simulates** real-time vehicle density per lane.
- **Optimizes** signal phase and duration dynamically using an LLM-powered decision engine (Groq Llama 3.1 8B).
- **Predicts** congestion 5–15 minutes ahead using pattern analysis (Gemini 2.5 Flash).
- **Prioritizes** emergency vehicles with an instant green-corridor override.
- **Displays** live signals, density charts, and AI insights on a real-time dashboard.

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────┐   │
│  │ Simulation Engine│  │ Emergency Trigger│  │Historical Data│   │
│  │ (Python thread)  │  │ (Manual / Auto)  │  │ (SQLite logs) │   │
│  └────────┬─────────┘  └────────┬────────┘  └───────┬───────┘   │
└───────────┼────────────────────┼───────────────────┼────────────┘
            │                    │                   │
┌───────────┼────────────────────┼───────────────────┼────────────┐
│                          AI CORE                                │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌───────▼───────┐    │
│  │ Signal Optimizer│  │ Emergency       │  │ Congestion    │    │
│  │ (Groq/Llama)    │  │ Preemption      │  │ Predictor     │    │
│  │                 │  │ Logic           │  │ (Gemini Flash)│    │
│  └────────┬────────┘  └────────┬────────┘  └───────┬───────┘    │
│           └──────────────┬─────┘                   │            │
│                  ┌───────▼─────────────────────┐   │            │
│                  │   FastAPI + WebSocket Server│◄──┘            │
│                  └───────┬─────────────────────┘                │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                       OUTPUT LAYER                              │
│  ┌──────────────────┐  ┌─────────────────┐  ┌───────────────┐   │
│  │  Live Dashboard  │  │  Signal Commands│  │  Alert Feed   │   │
│  │  (React + Vite)  │  │  (Phase/Duration)│  │  + AI Logs    │   │
│  └──────────────────┘  └─────────────────┘  └───────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Backend
- **API Framework:** FastAPI (Python 3.11+)
- **WebSocket:** FastAPI WebSocket / `websockets`
- **Database:** SQLite + SQLAlchemy
- **Task Scheduling:** `asyncio` background tasks
- **AI Clients:** `groq` Python SDK + `google-genai`

### Frontend
- **Framework:** React 18 + Vite (TypeScript)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **State Management:** Zustand
- **Real-Time Data:** Native WebSocket API
- **Icons:** Lucide React

## Project Structure

```text
junctionOptimization/
├── backend/                   # FastAPI Backend
│   ├── ai/                    # ML Modules (Signal Optimizer, Predictor)
│   ├── database/              # SQLite & SQLAlchemy models
│   ├── routes/                # API Endpoints
│   ├── simulation/            # Traffic Simulation Engine
│   ├── websocket/             # WebSocket Manager
│   ├── config.py              # Settings & Env vars loading
│   ├── main.py                # FastAPI app entry point
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React + Vite Frontend
│   ├── public/                # Static assets
│   ├── src/                   # React Application Source
│   │   ├── assets/            
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom hooks (WebSockets integration)
│   │   ├── pages/             # Route pages
│   │   ├── store/             # Zustand state stores
│   │   ├── types/             # TypeScript interfaces
│   │   ├── utils/             # Helper functions
│   │   ├── App.tsx            # Main App component
│   │   └── main.tsx           # Entry point
│   ├── .env                   # Frontend Environment Variables
│   ├── index.html             # Vite Entry HTML
│   ├── package.json           # Node dependencies
│   ├── tailwind.config.js     # Tailwind CSS Configuration
│   ├── tsconfig.json          # TypeScript Configuration
│   └── vite.config.ts         # Vite Configuration
└── docs/                      # Documentation
    ├── PRD.md                 # Product Requirements Document
    └── Script.md              # Demo/Pitch scripts
```

## Getting Started

### 1. Backend Setup

Open a terminal and navigate to the `backend` folder:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

Required Backend Environment Variables (`backend/.env`):
```dotenv
DATABASE_URL=sqlite:///./junction.db
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key
PORT=8000
```

### 2. Frontend Setup

Open a new terminal and navigate to the `frontend` folder:

```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```

Required Frontend Environment Variables (`frontend/.env`):
```dotenv
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## Success Metrics & Features

- **Dynamic Lane Priority:** Replaces fixed timings with LLM-evaluated optimal green durations.
- **Emergency Priority Corridor:** < 2-second response time from trigger to green corridor.
- **Congestion Forecasts:** Evaluates history to provide active alerts on potential bottlenecks.
- **Explainable AI:** Every signal decision includes a natural language reason string visible on the dashboard.
- **Real-Time Data Feed:** 5-second updates driving visual changes instantly to the React frontend.