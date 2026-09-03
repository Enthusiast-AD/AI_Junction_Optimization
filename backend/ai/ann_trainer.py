"""
Artificial Neural Network (ANN) Training and Evaluation Pipeline.
Trains the Multi-Task TrafficOptimizationANN using PyTorch with:
- Backpropagation & Gradient Descent (Adam/SGD/RMSProp)
- Multi-Task Loss Optimization (Cross-Entropy + MSE Loss)
- Learning Rate Scheduling (ReduceLROnPlateau)
- Evaluation Metrics: Confusion Matrix, MAE, RMSE, R² Score, Accuracy
- Model Weight Checkpointing (.pth)
"""

import os
import json
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional
from sklearn.metrics import confusion_matrix, r2_score, mean_squared_error, mean_absolute_error, accuracy_score

try:
    from ai.ann_model import TrafficOptimizationANN, NUM_FEATURES
    from ai.dataset_generator import generate_and_save_dataset, DATASET_PATH, SCALER_PATH
except ImportError:
    try:
        from .ann_model import TrafficOptimizationANN, NUM_FEATURES
        from .dataset_generator import generate_and_save_dataset, DATASET_PATH, SCALER_PATH
    except ImportError:
        from ann_model import TrafficOptimizationANN, NUM_FEATURES
        from dataset_generator import generate_and_save_dataset, DATASET_PATH, SCALER_PATH

WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")
MODEL_PATH = os.path.join(WEIGHTS_DIR, "traffic_ann.pth")
METRICS_PATH = os.path.join(WEIGHTS_DIR, "training_metrics.json")


class TrafficDataset(Dataset):
    """PyTorch Dataset for Traffic Optimization."""
    def __init__(self, X: np.ndarray, y_phase: np.ndarray, y_timing: np.ndarray, y_risk: np.ndarray):
        self.X = torch.tensor(X, dtype=torch.float32)
        self.y_phase = torch.tensor(y_phase, dtype=torch.long)
        self.y_timing = torch.tensor(y_timing, dtype=torch.float32)
        self.y_risk = torch.tensor(y_risk, dtype=torch.long)
        
    def __len__(self):
        return len(self.X)
        
    def __getitem__(self, idx):
        return self.X[idx], self.y_phase[idx], self.y_timing[idx], self.y_risk[idx]


def prepare_data_loaders(
    batch_size: int = 64, 
    test_size: float = 0.15, 
    val_size: float = 0.15
) -> Tuple[DataLoader, DataLoader, DataLoader, Dict]:
    """Loads dataset, standardizes features, and creates train/val/test PyTorch DataLoaders."""
    if not os.path.exists(DATASET_PATH) or not os.path.exists(SCALER_PATH):
        generate_and_save_dataset()
        
    df = pd.read_csv(DATASET_PATH)
    with open(SCALER_PATH, "r") as f:
        scaler = json.load(f)
        
    feature_cols = scaler["feature_names"]
    
    # Feature Standardization: X' = (X - mean) / std
    X_raw = df[feature_cols].values
    means = np.array([scaler["mean"][col] for col in feature_cols])
    stds = np.array([scaler["std"][col] for col in feature_cols])
    X = (X_raw - means) / stds
    
    y_phase = df["target_phase"].values
    y_timing = df[["target_timing_north", "target_timing_south", "target_timing_east", "target_timing_west"]].values
    y_risk = df["target_risk"].values
    
    # Stratified Train/Val/Test Split
    n_samples = len(X)
    indices = np.random.RandomState(42).permutation(n_samples)
    
    n_test = int(n_samples * test_size)
    n_val = int(n_samples * val_size)
    n_train = n_samples - n_val - n_test
    
    train_idx = indices[:n_train]
    val_idx = indices[n_train:n_train + n_val]
    test_idx = indices[n_train + n_val:]
    
    train_ds = TrafficDataset(X[train_idx], y_phase[train_idx], y_timing[train_idx], y_risk[train_idx])
    val_ds = TrafficDataset(X[val_idx], y_phase[val_idx], y_timing[val_idx], y_risk[val_idx])
    test_ds = TrafficDataset(X[test_idx], y_phase[test_idx], y_timing[test_idx], y_risk[test_idx])
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False)
    
    metadata = {
        "total_samples": n_samples,
        "train_samples": n_train,
        "val_samples": n_val,
        "test_samples": n_test
    }
    
    return train_loader, val_loader, test_loader, metadata


