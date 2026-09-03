"""
Real-Time ANN Inference Engine for Adaptive Traffic Signal Optimization.
Provides:
- Sub-2ms PyTorch forward pass execution
- Dynamic Explainable AI (XAI) feature importance attribution
- Layer-by-layer neural activation extraction for interactive frontend visualization
- Autonomous weight loading and startup initialization
"""

import os
import time
import json
import torch
import numpy as np
from typing import Dict, Any, List, Optional
from simulation.models import JunctionState, AIDecision
try:
    from ai.ann_model import TrafficOptimizationANN, NUM_FEATURES, FEATURE_NAMES, PHASE_NAMES, RISK_LEVELS
    from ai.dataset_generator import SCALER_PATH
    from ai.ann_trainer import MODEL_PATH, train_model, WEIGHTS_DIR, METRICS_PATH
except ImportError:
    try:
        from .ann_model import TrafficOptimizationANN, NUM_FEATURES, FEATURE_NAMES, PHASE_NAMES, RISK_LEVELS
        from .dataset_generator import SCALER_PATH
        from .ann_trainer import MODEL_PATH, train_model, WEIGHTS_DIR, METRICS_PATH
    except ImportError:
        from ann_model import TrafficOptimizationANN, NUM_FEATURES, FEATURE_NAMES, PHASE_NAMES, RISK_LEVELS
        from dataset_generator import SCALER_PATH
        from ann_trainer import MODEL_PATH, train_model, WEIGHTS_DIR, METRICS_PATH


