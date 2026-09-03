"""
Traffic Dataset Generator for Artificial Neural Network Training.
Generates 15,000+ realistic traffic scenarios across diverse traffic conditions:
- Balanced Off-Peak Traffic
- Morning Rush Hour (Heavy North-South Corridor)
- Evening Rush Hour (Heavy East-West Flow)
- Asymmetric Bottlenecks & Gridlocks
- Inclement Weather / Monsoon Delay Scenarios
- Emergency Vehicle Preemption Runs

Calculates optimal signal phasing and duration targets using Webster's Traffic Delay Minimization Formulation.
"""

import os
import json
import numpy as np
import pandas as pd
from typing import Tuple, Dict

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DATASET_PATH = os.path.join(DATA_DIR, "traffic_ann_dataset.csv")
SCALER_PATH = os.path.join(DATA_DIR, "scaler_params.json")

LANES = ["north", "south", "east", "west"]
MAX_VEHICLES = 100.0


def compute_webster_optimal_phase_and_timing(
    counts: np.ndarray, 
    waits: np.ndarray, 
    densities: np.ndarray, 
    emergency_flag: float, 
    peak_factor: float
) -> Tuple[int, np.ndarray, int]:
    """
    Computes theoretical optimal ground-truth target using Webster's Formula & Starvation Prevention.
    
    Returns:
      best_phase_idx: 0 (N), 1 (S), 2 (E), 3 (W)
      timings: 4-element array of optimal green allocations in seconds [15s - 60s]
      risk_level: 0 (Low), 1 (Medium), 2 (High)
    """
    # Emergency Override Priority
    if emergency_flag > 0.5:
        # If emergency active, whichever lane has max urgency gets immediate max phase
        best_phase_idx = int(np.argmax(counts + waits * 0.5))
        timings = np.array([15.0, 15.0, 15.0, 15.0])
        timings[best_phase_idx] = 60.0
        return best_phase_idx, timings, 2
        
    # Pressure Score = Vehicle Density + Non-linear Wait Time Factor (to avoid starvation)
    # Webster's delay index: weight wait times heavily as average delay increases
    pressure_scores = counts * (1.0 + (waits / 25.0)**1.2) + (densities * 0.3)
    best_phase_idx = int(np.argmax(pressure_scores))
    
    # Webster's cycle split calculation
    total_pressure = np.sum(pressure_scores) + 1e-6
    cycle_length = 60.0 + 60.0 * min(1.0, (np.sum(counts) / 120.0) * (1.0 + 0.3 * peak_factor))
    
    # Proportional green split with bounds [15s, 60s]
    timings = np.zeros(4)
    for i in range(4):
        ratio = pressure_scores[i] / total_pressure
        green_time = 15.0 + ratio * (cycle_length - 4 * 15.0)
        timings[i] = float(np.clip(green_time, 15.0, 60.0))
        
    # Congestion Risk Classification
    max_density = np.max(densities)
    avg_density = np.mean(densities)
    if max_density > 75.0 or avg_density > 55.0:
        risk_level = 2 # High
    elif max_density > 45.0 or avg_density > 30.0:
        risk_level = 1 # Medium
    else:
        risk_level = 0 # Low
        
    return best_phase_idx, timings, risk_level