def train_model(
    epochs: int = 40,
    learning_rate: float = 0.003,
    batch_size: int = 64,
    optimizer_type: str = "adam",
    activation_type: str = "relu",
    dropout_rate: float = 0.2,
    progress_callback = None
) -> Dict[str, Any]:
    """
    Executes the training and backpropagation loop.
    Returns complete metrics, training loss history, and confusion matrix.
    """
    os.makedirs(WEIGHTS_DIR, exist_ok=True)
    
    train_loader, val_loader, test_loader, split_meta = prepare_data_loaders(batch_size=batch_size)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu")
    print(f"Training on device: {device}")
    
    model = TrafficOptimizationANN(
        input_dim=NUM_FEATURES, 
        dropout_rate=dropout_rate, 
        activation_type=activation_type
    ).to(device)
    
    # Loss functions for Multi-Task Learning
    criterion_phase = nn.CrossEntropyLoss()
    criterion_timing = nn.MSELoss()
    criterion_risk = nn.CrossEntropyLoss()
    
    # Optimizer selection
    opt_lower = optimizer_type.lower()
    if opt_lower == "sgd":
        optimizer = optim.SGD(model.parameters(), lr=learning_rate, momentum=0.9, weight_decay=1e-4)
    elif opt_lower == "rmsprop":
        optimizer = optim.RMSprop(model.parameters(), lr=learning_rate, weight_decay=1e-4)
    else: # Adam default
        optimizer = optim.Adam(model.parameters(), lr=learning_rate, weight_decay=1e-4)
        
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=4)
    
    history = {
        "epoch": [],
        "train_loss": [],
        "val_loss": [],
        "train_phase_acc": [],
        "val_phase_acc": [],
        "timing_mae": [],
        "lr": []
    }
    
    start_time = time.time()
    best_val_loss = float("inf")
    
    for epoch in range(1, epochs + 1):
        model.train()
        running_train_loss = 0.0
        correct_phase = 0
        total_samples = 0
        
        for X_b, y_phase_b, y_timing_b, y_risk_b in train_loader:
            X_b = X_b.to(device)
            y_phase_b = y_phase_b.to(device)
            y_timing_b = y_timing_b.to(device)
            y_risk_b = y_risk_b.to(device)
            
            optimizer.zero_grad()
            
            # Forward Pass
            pred_phase, pred_timing, pred_risk = model(X_b)
            
            # Compute Multi-Task Loss: L = L_phase + 0.05 * L_timing + 0.3 * L_risk
            loss_p = criterion_phase(pred_phase, y_phase_b)
            loss_t = criterion_timing(pred_timing, y_timing_b)
            loss_r = criterion_risk(pred_risk, y_risk_b)
            total_loss = loss_p + 0.05 * loss_t + 0.3 * loss_r
            
            # Backpropagation (Gradient Descent)
            total_loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            
            running_train_loss += total_loss.item() * X_b.size(0)
            preds = torch.argmax(pred_phase, dim=1)
            correct_phase += (preds == y_phase_b).sum().item()
            total_samples += X_b.size(0)
            
        epoch_train_loss = running_train_loss / total_samples
        epoch_train_acc = (correct_phase / total_samples) * 100.0
        
        # Validation Pass
        model.eval()
        running_val_loss = 0.0
        val_correct_phase = 0
        val_total = 0
        val_timing_diffs = []
        
        with torch.no_grad():
            for X_b, y_phase_b, y_timing_b, y_risk_b in val_loader:
                X_b = X_b.to(device)
                y_phase_b = y_phase_b.to(device)
                y_timing_b = y_timing_b.to(device)
                y_risk_b = y_risk_b.to(device)
                
                pred_phase, pred_timing, pred_risk = model(X_b)
                
                loss_p = criterion_phase(pred_phase, y_phase_b)
                loss_t = criterion_timing(pred_timing, y_timing_b)
                loss_r = criterion_risk(pred_risk, y_risk_b)
                total_loss = loss_p + 0.05 * loss_t + 0.3 * loss_r
                
                running_val_loss += total_loss.item() * X_b.size(0)
                preds = torch.argmax(pred_phase, dim=1)
                val_correct_phase += (preds == y_phase_b).sum().item()
                val_total += X_b.size(0)
                
                val_timing_diffs.append(torch.abs(pred_timing - y_timing_b).cpu().numpy())
                
        epoch_val_loss = running_val_loss / val_total
        epoch_val_acc = (val_correct_phase / val_total) * 100.0
        epoch_timing_mae = float(np.mean(np.vstack(val_timing_diffs)))
        
        current_lr = optimizer.param_groups[0]["lr"]
        scheduler.step(epoch_val_loss)
        
        history["epoch"].append(epoch)
        history["train_loss"].append(round(epoch_train_loss, 4))
        history["val_loss"].append(round(epoch_val_loss, 4))
        history["train_phase_acc"].append(round(epoch_train_acc, 2))
        history["val_phase_acc"].append(round(epoch_val_acc, 2))
        history["timing_mae"].append(round(epoch_timing_mae, 2))
        history["lr"].append(current_lr)
        
        # Save best weights
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            torch.save(model.state_dict(), MODEL_PATH)
            
        if progress_callback:
            progress_callback(epoch, epochs, epoch_train_loss, epoch_val_loss, epoch_val_acc)
            
        if epoch % 5 == 0 or epoch == epochs:
            print(f"Epoch [{epoch:02d}/{epochs:02d}] | Train Loss: {epoch_train_loss:.4f} | Val Loss: {epoch_val_loss:.4f} | Val Phase Acc: {epoch_val_acc:.2f}% | Timing MAE: {epoch_timing_mae:.2f}s")
            
    training_time_s = round(time.time() - start_time, 2)
    
    # Final Test Set Evaluation
    model.load_state_dict(torch.load(MODEL_PATH))
    model.eval()
    
    all_preds_phase = []
    all_targets_phase = []
    all_preds_timing = []
    all_targets_timing = []
    all_preds_risk = []
    all_targets_risk = []
    
    with torch.no_grad():
        for X_b, y_phase_b, y_timing_b, y_risk_b in test_loader:
            X_b = X_b.to(device)
            pred_p, pred_t, pred_r = model(X_b)
            
            all_preds_phase.extend(torch.argmax(pred_p, dim=1).cpu().numpy())
            all_targets_phase.extend(y_phase_b.numpy())
            
            all_preds_timing.extend(pred_t.cpu().numpy())
            all_targets_timing.extend(y_timing_b.numpy())
            
            all_preds_risk.extend(torch.argmax(pred_r, dim=1).cpu().numpy())
            all_targets_risk.extend(y_risk_b.numpy())
            
    all_preds_timing = np.array(all_preds_timing)
    all_targets_timing = np.array(all_targets_timing)
    
    phase_acc = float(accuracy_score(all_targets_phase, all_preds_phase) * 100.0)
    cm = confusion_matrix(all_targets_phase, all_preds_phase).tolist()
    
    timing_mae = float(mean_absolute_error(all_targets_timing, all_preds_timing))
    timing_mse = float(mean_squared_error(all_targets_timing, all_preds_timing))
    timing_rmse = float(np.sqrt(timing_mse))
    timing_r2 = float(r2_score(all_targets_timing, all_preds_timing))
    
    risk_acc = float(accuracy_score(all_targets_risk, all_preds_risk) * 100.0)
    
    metrics_summary = {
        "status": "success",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_time_seconds": training_time_s,
        "hyperparameters": {
            "epochs": epochs,
            "learning_rate": learning_rate,
            "batch_size": batch_size,
            "optimizer": optimizer_type,
            "activation": activation_type,
            "dropout": dropout_rate
        },
        "model_architecture": model.get_parameter_count(),
        "split_metadata": split_meta,
        "test_metrics": {
            "phase_classification_accuracy": round(phase_acc, 2),
            "timing_mae_seconds": round(timing_mae, 2),
            "timing_rmse_seconds": round(timing_rmse, 2),
            "timing_r2_score": round(timing_r2, 4),
            "risk_classification_accuracy": round(risk_acc, 2),
            "confusion_matrix": cm,
            "confusion_labels": ["North", "South", "East", "West"]
        },
        "history": history
    }
    
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_summary, f, indent=2)
        
    print(f"Training complete in {training_time_s}s. Test Phase Acc: {phase_acc:.2f}%, Timing R2: {timing_r2:.4f}")
    return metrics_summary


if __name__ == "__main__":
    train_model(epochs=30)