class TrafficANNInferenceEngine:
    def __init__(self):
        self.model: Optional[TrafficOptimizationANN] = None
        self.scaler: Optional[Dict] = None
        self.device = torch.device("cpu") # CPU is optimal for sub-millisecond single batch inference
        self.initialized = False
        self._ensure_model_ready()

    def _ensure_model_ready(self):
        """Ensures scaler and model weights are trained and loaded into memory."""
        try:
            if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
                print("Trained ANN weights not found. Initiating baseline training...")
                train_model(epochs=30, learning_rate=0.003, batch_size=64)
                
            with open(SCALER_PATH, "r") as f:
                self.scaler = json.load(f)
                
            self.model = TrafficOptimizationANN(input_dim=NUM_FEATURES)
            self.model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device))
            self.model.to(self.device)
            self.model.eval()
            self.initialized = True
            print("TrafficOptimizationANN successfully loaded into memory.")
        except Exception as e:
            print(f"Error loading ANN model: {e}")
            self.initialized = False

    def extract_feature_vector(self, state: JunctionState) -> np.ndarray:
        """
        Extracts the 14-dimensional feature vector from the live JunctionState.
        """
        counts = [
            state.lanes["north"].vehicle_count,
            state.lanes["south"].vehicle_count,
            state.lanes["east"].vehicle_count,
            state.lanes["west"].vehicle_count
        ]
        waits = [
            state.lanes["north"].avg_wait_seconds,
            state.lanes["south"].avg_wait_seconds,
            state.lanes["east"].avg_wait_seconds,
            state.lanes["west"].avg_wait_seconds
        ]
        densities = [
            state.lanes["north"].density_percent,
            state.lanes["south"].density_percent,
            state.lanes["east"].density_percent,
            state.lanes["west"].density_percent
        ]
        emerg = 1.0 if state.emergency_active else 0.0
        
        # Approximate cyclical peak factor from active total vehicles
        total_veh = sum(counts)
        peak_factor = min(1.0, max(0.1, total_veh / 80.0))
        
        raw_vector = np.array(counts + waits + densities + [emerg, peak_factor], dtype=np.float32)
        return raw_vector

    def standardize_features(self, raw_vector: np.ndarray) -> np.ndarray:
        if not self.scaler:
            return raw_vector
        feature_cols = self.scaler["feature_names"]
        means = np.array([self.scaler["mean"][col] for col in feature_cols], dtype=np.float32)
        stds = np.array([self.scaler["std"][col] for col in feature_cols], dtype=np.float32)
        return (raw_vector - means) / stds

    def compute_saliency_attributions(self, x_tensor: torch.Tensor, target_phase_idx: int) -> List[Dict[str, Any]]:
        r"""
        Calculates Explainable AI (XAI) feature importance using input-gradient sensitivity analysis:
        S_i = | \frac{\partial y_{target}}{\partial x_i} * x_i |
        """
        x_clone = x_tensor.clone().detach().requires_grad_(True)
        pred_phase, _, _ = self.model(x_clone)
        score = pred_phase[0, target_phase_idx]
        score.backward()
        
        gradients = x_clone.grad.detach().cpu().numpy().flatten()
        input_vals = x_tensor.detach().cpu().numpy().flatten()
        
        attributions = np.abs(gradients * input_vals)
        total_attr = np.sum(attributions) + 1e-8
        norm_attributions = (attributions / total_attr) * 100.0
        
        saliency_list = []
        for i, (name, val, score_pct) in enumerate(zip(FEATURE_NAMES, input_vals, norm_attributions)):
            saliency_list.append({
                "feature": name,
                "importance_percent": round(float(score_pct), 1),
                "index": i
            })
            
        saliency_list.sort(key=lambda x: x["importance_percent"], reverse=True)
        return saliency_list

    def predict(self, state: JunctionState) -> AIDecision:
        """
        Runs neural inference for real-time traffic signal optimization.
        """
        if not self.initialized:
            self._ensure_model_ready()
            
        if not self.initialized or self.model is None:
            # Fallback to rule if loading failed
            return self._emergency_or_fallback(state)
            
        # Emergency vehicle manual override
        if state.emergency_active and state.emergency_direction:
            return AIDecision(
                recommended_phase=state.emergency_direction,
                duration_seconds=60,
                reason=f"Emergency Preemption Corridor: Prioritizing {state.emergency_direction.upper()} lane.",
                confidence=1.0,
                model_used="Emergency-ANN-Override",
                latency_ms=0
            )

        start_time = time.perf_counter()
        
        # 1. Feature Preprocessing
        raw_feat = self.extract_feature_vector(state)
        scaled_feat = self.standardize_features(raw_feat)
        x_tensor = torch.tensor(scaled_feat, dtype=torch.float32, device=self.device).unsqueeze(0)
        
        # 2. Forward Propagation
        self.model.eval()
        with torch.no_grad():
            phase_logits, timing_output, risk_logits = self.model(x_tensor)
            
        latency_ms = max(1, int((time.perf_counter() - start_time) * 1000.0))
        
        # 3. Post-Processing
        phase_probs = torch.softmax(phase_logits, dim=1).cpu().numpy().flatten()
        best_phase_idx = int(np.argmax(phase_probs))
        recommended_phase = PHASE_NAMES[best_phase_idx]
        confidence = float(phase_probs[best_phase_idx])
        
        predicted_durations = timing_output.cpu().numpy().flatten()
        duration_seconds = int(np.clip(predicted_durations[best_phase_idx], 15, 60))
        
        risk_probs = torch.softmax(risk_logits, dim=1).cpu().numpy().flatten()
        risk_idx = int(np.argmax(risk_probs))
        congestion_risk = RISK_LEVELS[risk_idx]
        
        # 4. Explainable AI Feature Attribution
        try:
            saliency = self.compute_saliency_attributions(x_tensor, best_phase_idx)
            top_factors = [f"{s['feature']} ({s['importance_percent']}%)" for s in saliency[:2]]
            reason_text = (
                f"ANN Neural Choice: {recommended_phase.upper()} lane selected ({int(confidence*100)}% conf). "
                f"Key factors: {', '.join(top_factors)}."
            )
        except Exception:
            reason_text = (
                f"ANN Neural Choice: {recommended_phase.upper()} lane selected ({int(confidence*100)}% confidence). "
                f"Allocated {duration_seconds}s green duration."
            )
            
        decision = AIDecision(
            recommended_phase=recommended_phase,
            duration_seconds=duration_seconds,
            reason=reason_text,
            confidence=round(confidence, 3),
            model_used="TrafficOptimizationANN (PyTorch MLP)",
            latency_ms=latency_ms
        )
        return decision

    def get_latest_activations(self) -> Dict[str, Any]:
        """Returns the internal layer activations from the most recent forward pass."""
        if self.model and hasattr(self.model, "latest_activations"):
            return self.model.latest_activations
        return {}

    def _emergency_or_fallback(self, state: JunctionState) -> AIDecision:
        # Fallback greedy rule
        lane_scores = {
            lane: state.lanes[lane].vehicle_count * (1.0 + state.lanes[lane].avg_wait_seconds / 20.0)
            for lane in state.lanes
        }
        best_lane = max(lane_scores, key=lane_scores.get)
        return AIDecision(
            recommended_phase=best_lane,
            duration_seconds=30,
            reason=f"Rule Fallback: {best_lane} selected by wait-weighted density.",
            confidence=0.75,
            model_used="rule-based-fallback",
            latency_ms=1
        )


# Global Singleton Instance
ann_engine = TrafficANNInferenceEngine()