def generate_synthetic_traffic_dataset(num_samples: int = 16000, seed: int = 42) -> pd.DataFrame:
    """
    Synthesizes diverse, high-entropy junction scenarios.
    """
    np.random.seed(seed)
    records = []
    
    # Scenario breakdown:
    # 30% Balanced off-peak
    # 25% Morning Rush (North-South biased)
    # 25% Evening Rush (East-West biased)
    # 10% Gridlock & Bottlenecks
    # 5% Inclement Weather / High Delay
    # 5% Emergency Vehicle Approaches
    
    for i in range(num_samples):
        scenario_type = np.random.choice(
            ["balanced", "morning_rush", "evening_rush", "gridlock", "storm", "emergency"],
            p=[0.30, 0.25, 0.25, 0.10, 0.05, 0.05]
        )
        
        emergency_flag = 0.0
        peak_factor = 0.2
        
        if scenario_type == "balanced":
            counts = np.random.randint(2, 25, size=4)
            waits = np.random.uniform(2.0, 25.0, size=4)
            peak_factor = np.random.uniform(0.1, 0.4)
            
        elif scenario_type == "morning_rush":
            counts = np.array([
                np.random.randint(35, 90), # North heavy
                np.random.randint(30, 80), # South heavy
                np.random.randint(5, 25),  # East light
                np.random.randint(5, 20)   # West light
            ])
            waits = counts * np.random.uniform(0.8, 1.6, size=4)
            peak_factor = np.random.uniform(0.7, 1.0)
            
        elif scenario_type == "evening_rush":
            counts = np.array([
                np.random.randint(5, 20),
                np.random.randint(5, 25),
                np.random.randint(35, 95), # East heavy
                np.random.randint(30, 85)  # West heavy
            ])
            waits = counts * np.random.uniform(0.8, 1.6, size=4)
            peak_factor = np.random.uniform(0.7, 1.0)
            
        elif scenario_type == "gridlock":
            counts = np.random.randint(60, 98, size=4)
            waits = np.random.uniform(40.0, 150.0, size=4)
            peak_factor = 1.0
            
        elif scenario_type == "storm":
            counts = np.random.randint(20, 60, size=4)
            # Weather increases waiting time significantly due to slower speeds
            waits = np.random.uniform(50.0, 160.0, size=4)
            peak_factor = 0.6
            
        elif scenario_type == "emergency":
            counts = np.random.randint(10, 50, size=4)
            waits = np.random.uniform(10.0, 40.0, size=4)
            emergency_flag = 1.0
            peak_factor = 0.5
            
        densities = (counts / MAX_VEHICLES) * 100.0
        
        target_phase, target_timings, target_risk = compute_webster_optimal_phase_and_timing(
            counts, waits, densities, emergency_flag, peak_factor
        )
        
        row = {
            "north_count": counts[0],
            "south_count": counts[1],
            "east_count": counts[2],
            "west_count": counts[3],
            "north_wait": round(float(waits[0]), 2),
            "south_wait": round(float(waits[1]), 2),
            "east_wait": round(float(waits[2]), 2),
            "west_wait": round(float(waits[3]), 2),
            "north_density": round(float(densities[0]), 2),
            "south_density": round(float(densities[1]), 2),
            "east_density": round(float(densities[2]), 2),
            "west_density": round(float(densities[3]), 2),
            "emergency_active": emergency_flag,
            "peak_factor": round(float(peak_factor), 2),
            # Targets
            "target_phase": target_phase,
            "target_timing_north": round(float(target_timings[0]), 2),
            "target_timing_south": round(float(target_timings[1]), 2),
            "target_timing_east": round(float(target_timings[2]), 2),
            "target_timing_west": round(float(target_timings[3]), 2),
            "target_risk": target_risk,
            "scenario": scenario_type
        }
        records.append(row)
        
    df = pd.DataFrame(records)
    return df


def generate_and_save_dataset():
    """Generates dataset, computes mean/std normalization parameters, and persists to disk."""
    os.makedirs(DATA_DIR, exist_ok=True)
    
    print(f"Generating 16,000 synthetic traffic junction scenarios...")
    df = generate_synthetic_traffic_dataset(num_samples=16000)
    df.to_csv(DATASET_PATH, index=False)
    print(f"Dataset successfully saved to: {DATASET_PATH}")
    
    feature_cols = [
        "north_count", "south_count", "east_count", "west_count",
        "north_wait", "south_wait", "east_wait", "west_wait",
        "north_density", "south_density", "east_density", "west_density",
        "emergency_active", "peak_factor"
    ]
    
    means = df[feature_cols].mean().to_dict()
    stds = df[feature_cols].std().to_dict()
    
    # Avoid zero division
    for k in stds:
        if stds[k] < 1e-6:
            stds[k] = 1.0
            
    scaler_params = {
        "mean": means,
        "std": stds,
        "feature_names": feature_cols
    }
    
    with open(SCALER_PATH, "w") as f:
        json.dump(scaler_params, f, indent=2)
    print(f"Standardization parameters saved to: {SCALER_PATH}")
    
    return df, scaler_params


if __name__ == "__main__":
    generate_and_save_dataset()
