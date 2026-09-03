"""
Artificial Neural Network (ANN) Architecture for Traffic Signal Optimization.
Includes:
1. PyTorch Multi-Task Deep MLP (TrafficOptimizationANN)
2. Layer Activation Hook Manager for Real-time Explainability (XAI)
3. Pure NumPy Reference Implementation for Mathematical Viva Demonstration
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Dict, List, Tuple, Optional

# Feature Dimension Definition
NUM_FEATURES = 14
# Feature Indices:
# 0-3:   Vehicle counts (North, South, East, West)
# 4-7:   Average wait times in seconds (North, South, East, West)
# 8-11:  Density percentages (North, South, East, West)
# 12:    Emergency active indicator (0.0 or 1.0)
# 13:    Cyclical Time-of-Day / Peak Hour Factor (0.0 to 1.0)

FEATURE_NAMES = [
    "North Vehicle Count", "South Vehicle Count", "East Vehicle Count", "West Vehicle Count",
    "North Avg Wait (s)", "South Avg Wait (s)", "East Avg Wait (s)", "West Avg Wait (s)",
    "North Density (%)", "South Density (%)", "East Density (%)", "West Density (%)",
    "Emergency Active Flag", "Time-of-Day Peak Factor"
]

PHASE_NAMES = ["north", "south", "east", "west"]
RISK_LEVELS = ["low", "medium", "high"]


class TrafficOptimizationANN(nn.Module):
    """
    Multi-Task Deep Artificial Neural Network (MLP) for Adaptive Traffic Control.
    
    Architecture:
      Input Layer: 14 Neurons
      Hidden Layer 1: 128 Neurons + BatchNorm1d + ReLU + Dropout(0.2)
      Hidden Layer 2: 64 Neurons + BatchNorm1d + LeakyReLU(0.1) + Dropout(0.15)
      Hidden Layer 3: 32 Neurons + ReLU
      
      Multi-Task Output Heads:
        1. Phase Classifier Head: 32 -> 4 (Softmax) -> Categorical distribution over next phase
        2. Green Timing Regressor Head: 32 -> 4 (Softplus/ReLU) -> Optimal green duration per lane (seconds)
        3. Congestion Risk Forecaster Head: 32 -> 3 (Softmax) -> Congestion risk level (Low, Med, High)
    """
    def __init__(self, input_dim: int = NUM_FEATURES, dropout_rate: float = 0.2, activation_type: str = "relu"):
        super(TrafficOptimizationANN, self).__init__()
        
        self.input_dim = input_dim
        self.dropout_rate = dropout_rate
        self.activation_type = activation_type.lower()
        
        # Shared Feature Extractor Backbone
        self.fc1 = nn.Linear(input_dim, 128)
        self.bn1 = nn.BatchNorm1d(128)
        self.dropout1 = nn.Dropout(p=dropout_rate)
        
        self.fc2 = nn.Linear(128, 64)
        self.bn2 = nn.BatchNorm1d(64)
        self.dropout2 = nn.Dropout(p=dropout_rate * 0.75)
        
        self.fc3 = nn.Linear(64, 32)
        
        # Task 1: Phase Classification Head (Which lane gets green?)
        self.head_phase = nn.Linear(32, 4)
        
        # Task 2: Timing Regression Head (How many seconds of green light? [15s - 60s])
        self.head_timing = nn.Linear(32, 4)
        
        # Task 3: Congestion Risk Classification Head (Low/Med/High)
        self.head_risk = nn.Linear(32, 3)
        
        # Store intermediate layer activations for real-time visualization (XAI)
        self.latest_activations: Dict[str, list] = {}

    def _apply_activation(self, x: torch.Tensor, act_type: Optional[str] = None) -> torch.Tensor:
        act = act_type or self.activation_type
        if act == "leaky_relu":
            return F.leaky_relu(x, negative_slope=0.1)
        elif act == "tanh":
            return torch.tanh(x)
        elif act == "sigmoid":
            return torch.sigmoid(x)
        elif act == "elu":
            return F.elu(x)
        else: # default relu
            return F.relu(x)

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Forward Propagation Pass.
        
        Args:
            x: Input tensor of shape (batch_size, 14)
            
        Returns:
            phase_logits: (batch_size, 4)
            timing_output: (batch_size, 4) in range [15.0, 60.0] seconds
            risk_logits: (batch_size, 3)
        """
        # Hidden Layer 1
        z1 = self.fc1(x)
        z1_bn = self.bn1(z1) if x.size(0) > 1 else z1
        a1 = self._apply_activation(z1_bn)
        a1_drop = self.dropout1(a1)
        
        # Hidden Layer 2
        z2 = self.fc2(a1_drop)
        z2_bn = self.bn2(z2) if x.size(0) > 1 else z2
        a2 = self._apply_activation(z2_bn, act_type="leaky_relu" if self.activation_type == "relu" else self.activation_type)
        a2_drop = self.dropout2(a2)
        
        # Hidden Layer 3
        z3 = self.fc3(a2_drop)
        a3 = self._apply_activation(z3)
        
        # Store activations for single-instance inference inspection
        if not self.training and x.size(0) == 1:
            self.latest_activations = {
                "input": x.detach().cpu().numpy().flatten().tolist(),
                "layer1_act": a1.detach().cpu().numpy().flatten().tolist(),
                "layer2_act": a2.detach().cpu().numpy().flatten().tolist(),
                "layer3_act": a3.detach().cpu().numpy().flatten().tolist()
            }
            
        # Output Heads
        phase_logits = self.head_phase(a3)
        
        # Timing regression with softplus/sigmoid offset to ensure positive, realistic green times [15s, 60s]
        raw_timing = self.head_timing(a3)
        timing_output = 15.0 + 45.0 * torch.sigmoid(raw_timing)
        
        risk_logits = self.head_risk(a3)
        
        return phase_logits, timing_output, risk_logits

    def get_parameter_count(self) -> Dict[str, int]:
        """Calculates total trainable weights and biases across the network."""
        total_params = sum(p.numel() for p in self.parameters())
        trainable_params = sum(p.numel() for p in self.parameters() if p.requires_grad)
        
        layer_breakdown = {
            "fc1 (14 -> 128)": 14 * 128 + 128,
            "fc2 (128 -> 64)": 128 * 64 + 64,
            "fc3 (64 -> 32)": 64 * 32 + 32,
            "head_phase (32 -> 4)": 32 * 4 + 4,
            "head_timing (32 -> 4)": 32 * 4 + 4,
            "head_risk (32 -> 3)": 32 * 3 + 3,
            "total_parameters": total_params,
            "trainable_parameters": trainable_params
        }
        return layer_breakdown


