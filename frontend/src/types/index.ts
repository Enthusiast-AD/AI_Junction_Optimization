export interface LaneData {
  vehicle_count: number;
  density_percent: number;
  avg_wait_seconds: number;
  throughput_last_minute: number;
  inflow_rate_per_minute?: number;
  queue_length_meters?: number;
}

export interface AIDecision {
  recommended_phase: string;
  duration_seconds: number;
  reason: string;
  confidence: number;
  model_used: string;
  latency_ms: number;
}

export interface PerformanceMetrics {
  avg_wait_seconds: number;
  total_vehicles_cleared: number;
  max_wait_seconds?: number;
  avg_phase_duration_seconds?: number;
  emergency_response_time_seconds?: number;
  fuel_saved_liters?: number;
  co2_reduced_kg?: number;
  fixed_timer_comparative_delay?: number;
  delay_reduction_percent?: number;
}

export interface JunctionState {
  timestamp: string;
  lanes: Record<string, LaneData>;
  current_phase: string;
  signal_color?: 'green' | 'yellow' | 'all_red';
  phase_elapsed_seconds: number;
  phase_duration_seconds: number;
  emergency_active: boolean;
  emergency_direction: string | null;
  active_scenario?: string;
  is_paused?: boolean;
  simulation_speed?: number;
  ai_decision: AIDecision | null;
  performance?: PerformanceMetrics;
  neural_activations?: Record<string, number[]> | null;
}

export interface DensityDataPoint {
  timestamp: string;
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface CongestionPrediction {
  generated_at: string;
  congestion_risk: 'low' | 'medium' | 'high';
  predicted_peak_lane: string;
  predicted_peak_in_minutes: number;
  recommendation: string;
  summary: string;
  model_used: string;
}

export interface SaliencyFactor {
  feature: string;
  importance_percent: number;
  index: number;
}

export interface ANNArchitecture {
  model_name: string;
  framework: string;
  input_features: number;
  total_parameters: number;
  trainable_parameters: number;
  layer_breakdown: Record<string, number>;
  topology: Array<{
    layer: string;
    neurons: number;
    type: string;
    activation: string;
    features?: string[];
  }>;
}

export interface ANNMetrics {
  status: string;
  timestamp: string;
  training_time_seconds: number;
  hyperparameters: {
    epochs: number;
    learning_rate: number;
    batch_size: number;
    optimizer: string;
    activation: string;
    dropout: number;
  };
  model_architecture: Record<string, number>;
  test_metrics: {
    phase_classification_accuracy: number;
    timing_mae_seconds: number;
    timing_rmse_seconds: number;
    timing_r2_score: number;
    risk_classification_accuracy: number;
    confusion_matrix: number[][];
    confusion_labels: string[];
  };
  history: {
    epoch: number[];
    train_loss: number[];
    val_loss: number[];
    train_phase_acc: number[];
    val_phase_acc: number[];
    timing_mae: number[];
    lr: number[];
  };
}

export interface BenchmarkController {
  name: string;
  type: string;
  avg_wait_time_seconds: number;
  throughput_veh_per_hour: number;
  delay_reduction_vs_fixed: string;
  inference_latency_ms: number;
  offline_capable: boolean;
  api_cost_per_million: string;
  starvation_prevention: string;
}

export interface BenchmarkResponse {
  controllers: BenchmarkController[];
  live_simulation_stats: {
    current_scenario: string;
    ann_avg_wait_seconds: number;
    fixed_timer_simulated_wait_seconds: number;
    delay_saved_percent: number;
    fuel_saved_liters: number;
    co2_reduced_kg: number;
  };
}
