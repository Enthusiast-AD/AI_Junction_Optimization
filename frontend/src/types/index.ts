export interface LaneData {
  vehicle_count: number;
  density_percent: number;
  avg_wait_seconds: number;
  throughput_last_minute: number;
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
  max_wait_seconds: number;
  total_vehicles_cleared: number;
  avg_phase_duration_seconds: number;
  emergency_response_time_seconds: number;
}

export interface JunctionState {
  timestamp: string;
  lanes: Record<string, LaneData>;
  current_phase: string;
  phase_elapsed_seconds: number;
  phase_duration_seconds: number;
  emergency_active: boolean;
  emergency_direction: string | null;
  ai_decision: AIDecision | null;
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