# =====================================================================
# Standalone Pure NumPy Reference Implementation for Viva Demonstration
# =====================================================================
class NumPyANNReference:
    """
    Pure NumPy implementation of a Multi-Layer Perceptron (MLP)
    demonstrating the exact mathematical formulas for Forward Propagation
    and Backpropagation (Gradient Descent) without deep learning libraries.
    """
    def __init__(self, layer_dims: List[int] = [14, 64, 32, 4], learning_rate: float = 0.01):
        self.layer_dims = layer_dims
        self.lr = learning_rate
        self.weights: Dict[str, np.ndarray] = {}
        self.biases: Dict[str, np.ndarray] = {}
        
        np.random.seed(42)
        for l in range(1, len(layer_dims)):
            self.weights[f"W{l}"] = np.random.randn(layer_dims[l], layer_dims[l-1]) * np.sqrt(2.0 / layer_dims[l-1])
            self.biases[f"b{l}"] = np.zeros((layer_dims[l], 1))
            
    def relu(self, Z: np.ndarray) -> np.ndarray:
        return np.maximum(0, Z)
        
    def relu_derivative(self, Z: np.ndarray) -> np.ndarray:
        return (Z > 0).astype(float)
        
    def softmax(self, Z: np.ndarray) -> np.ndarray:
        exp_Z = np.exp(Z - np.max(Z, axis=0, keepdims=True))
        return exp_Z / np.sum(exp_Z, axis=0, keepdims=True)
        
    def forward_pass(self, X: np.ndarray) -> Tuple[np.ndarray, Dict]:
        caches = {"A0": X}
        A = X
        L = len(self.layer_dims) - 1
        
        for l in range(1, L):
            Z = np.dot(self.weights[f"W{l}"], A) + self.biases[f"b{l}"]
            A = self.relu(Z)
            caches[f"Z{l}"] = Z
            caches[f"A{l}"] = A
            
        ZL = np.dot(self.weights[f"W{L}"], A) + self.biases[f"b{L}"]
        AL = self.softmax(ZL)
        caches[f"Z{L}"] = ZL
        caches[f"A{L}"] = AL
        
        return AL, caches
        
    def compute_loss(self, AL: np.ndarray, Y: np.ndarray) -> float:
        m = Y.shape[1]
        loss = - (1.0 / m) * np.sum(Y * np.log(AL + 1e-15))
        return float(loss)
        
    def backward_pass(self, AL: np.ndarray, Y: np.ndarray, caches: Dict) -> Dict:
        m = Y.shape[1]
        grads = {}
        L = len(self.layer_dims) - 1
        
        dZL = AL - Y
        grads[f"dW{L}"] = (1.0 / m) * np.dot(dZL, caches[f"A{L-1}"].T)
        grads[f"db{L}"] = (1.0 / m) * np.sum(dZL, axis=1, keepdims=True)
        
        dZ_curr = dZL
        for l in reversed(range(1, L)):
            dA_prev = np.dot(self.weights[f"W{l+1}"].T, dZ_curr)
            dZ_curr = dA_prev * self.relu_derivative(caches[f"Z{l}"])
            grads[f"dW{l}"] = (1.0 / m) * np.dot(dZ_curr, caches[f"A{l-1}"].T)
            grads[f"db{l}"] = (1.0 / m) * np.sum(dZ_curr, axis=1, keepdims=True)
            
        return grads
        
    def update_parameters(self, grads: Dict):
        L = len(self.layer_dims) - 1
        for l in range(1, L + 1):
            self.weights[f"W{l}"] -= self.lr * grads[f"dW{l}"]
            self.biases[f"b{l}"] -= self.lr * grads[f"db{l}"]
