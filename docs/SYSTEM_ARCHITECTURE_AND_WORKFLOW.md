# System Architecture & Technical Workflow

## High-Level System Workflow Diagram

```mermaid
sequenceDiagram
    autonumber
    participant Sensor as IoT & Radar Sensors
    participant Preprocessor as Normalization Engine
    participant PyTorch as Deep ANN Model (PyTorch)
    participant Controller as 4-Stage State Machine
    participant Simulator as 60FPS Physics Engine
    participant WebSocket as Real-Time WS Broadcaster
    participant UI as Dashboard & ANN Studio

    loop Every 1 Second Tick
        Simulator->>Sensor: Read Vehicle Counts, Waiting Times & Queue Densities
        Sensor->>Preprocessor: Raw 14-D Vector [Counts, Waits, Densities, Emerg, Peak]
        Preprocessor->>PyTorch: Standardized Input Tensor (Z-score normalized)
        
        alt Signal Green Timer Expired or Early Clearance
            PyTorch->>PyTorch: Forward Pass (14 -> 128 -> 64 -> 32 -> 3 Heads)
            PyTorch->>Controller: Predicted Phase [N,S,E,W] & Duration (15-60s)
            Controller->>Controller: Advance Phase: GREEN -> YELLOW (3s) -> ALL-RED (2s) -> NEXT GREEN
        end
        
        Simulator->>Simulator: Update Vehicle Queues, Accelerations, tailling lights
        Simulator->>WebSocket: Broadcast State JSON + Neural Activations
        WebSocket->>UI: Render 60fps Canvas + Update Synaptic Visualizer
    end
```

---

## 4-Stage Signal Phasing State Machine

```mermaid
stateDiagram-v2
    [*] --> GreenPhase
    
    state GreenPhase {
        [*] --> ServingVehicles: Dynamic Duration (15s - 60s)
        ServingVehicles --> CheckEarlyExit: Queue Emptied Early (min 10s served)
    }
    
    GreenPhase --> YellowClearance: Timer Expired OR Emergency Detected
    
    state YellowClearance {
        [*] --> AmberWarning: 3 Seconds Fixed Dilemma Clearance
    }
    
    YellowClearance --> AllRedSafety: 3s Completed
    
    state AllRedSafety {
        [*] --> IntersectionEmpty: 2 Seconds Complete Stop
    }
    
    AllRedSafety --> SwitchGreen: 2s Completed
    
    state SwitchGreen {
        [*] --> ActivateNextPhase: Next Optimal Phase Determined by ANN
    }
    
    SwitchGreen --> GreenPhase: New Phase Started
```

---

## Core Components Summary

1. **`backend/ai/ann_model.py`:** PyTorch Multi-Task MLP architecture + NumPy reference engine.
2. **`backend/ai/dataset_generator.py`:** Webster delay minimization synthetic data generator.
3. **`backend/ai/ann_trainer.py`:** Training loop with Adam/SGD/RMSProp, loss curves, confusion matrix, and evaluation metrics.
4. **`backend/ai/ann_inference.py`:** Sub-2ms forward pass engine with input-gradient Explainable AI (XAI).
5. **`backend/simulation/engine.py`:** 4-stage signal controller with scenario injection and dual-benchmark counters.
6. **`frontend/src/components/JunctionCanvas.tsx`:** 60fps HTML5 Canvas traffic simulation with car physics and glowing 3-bulb signals.
7. **`frontend/src/pages/ANNStudioPage.tsx`:** Interactive neural network topology visualizer, training workbench, confusion matrix, and viva theory.
8. **`frontend/src/components/BenchmarkComparator.tsx`:** Real-time side-by-side benchmark comparison deck.
